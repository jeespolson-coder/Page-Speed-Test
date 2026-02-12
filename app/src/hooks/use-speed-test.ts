import { useState } from "react"

export type SpeedTestResult = {
    ping: number | null
    download: number | null
    upload: number | null
    loading: boolean
    progress: number // 0-100
}

export function useSpeedTest() {
    const [result, setResult] = useState<SpeedTestResult>({
        ping: null,
        download: null,
        upload: null,
        loading: false,
        progress: 0
    })

    const runTest = async () => {
        setResult({ ping: null, download: null, upload: null, loading: true, progress: 0 })

        try {
            // 1. PING TEST — measure round-trip to Cloudflare edge (average of 3)
            const pings: number[] = []
            for (let i = 0; i < 3; i++) {
                const startPing = performance.now()
                await fetch(`https://speed.cloudflare.com/__down?bytes=0&_=${Date.now()}`, { cache: 'no-store' })
                const endPing = performance.now()
                pings.push(endPing - startPing)
            }
            // Use median for stability
            pings.sort((a, b) => a - b)
            const ping = Math.round(pings[1]) // median of 3
            setResult(prev => ({ ...prev, ping, progress: 20 }))

            // 2. DOWNLOAD TEST — stream 10MB from Cloudflare 
            const startDownload = performance.now()
            const downloadResponse = await fetch(`https://speed.cloudflare.com/__down?bytes=10000000&_=${Date.now()}`, { cache: 'no-store' })

            if (!downloadResponse.ok) throw new Error("Download test failed")

            const reader = downloadResponse.body?.getReader()
            if (!reader) throw new Error("Failed to get reader")

            let receivedLength = 0
            while (true) {
                const { done, value } = await reader.read()
                if (done) break
                receivedLength += value.length
            }

            const endDownload = performance.now()
            const downloadDuration = (endDownload - startDownload) / 1000
            const downloadBits = receivedLength * 8
            const downloadSpeed = (downloadBits / downloadDuration) / (1024 * 1024) // Mbps
            setResult(prev => ({ ...prev, download: parseFloat(downloadSpeed.toFixed(2)), progress: 60 }))

            // 3. UPLOAD TEST — send 2MB to Cloudflare's upload endpoint
            const uploadData = new Uint8Array(2 * 1024 * 1024) // 2MB
            // Fill with random data to prevent compression
            for (let i = 0; i < uploadData.length; i += 100) {
                uploadData[i] = Math.floor(Math.random() * 256)
            }

            const startUpload = performance.now()
            await fetch('https://speed.cloudflare.com/__up', {
                method: 'POST',
                body: uploadData,
                cache: 'no-store',
            })
            const endUpload = performance.now()
            const uploadDuration = (endUpload - startUpload) / 1000
            const uploadBits = uploadData.length * 8
            const uploadSpeed = (uploadBits / uploadDuration) / (1024 * 1024) // Mbps
            setResult(prev => ({ ...prev, upload: parseFloat(uploadSpeed.toFixed(2)), progress: 100, loading: false }))

        } catch (error) {
            console.error("Speed test error:", error)
            setResult(prev => ({ ...prev, loading: false, progress: 0 }))
        }
    }

    return { result, runTest }
}

