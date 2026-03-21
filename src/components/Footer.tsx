"use client";

import Link from 'next/link';
import { Icon } from '@iconify/react';

export default function Footer() {
  return (
    <footer className="footer_component bg-[#ffffff] text-[#1c1a19] border-t border-[#e5e5e5]">
      <div className="padding-global px-5 lg:px-20 pt-20 pb-8">
        <div className="container-large max-w-[1792px] mx-auto">
          
          <div className="footer_grid grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-12 mb-20">
            <div className="footer_brand-wrapper col-span-2 lg:col-span-8">
              <Link href="#" className="text-2xl font-bold tracking-tight uppercase block mb-6">Mnada</Link>
              <p className="text-xs font-light text-gray-500 max-w-xs mb-8 leading-6">
                Provisions for the wild. Industrial goods for the modern pioneer. Worn worldwide.
              </p>
              <div className="footer_socials flex gap-4 opacity-60">
                <Link href="https://www.instagram.com/mnada_network?igsh=amN5OW4zOHZxenUw" target="_blank" rel="noopener noreferrer" className="hover:text-[#a58c69] transition-colors"><Icon icon="lucide:instagram" width="18" /></Link>
                <Link href="https://www.facebook.com/share/1DTAoHgDrZ/" target="_blank" rel="noopener noreferrer" className="hover:text-[#a58c69] transition-colors"><Icon icon="lucide:facebook" width="18" /></Link>
                <Link href="https://x.com/DrAsclepius99" target="_blank" rel="noopener noreferrer" className="hover:text-[#a58c69] transition-colors"><Icon icon="simple-icons:x" width="18" /></Link>
                <Link href="https://www.tiktok.com/@mnada.network?_r=1&_t=ZS-94sPqcD0sRZ" target="_blank" rel="noopener noreferrer" className="hover:text-[#a58c69] transition-colors"><Icon icon="simple-icons:tiktok" width="18" /></Link>
              </div>
            </div>
            
            <div className="footer_links-wrapper col-span-1 lg:col-span-2">
              <h4 className="font-bold uppercase tracking-widest text-[10px] text-[#a58c69] mb-6">Shop</h4>
              <ul className="space-y-4">
                <li><Link href="/new-arrivals" className="text-xs text-[#1c1a19] hover:text-[#a58c69] transition-colors uppercase tracking-wide">New Arrivals</Link></li>
                <li><Link href="/mens" className="text-xs text-[#1c1a19] hover:text-[#a58c69] transition-colors uppercase tracking-wide">Mens</Link></li>
                <li><Link href="/womens" className="text-xs text-[#1c1a19] hover:text-[#a58c69] transition-colors uppercase tracking-wide">Womens</Link></li>
                <li><Link href="/category/accessories" className="text-xs text-[#1c1a19] hover:text-[#a58c69] transition-colors uppercase tracking-wide">Accessories</Link></li>
              </ul>
            </div>

            <div className="footer_links-wrapper col-span-1 lg:col-span-2">
              <h4 className="font-bold uppercase tracking-widest text-[10px] text-[#a58c69] mb-6">Support</h4>
              <ul className="space-y-4">
                <li><Link href="/account" className="text-xs text-[#1c1a19] hover:text-[#a58c69] transition-colors uppercase tracking-wide">Account</Link></li>
                <li><Link href="#" className="text-xs text-[#1c1a19] hover:text-[#a58c69] transition-colors uppercase tracking-wide">Shipping</Link></li>
                <li><Link href="#" className="text-xs text-[#1c1a19] hover:text-[#a58c69] transition-colors uppercase tracking-wide">Returns</Link></li>
                <li><Link href="/faq" className="text-xs text-[#1c1a19] hover:text-[#a58c69] transition-colors uppercase tracking-wide">FAQ</Link></li>
                <li><Link href="/feedback" className="text-xs text-[#1c1a19] hover:text-[#a58c69] transition-colors uppercase tracking-wide">Feedback</Link></li>
                <li><Link href="/seller/signup" className="text-xs font-bold text-[#a58c69] hover:text-[#1c1a19] transition-colors uppercase tracking-wide border-t border-[#f0f0f0] pt-2 mt-2 block">Become a Seller</Link></li>
              </ul>
            </div>

          </div>

          <div className="footer_bottom border-t border-[#f0f0f0] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[9px] text-gray-400 uppercase tracking-widest">© 2026 Mnada. All rights reserved.</p>
            <div className="footer_payments flex gap-4">
              <Icon icon="logos:visa" width="24" className="grayscale opacity-30" />
              <Icon icon="logos:mastercard" width="24" className="grayscale opacity-30" />
              <Icon icon="logos:paypal" width="24" className="grayscale opacity-30" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
