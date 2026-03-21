"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@iconify/react';

export default function Collections() {
  return (
    <section className="section_collections">
      <div className="padding-global px-5 lg:px-20">
        <div className="container-large max-w-[1792px] mx-auto">
          <div className="padding-section-large py-20">
            
            <div className="collections_grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 lg:gap-8 auto-rows-fr">
              {/* Large Item */}
              <Link href="/mens" className="collection-item_large group relative lg:col-span-6 min-h-[500px] overflow-hidden bg-[#f0f0f0] block">
                <Image 
                  src="https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?q=80&w=1972&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                  alt="Mens Collection"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                <div className="collection-item_content absolute bottom-0 left-0 p-8 w-full">
                  <span className="text-[#a58c69] text-xs font-bold uppercase tracking-[0.2em] mb-2 block">New Season</span>
                  <div className="flex justify-between items-end border-t border-white/30 pt-4">
                    <h3 className="text-white text-3xl font-bold uppercase tracking-wide">Graphic Tees</h3>
                    <div className="text-white hover:text-[#a58c69] transition-colors">
                      <Icon icon="lucide:arrow-right" width="24" strokeWidth="1.5" />
                    </div>
                  </div>
                </div>
              </Link>

              {/* Stacked Items */}
              <div className="collection-item_wrapper lg:col-span-3 flex flex-col gap-5 lg:gap-8 h-full">
                <Link href="/mens" className="collection-item_small group relative flex-1 min-h-[250px] overflow-hidden bg-[#f0f0f0] block">
                  <Image 
                    src="https://images.unsplash.com/photo-1697748242500-9fb6828570ba?q=80&w=1200&auto=format&fit=crop" 
                    alt="Jackets"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                  <div className="collection-item_content absolute bottom-0 left-0 p-6 w-full">
                        <div className="flex justify-between items-center border-t border-white/30 pt-3">
                      <h3 className="text-white text-lg font-bold uppercase tracking-widest">Outerwear</h3>
                        <Icon icon="lucide:chevron-right" className="text-white" width="18" />
                  </div>
                  </div>
                </Link>
                <Link href="#" className="collection-item_small group relative flex-1 min-h-[250px] overflow-hidden bg-[#f0f0f0] block">
                  <Image 
                    src="https://images.unsplash.com/photo-1586878341523-7acb55eb8c12?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                    alt="Accessories"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                  <div className="collection-item_content absolute bottom-0 left-0 p-6 w-full">
                      <div className="flex justify-between items-center border-t border-white/30 pt-3">
                          <h3 className="text-white text-lg font-bold uppercase tracking-widest">Accessories</h3>
                          <Icon icon="lucide:chevron-right" className="text-white" width="18" />
                      </div>
                  </div>
                </Link>
              </div>

              {/* Tall Item */}
              <Link href="/womens" className="collection-item_tall group relative lg:col-span-3 min-h-[500px] overflow-hidden bg-[#f0f0f0] block">
                <Image 
                  src="https://images.unsplash.com/photo-1531469535976-c6fc3604014f?q=80&w=1335&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                  alt="Womens Collection"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                <div className="collection-item_content absolute bottom-0 left-0 p-8 w-full">
                  <span className="text-[#a58c69] text-xs font-bold uppercase tracking-[0.2em] mb-2 block">Collection</span>
                  <div className="flex justify-between items-end border-t border-white/30 pt-4">
                    <h3 className="text-white text-3xl font-bold uppercase tracking-wide">Womens</h3>
                    <div className="text-white hover:text-[#a58c69] transition-colors">
                      <Icon icon="lucide:arrow-right" width="24" strokeWidth="1.5" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
