import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
  return (
    <header className="section_hero relative h-[85vh] w-full overflow-hidden bg-[#f0f0f0]">
      {/* Hero Background */}
      <div className="hero_background absolute inset-0 z-0">
        <Image 
          src="https://images.unsplash.com/photo-1538329972958-465d6d2144ed?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
          alt="Motorcycle Lifestyle" 
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
      </div>

      {/* Hero Content */}
      <div className="hero_content-wrapper absolute inset-0 z-10 flex items-end justify-start pointer-events-none">
        <div className="padding-global px-5 lg:px-20 w-full pb-12 lg:pb-20 pointer-events-auto">
          <div className="container-large max-w-[1792px] mx-auto">
            <div className="hero_content max-w-xl">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#a58c69] mb-4 opacity-0 animate-fade-up">
                Est. 2025
              </h2>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-wide leading-[1.1] text-white mb-8 opacity-0 animate-fade-up delay-100">
                Provisions for<br/>the Wild
              </h1>
              <div className="hero_buttons flex flex-col sm:flex-row items-start gap-4 opacity-0 animate-fade-up delay-200">
                <Link href="/new-arrivals" className="button is-primary inline-block px-10 py-4 bg-white text-[#1c1a19] text-xs font-bold uppercase tracking-widest border border-white hover:bg-transparent hover:text-white transition-all">
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
