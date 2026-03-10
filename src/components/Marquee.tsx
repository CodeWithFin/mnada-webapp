"use client";

import { Icon } from '@iconify/react';

export default function Marquee() {
  return (
    <section className="section_marquee bg-[#a58c69] text-white py-3 overflow-hidden border-y border-[#a58c69]">
      <div className="marquee_content flex whitespace-nowrap animate-marquee w-[200%]">
        <div className="marquee_group flex justify-around gap-24 mx-12 items-center w-1/2">
          <span className="text-xs font-bold uppercase tracking-[0.15em] flex items-center gap-3"><Icon icon="lucide:arrow-right" width="14" /> Free Returns</span>
          <span className="text-xs font-bold uppercase tracking-[0.15em] flex items-center gap-3"><Icon icon="lucide:arrow-right" width="14" /> Built to Last</span>
          <span className="text-xs font-bold uppercase tracking-[0.15em] flex items-center gap-3"><Icon icon="lucide:arrow-right" width="14" /> Worldwide Shipping</span>
          <span className="text-xs font-bold uppercase tracking-[0.15em] flex items-center gap-3"><Icon icon="lucide:arrow-right" width="14" /> Industrial Heritage</span>
        </div>
        <div className="marquee_group flex justify-around gap-24 mx-12 items-center w-1/2">
          <span className="text-xs font-bold uppercase tracking-[0.15em] flex items-center gap-3"><Icon icon="lucide:arrow-right" width="14" /> Free Returns</span>
          <span className="text-xs font-bold uppercase tracking-[0.15em] flex items-center gap-3"><Icon icon="lucide:arrow-right" width="14" /> Built to Last</span>
          <span className="text-xs font-bold uppercase tracking-[0.15em] flex items-center gap-3"><Icon icon="lucide:arrow-right" width="14" /> Worldwide Shipping</span>
          <span className="text-xs font-bold uppercase tracking-[0.15em] flex items-center gap-3"><Icon icon="lucide:arrow-right" width="14" /> Industrial Heritage</span>
        </div>
      </div>
    </section>
  );
}
