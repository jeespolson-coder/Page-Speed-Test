"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Activity, Menu, X } from "lucide-react"

export function Navbar() {
    const [isScrolled, setIsScrolled] = React.useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <motion.header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "glass border-b border-white/10 py-4" : "py-6 bg-transparent"
                }`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 text-2xl font-bold tracking-tighter hover:opacity-80 transition-opacity">
                    <div className="p-2 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg">
                        <Activity className="w-6 h-6 text-white" />
                    </div>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                        SpeedCast
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    {["Features", "Pricing", "About"].map((item) => (
                        <Link key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                            {item}
                        </Link>
                    ))}
                </nav>

                <div className="hidden md:flex items-center gap-4">
                    <Button variant="ghost" className="text-zinc-400 hover:text-white">Sign In</Button>
                    <Button variant="premium" className="rounded-full px-6">
                        Get Started
                    </Button>
                </div>

                {/* Mobile Toggle */}
                <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:hidden absolute top-full left-0 right-0 glass border-b border-white/10 p-6 flex flex-col gap-4"
                >
                    {["Features", "Pricing", "About"].map((item) => (
                        <Link key={item} href={`#${item.toLowerCase()}`} className="text-lg font-medium text-zinc-300 hover:text-white">
                            {item}
                        </Link>
                    ))}
                    <div className="h-px bg-white/10 my-2" />
                    <Button variant="ghost" className="w-full justify-start text-zinc-400">Sign In</Button>
                    <Button variant="premium" className="w-full">Get Started</Button>
                </motion.div>
            )}
        </motion.header>
    )
}
