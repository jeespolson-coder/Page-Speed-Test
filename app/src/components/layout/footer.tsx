export function Footer() {
    return (
        <footer className="py-12 border-t border-white/10 bg-black/50 backdrop-blur-md">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white">SpeedCast</h3>
                        <p className="text-sm text-zinc-500">
                            The fastest way to analyze your web performance. Built for the modern web.
                        </p>
                    </div>
                    {/* Columns... simplified for now */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Product</h4>
                        <ul className="space-y-2 text-sm text-zinc-500">
                            <li><a href="#" className="hover:text-indigo-400">Features</a></li>
                            <li><a href="#" className="hover:text-indigo-400">Integrations</a></li>
                            <li><a href="#" className="hover:text-indigo-400">Pricing</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-zinc-500">
                            <li><a href="#" className="hover:text-indigo-400">About</a></li>
                            <li><a href="#" className="hover:text-indigo-400">Blog</a></li>
                            <li><a href="#" className="hover:text-indigo-400">Careers</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-zinc-500">
                            <li><a href="#" className="hover:text-indigo-400">Privacy</a></li>
                            <li><a href="#" className="hover:text-indigo-400">Terms</a></li>
                        </ul>
                    </div>
                </div>
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-zinc-600 text-sm">© 2026 SpeedCast Inc. All rights reserved.</p>
                    <div className="flex gap-4">
                        {/* Social icons placeholder */}
                        <div className="w-5 h-5 bg-zinc-800 rounded-full" />
                        <div className="w-5 h-5 bg-zinc-800 rounded-full" />
                        <div className="w-5 h-5 bg-zinc-800 rounded-full" />
                    </div>
                </div>
            </div>
        </footer>
    )
}
