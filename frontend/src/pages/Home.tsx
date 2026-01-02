import { Link } from 'react-router-dom'
import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    if (window.lucide) {
      window.lucide.createIcons()
    }
  }, [])

  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center px-6 pt-20 overflow-hidden border-b border-zinc-900">
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <i data-lucide="shopping-bag" className="absolute top-1/4 left-1/4 w-32 h-32 text-zinc-900 opacity-20 -rotate-12"></i>
        <i data-lucide="heart" className="absolute bottom-1/4 right-1/4 w-40 h-40 text-zinc-900 opacity-20 rotate-6"></i>
        <i data-lucide="image" className="absolute top-1/3 right-10 w-24 h-24 text-zinc-900 opacity-20 rotate-45"></i>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm text-xs font-mono text-neon reveal-on-scroll">
          <span className="w-2 h-2 rounded-full bg-neon animate-pulse"></span>
          E-COMMERCE × SOCIAL MEDIA
        </div>
        
        <h1 className="font-display font-semibold text-5xl md:text-7xl lg:text-8xl tracking-tighter leading-[0.95] text-white reveal-on-scroll delay-100">
          Shop. Share. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-400 to-zinc-600">Connect.</span>
        </h1>

        <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed reveal-on-scroll delay-200">
          Discover products. Share your style.<br />
          <span className="text-zinc-200">All in one place.</span>
        </p>

        <div className="pt-8 flex gap-4 justify-center reveal-on-scroll delay-300">
          <Link to="/products" className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-black transition-all duration-200 bg-neon rounded-none hover:bg-white focus:outline-none">
            Shop Now
            <i data-lucide="arrow-right" className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"></i>
            <div className="absolute inset-0 -z-10 translate-x-2 translate-y-2 border border-zinc-700 bg-transparent transition-transform group-hover:translate-x-1 group-hover:translate-y-1"></div>
          </Link>
          <Link to="/explore" className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white border border-zinc-700 hover:border-neon transition-colors">
            Explore
            <i data-lucide="compass" className="w-5 h-5 ml-2"></i>
          </Link>
        </div>
      </div>
    </section>
  )
}
