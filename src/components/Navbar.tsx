"use client";

import Link from 'next/link';
import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <nav className="nav_component sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#f0f0f0] h-[70px]">
      <div className="padding-global px-5 lg:px-20 h-full">
        <div className="container-large max-w-[1792px] mx-auto h-full w-full">
          <div className="nav_container flex items-center justify-between h-full">
            
            {/* Mobile Trigger */}
            <button 
              className="nav_menu-button lg:hidden text-[#1c1a19] hover:text-[#a58c69] transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Icon icon={isMobileMenuOpen ? "lucide:x" : "lucide:menu"} width="24" strokeWidth="1.5" />
            </button>

            {/* Brand */}
            <Link href="/" className="nav_brand text-xl font-bold tracking-tight uppercase text-[#1c1a19]">
              Mnada
            </Link>

            {/* Desktop Links */}
            <div className="nav_menu hidden lg:flex items-center gap-12 absolute left-1/2 transform -translate-x-1/2">
              <Link href="/mens" className="nav_link text-xs uppercase tracking-widest hover:text-[#a58c69] transition-colors">Mens</Link>
              <Link href="/womens" className="nav_link text-xs uppercase tracking-widest hover:text-[#a58c69] transition-colors">Womens</Link>
            </div>

            {/* Actions */}
            <div className="nav_actions flex items-center gap-6">
              <button className="nav_search text-[#1c1a19] hover:text-[#a58c69] transition-colors hidden md:block">
                <Icon icon="lucide:search" width="18" strokeWidth="1.5" />
              </button>
              <button className="nav_account text-[#1c1a19] hover:text-[#a58c69] transition-colors">
                <Icon icon="lucide:user" width="18" strokeWidth="1.5" />
              </button>
              <Link href="/cart" className="nav_cart text-[#1c1a19] hover:text-[#a58c69] transition-colors relative">
                <Icon icon="lucide:shopping-bag" width="18" strokeWidth="1.5" />
                {mounted && totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#a58c69] text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full animate-in zoom-in duration-300">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-white z-40 lg:hidden flex flex-col transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ top: '70px', height: 'calc(100vh - 70px)' }}
      >
        <div className="flex flex-col h-full bg-[#f8f8f8] p-8">
          <div className="flex flex-col gap-6 text-2xl font-bold uppercase tracking-widest text-[#1c1a19]">
            <Link 
              href="/mens" 
              className="hover:text-[#a58c69] transition-colors border-b border-[#e5e5e5] pb-4"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Mens
            </Link>
            <Link 
              href="/womens" 
              className="hover:text-[#a58c69] transition-colors border-b border-[#e5e5e5] pb-4"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Womens
            </Link>
          </div>

          <div className="mt-auto flex flex-col gap-6 pt-10">
            <div className="flex items-center gap-4 text-[#1c1a19]">
              <Icon icon="lucide:user" width="20" strokeWidth="1.5" />
              <span className="text-sm font-mono uppercase tracking-widest">Account</span>
            </div>
            <div className="flex items-center gap-4 text-[#1c1a19]">
              <Icon icon="lucide:search" width="20" strokeWidth="1.5" />
              <span className="text-sm font-mono uppercase tracking-widest">Search</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
