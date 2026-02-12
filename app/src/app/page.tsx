"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowRight, Zap, Globe, Shield, Smartphone, Monitor, Loader2, CheckCircle, AlertTriangle } from "lucide-react"
import { useSpeedTest } from "@/hooks/use-speed-test"
import { exportAnalysisPDF } from "@/lib/export-pdf"

export default function Home() {
  const [url, setUrl] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState<"mobile" | "desktop">("mobile")
  const [showResults, setShowResults] = useState(false)
  const [mobileResults, setMobileResults] = useState<any>(null)
  const [desktopResults, setDesktopResults] = useState<any>(null)
  const [error, setError] = useState("")
  const { result: speedTestResult, runTest: runSpeedTest } = useSpeedTest()

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return

    setIsAnalyzing(true)
    setShowResults(false)
    setError("")
    setMobileResults(null)
    setDesktopResults(null)

    try {
      // Fetch both mobile and desktop results in parallel
      const [mobileRes, desktopRes] = await Promise.all([
        fetch(`/api/analyze?url=${encodeURIComponent(url)}&strategy=mobile`),
        fetch(`/api/analyze?url=${encodeURIComponent(url)}&strategy=desktop`),
      ])

      const [mobileData, desktopData] = await Promise.all([
        mobileRes.json(),
        desktopRes.json(),
      ])

      if (mobileData.error && desktopData.error) {
        setError(mobileData.error)
      } else {
        if (!mobileData.error) setMobileResults(mobileData)
        if (!desktopData.error) setDesktopResults(desktopData)
        setActiveTab("mobile")
        setShowResults(true)
        // Scroll to results
        setTimeout(() => {
          const resultsElement = document.getElementById("results")
          if (resultsElement) {
            resultsElement.scrollIntoView({ behavior: "smooth" })
          }
        }, 100)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500"
    if (score >= 50) return "text-yellow-500"
    return "text-red-500"
  }

  const getMetricStatus = (score: number) => {
    // PSI API returns scores 0-1. 1 is perfect.
    if (score >= 0.9) return "Good"
    if (score >= 0.5) return "Needs Improvement"
    return "Poor"
  }

  const activeResults = activeTab === "mobile" ? mobileResults : desktopResults

  return (
    <div className="min-h-screen bg-black text-foreground selection:bg-indigo-500/30">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] -z-10" />

        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-zinc-400 mb-8 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>v2.1 Real-Time Analysis</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
              Web Performance <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Reimagined</span>
            </h1>
            <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Analyze your website's speed, accessibility, and SEO with Google PageSpeed Insights data.
            </p>
          </motion.div>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl mx-auto relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <form onSubmit={handleAnalyze} className="relative flex items-center p-2 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl">
              <Globe className="w-6 h-6 text-zinc-500 ml-3" />
              <input
                type="text"
                placeholder="Enter website URL (e.g. https://google.com)"
                className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-zinc-600 px-4 h-12"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <Button size="lg" variant="premium" className="rounded-xl min-w-[140px]" disabled={isAnalyzing}>
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing
                  </>
                ) : (
                  <>
                    Analyze <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
            {error && <p className="text-red-500 mt-4">{error}</p>}
          </motion.div>

        </div>
      </section>

      {/* Results Section */}
      <AnimatePresence>
        {showResults && (mobileResults || desktopResults) && (
          <motion.section
            id="results"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="py-12 bg-zinc-900/30 border-y border-white/5"
          >
            <div className="container mx-auto px-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">Analysis Results</h2>
                  <p className="text-zinc-400">Report for <span className="text-indigo-400">{url}</span></p>
                </div>
                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => { setShowResults(false); setUrl(""); setMobileResults(null); setDesktopResults(null); }}>New Test</Button>
                  <Button variant="premium" onClick={() => exportAnalysisPDF(url, mobileResults, desktopResults)}>Export PDF</Button>
                </div>
              </div>

              {/* Mobile / Desktop Tab Switcher */}
              <div className="flex justify-center mb-10">
                <div className="bg-white/5 border border-white/10 p-1 rounded-full flex gap-1 backdrop-blur-md">
                  <button
                    type="button"
                    onClick={() => setActiveTab("mobile")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${activeTab === "mobile" ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "text-zinc-400 hover:text-white"}`}
                    disabled={!mobileResults}
                  >
                    <Smartphone className="w-4 h-4" /> Phone
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("desktop")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${activeTab === "desktop" ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20" : "text-zinc-400 hover:text-white"}`}
                    disabled={!desktopResults}
                  >
                    <Monitor className="w-4 h-4" /> Desktop
                  </button>
                </div>
              </div>

              {activeResults ? (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <ScoreCard title="Performance" score={activeResults.scores.performance} color={getScoreColor(activeResults.scores.performance)} />
                    <ScoreCard title="Accessibility" score={activeResults.scores.accessibility} color={getScoreColor(activeResults.scores.accessibility)} />
                    <ScoreCard title="Best Practices" score={activeResults.scores.bestPractices} color={getScoreColor(activeResults.scores.bestPractices)} />
                    <ScoreCard title="SEO" score={activeResults.scores.seo} color={getScoreColor(activeResults.scores.seo)} />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-2 glass-card">
                      <CardHeader>
                        <CardTitle>Core Web Vitals</CardTitle>
                        <CardDescription>
                          {activeTab === "mobile" ? "Mobile" : "Desktop"} user experience metrics.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <MetricBox label="LCP" value={activeResults.metrics.lcp} status={getMetricStatus(activeResults.metrics.lcpScore)} icon={<Zap className="w-5 h-5 text-green-500" />} />
                        <MetricBox label="TBT" value={activeResults.metrics.tbt} status="N/A" icon={activeTab === "mobile" ? <Smartphone className="w-5 h-5 text-green-500" /> : <Monitor className="w-5 h-5 text-green-500" />} />
                        <MetricBox label="CLS" value={activeResults.metrics.cls} status={getMetricStatus(activeResults.metrics.clsScore)} icon={<AlertTriangle className="w-5 h-5 text-green-500" />} />
                      </CardContent>
                    </Card>
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle>Optimization Tips</CardTitle>
                        <CardDescription>Top priority fixes.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex gap-3 items-start p-3 rounded-lg bg-white/5 border border-white/5">
                          <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-white">Optimize Images</p>
                            <p className="text-xs text-zinc-400">Serve images in next-gen formats.</p>
                          </div>
                        </div>
                        <div className="flex gap-3 items-start p-3 rounded-lg bg-white/5 border border-white/5">
                          <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-white">Minify CSS</p>
                            <p className="text-xs text-zinc-400">Reduce payload size by 15KB.</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-12 text-zinc-400">
                  <p>No results available for {activeTab === "mobile" ? "Phone" : "Desktop"} analysis.</p>
                </div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Features Grid */}
      <section id="features" className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-indigo-400" />}
              title="Lightning Fast"
              description="Our edge network ensures analysis completes in seconds, not minutes."
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8 text-purple-400" />}
              title="Security First"
              description="Enterprise-grade security scanning included in every report."
            />
            <FeatureCard
              icon={<Smartphone className="w-8 h-8 text-pink-400" />}
              title="Mobile Perfect"
              description="Simulate real-world mobile devices with precise throttling."
            />
          </div>
        </div>
      </section>

      {/* Speed Test Section */}
      <section className="py-24 relative bg-zinc-900/20 border-b border-white/5">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Internet Speed Test</h2>
          <p className="text-zinc-400 mb-12 max-w-2xl mx-auto">
            Check your connection's download, upload, and latency in seconds.
          </p>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <SpeedCard title="Download" value={speedTestResult.download} unit="Mbps" loading={speedTestResult.loading && !speedTestResult.download} />
            <SpeedCard title="Upload" value={speedTestResult.upload} unit="Mbps" loading={speedTestResult.loading && !!speedTestResult.download && !speedTestResult.upload} />
            <SpeedCard title="Ping" value={speedTestResult.ping} unit="ms" loading={speedTestResult.loading && !speedTestResult.ping} />
          </div>

          <Button
            size="lg"
            className="h-16 px-10 text-lg rounded-full bg-indigo-500 hover:bg-indigo-600 text-white shadow-[0_0_30px_rgba(99,102,241,0.5)]"
            onClick={runSpeedTest}
            disabled={speedTestResult.loading}
          >
            {speedTestResult.loading ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : "Start Speed Test"}
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group p-8 rounded-3xl bg-zinc-900/50 border border-white/5 hover:bg-zinc-900/80 transition-all duration-300 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[50px] -mr-16 -mt-16 transition-opacity opacity-0 group-hover:opacity-100" />

      <div className="mb-6 p-4 rounded-2xl bg-black/50 border border-white/5 w-fit">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-zinc-400 leading-relaxed">
        {description}
      </p>
    </motion.div>
  )
}

function ScoreCard({ title, score, color }: { title: string, score: number, color: string }) {
  const radius = 44
  const circumference = 2 * Math.PI * radius

  return (
    <Card className="glass-card flex flex-col items-center justify-center p-6 bg-zinc-900/40">
      <div className="relative flex items-center justify-center w-24 h-24 mb-4">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background Track */}
          <circle
            cx="48" cy="48" r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="4"
            className="text-white/10"
          />
          {/* Progress Circle */}
          <circle
            cx="48" cy="48" r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="4"
            className={color}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (circumference * score) / 100}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-3xl font-bold ${color}`}>{score}</span>
        </div>
      </div>
      <h3 className="font-medium text-zinc-300">{title}</h3>
    </Card>
  )
}

function MetricBox({ label, value, status, icon }: { label: string, value: string, status: string, icon: React.ReactNode }) {
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center gap-4">
      <div className="p-3 rounded-lg bg-black/50">
        {icon}
      </div>
      <div>
        <p className="text-sm text-zinc-400">{label}</p>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-white">{value}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">{status}</span>
        </div>
      </div>
    </div>
  )
}

function SpeedCard({ title, value, unit, loading }: { title: string, value: number | null, unit: string, loading: boolean }) {
  return (
    <Card className="glass-card p-8 flex flex-col items-center justify-center min-h-[200px]">
      <h3 className="text-zinc-400 text-lg font-medium mb-4">{title}</h3>
      {loading ? (
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      ) : (
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-bold text-white">{value !== null ? value : "--"}</span>
          <span className="text-sm text-zinc-500 font-medium">{unit}</span>
        </div>
      )}
    </Card>
  )
}
