"use client";

import Link from 'next/link';
import { Icon } from '@iconify/react';

export default function Navbar() {
  return (
    <nav className="nav_component sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#f0f0f0] h-[70px]">
      <div className="padding-global px-5 lg:px-20 h-full">
        <div className="container-large max-w-[1792px] mx-auto h-full w-full">
          <div className="nav_container flex items-center justify-between h-full">
            
            {/* Mobile Trigger */}
            <button className="nav_menu-button lg:hidden text-[#1c1a19] hover:text-[#a58c69] transition-colors">
              <Icon icon="lucide:menu" width="24" strokeWidth="1.5" />
            </button>

            {/* Brand */}
            <Link href="/" className="nav_brand text-xl font-bold tracking-tight uppercase text-[#1c1a19]">
              Mnada
            </Link>

            {/* Desktop Links */}
            <div className="nav_menu hidden lg:flex items-center gap-12 absolute left-1/2 transform -translate-x-1/2">
              <Link href="/mens" className="nav_link text-xs uppercase tracking-widest hover:text-[#a58c69] transition-colors">Mens</Link>
              <Link href="/womens" className="nav_link text-xs uppercase tracking-widest hover:text-[#a58c69] transition-colors">Womens</Link>
              <Link href="#" className="nav_link text-xs uppercase tracking-widest hover:text-[#a58c69] transition-colors">Goods</Link>
              <Link href="#" className="nav_link text-xs uppercase tracking-widest hover:text-[#a58c69] transition-colors">Journal</Link>
            </div>

            {/* Actions */}
            <div className="nav_actions flex items-center gap-6">
              <button className="nav_search text-[#1c1a19] hover:text-[#a58c69] transition-colors hidden md:block">
                <Icon icon="lucide:search" width="18" strokeWidth="1.5" />
              </button>
              <button className="nav_account text-[#1c1a19] hover:text-[#a58c69] transition-colors">
                <Icon icon="lucide:user" width="18" strokeWidth="1.5" />
              </button>
              <button className="nav_cart text-[#1c1a19] hover:text-[#a58c69] transition-colors relative">
                <Icon icon="lucide:shopping-bag" width="18" strokeWidth="1.5" />
                <span className="absolute -top-1.5 -right-1.5 bg-[#a58c69] text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full">2</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
