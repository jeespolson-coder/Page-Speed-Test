import jsPDF from "jspdf"

interface AnalysisResults {
    scores: {
        performance: number
        accessibility: number
        bestPractices: number
        seo: number
    }
    metrics: {
        lcp: string
        lcpScore: number
        fid: string
        cls: string
        clsScore: number
        fcp: string
        tbt: string
        si: string
    }
}

function getScoreLabel(score: number): string {
    if (score >= 90) return "Good"
    if (score >= 50) return "Needs Improvement"
    return "Poor"
}

function getScoreRGB(score: number): [number, number, number] {
    if (score >= 90) return [34, 197, 94]    // green
    if (score >= 50) return [234, 179, 8]    // yellow
    return [239, 68, 68]                      // red
}

export function exportAnalysisPDF(
    url: string,
    mobileResults: AnalysisResults | null,
    desktopResults: AnalysisResults | null
) {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    let y = 20

    // ─── Header ───────────────────────────────────────────────
    doc.setFillColor(15, 15, 20)
    doc.rect(0, 0, pageWidth, 50, "F")

    doc.setFont("helvetica", "bold")
    doc.setFontSize(22)
    doc.setTextColor(255, 255, 255)
    doc.text("PageSpeed Analysis Report", 20, 28)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.setTextColor(160, 160, 180)
    doc.text(`URL: ${url}`, 20, 38)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 44)

    y = 62

    // Helper to draw a score gauge
    const drawScoreSection = (
        label: string,
        results: AnalysisResults,
        startY: number
    ): number => {
        let cy = startY

        // Section Header
        doc.setFont("helvetica", "bold")
        doc.setFontSize(16)
        doc.setTextColor(40, 40, 50)
        doc.text(`${label} Results`, 20, cy)
        cy += 4

        // Underline
        doc.setDrawColor(99, 102, 241)
        doc.setLineWidth(0.8)
        doc.line(20, cy, pageWidth - 20, cy)
        cy += 12

        // ── Score Cards Row ──
        const scores = [
            { name: "Performance", value: results.scores.performance },
            { name: "Accessibility", value: results.scores.accessibility },
            { name: "Best Practices", value: results.scores.bestPractices },
            { name: "SEO", value: results.scores.seo },
        ]

        const cardWidth = (pageWidth - 60) / 4
        scores.forEach((score, i) => {
            const x = 20 + i * (cardWidth + 8)

            // Card background
            doc.setFillColor(245, 245, 250)
            doc.roundedRect(x, cy, cardWidth, 45, 3, 3, "F")

            // Score number
            const [r, g, b] = getScoreRGB(score.value)
            doc.setFont("helvetica", "bold")
            doc.setFontSize(28)
            doc.setTextColor(r, g, b)
            doc.text(String(score.value), x + cardWidth / 2, cy + 22, { align: "center" })

            // Score label
            doc.setFont("helvetica", "normal")
            doc.setFontSize(8)
            doc.setTextColor(100, 100, 120)
            doc.text(score.name, x + cardWidth / 2, cy + 32, { align: "center" })

            // Status label
            doc.setFontSize(7)
            doc.setTextColor(r, g, b)
            doc.text(getScoreLabel(score.value), x + cardWidth / 2, cy + 39, { align: "center" })
        })

        cy += 55

        // ── Core Web Vitals ──
        doc.setFont("helvetica", "bold")
        doc.setFontSize(13)
        doc.setTextColor(40, 40, 50)
        doc.text("Core Web Vitals", 20, cy)
        cy += 8

        const metrics = [
            { name: "Largest Contentful Paint (LCP)", value: results.metrics.lcp, score: results.metrics.lcpScore },
            { name: "Cumulative Layout Shift (CLS)", value: results.metrics.cls, score: results.metrics.clsScore },
            { name: "Total Blocking Time (TBT)", value: results.metrics.tbt, score: null },
            { name: "First Contentful Paint (FCP)", value: results.metrics.fcp, score: null },
            { name: "Speed Index (SI)", value: results.metrics.si, score: null },
        ]

        metrics.forEach((metric) => {
            // Metric row background
            doc.setFillColor(248, 248, 252)
            doc.roundedRect(20, cy, pageWidth - 40, 10, 2, 2, "F")

            // Name
            doc.setFont("helvetica", "normal")
            doc.setFontSize(9)
            doc.setTextColor(60, 60, 80)
            doc.text(metric.name, 24, cy + 7)

            // Value
            doc.setFont("helvetica", "bold")
            doc.setTextColor(30, 30, 40)
            doc.text(metric.value || "N/A", pageWidth - 24, cy + 7, { align: "right" })

            cy += 13
        })

        cy += 8
        return cy
    }

    // ─── Mobile Results ───
    if (mobileResults) {
        y = drawScoreSection("Mobile", mobileResults, y)
    }

    // ─── Desktop Results ───
    if (desktopResults) {
        // Check if we need a new page
        if (y > 180) {
            doc.addPage()
            y = 20
        }
        y = drawScoreSection("Desktop", desktopResults, y)
    }

    // ─── Footer ───
    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        const pageH = doc.internal.pageSize.getHeight()
        doc.setFillColor(245, 245, 250)
        doc.rect(0, pageH - 16, pageWidth, 16, "F")
        doc.setFont("helvetica", "normal")
        doc.setFontSize(8)
        doc.setTextColor(140, 140, 160)
        doc.text("Generated by PageSpeed Analyzer • Powered by Google PageSpeed Insights", 20, pageH - 6)
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - 20, pageH - 6, { align: "right" })
    }

    // ─── Save ───
    const sanitizedUrl = url.replace(/https?:\/\//, "").replace(/[^a-zA-Z0-9]/g, "_")
    doc.save(`pagespeed_report_${sanitizedUrl}.pdf`)
}
