"use client";

import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";

export default function MobileCartPopup() {
  const { isPopupOpen, lastAddedItem, closePopup, totalItems } = useCart();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isPopupOpen) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(closePopup, 300); // Wait for exit animation
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isPopupOpen, closePopup]);

  if (!isPopupOpen || !lastAddedItem) return null;

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-[999] p-4 lg:hidden transition-all duration-300 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
    >
      <div className="bg-[#1c1a19] text-white shadow-2xl border border-[#3a3837] p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#a58c69]">
            <Icon icon="lucide:check-circle" />
            Added to Bag
          </div>
          <button onClick={() => setIsVisible(false)} className="text-gray-400 hover:text-white">
            <Icon icon="lucide:x" width="16" />
          </button>
        </div>

        <div className="flex gap-4">
          <div className="relative w-16 h-20 bg-[#2a2827] flex-shrink-0">
            <Image 
              src={lastAddedItem.image} 
              alt={lastAddedItem.name} 
              fill 
              className="object-cover" 
              sizes="64px"
            />
          </div>
          <div className="flex flex-col gap-1 justify-center">
            <h4 className="text-sm font-bold uppercase tracking-tight line-clamp-1">{lastAddedItem.name}</h4>
            <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
              Size: {lastAddedItem.size} | Qty: {lastAddedItem.quantity}
            </div>
            <div className="text-xs font-mono text-white mt-1">
              KSh {lastAddedItem.price.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-1">
          <button 
            onClick={() => setIsVisible(false)}
            className="h-12 border border-[#3a3837] flex items-center justify-center text-[10px] font-bold uppercase tracking-widest hover:bg-[#2a2827] transition-colors"
          >
            Continue
          </button>
          <Link 
            href="/cart"
            onClick={closePopup}
            className="h-12 bg-white text-[#1c1a19] flex items-center justify-center text-[10px] font-bold uppercase tracking-widest hover:bg-[#a58c69] hover:text-white transition-colors"
          >
            View Bag ({totalItems})
          </Link>
        </div>
      </div>
    </div>
  );
}
