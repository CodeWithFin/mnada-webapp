"use client";

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Icon } from '@iconify/react';
import Image from 'next/image';
import Link from 'next/link';

const products = [
  {
    id: "p1",
    name: "Bucking Bronco Hoodie - Washed Black",
    price: 8000.00,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2080&auto=format&fit=crop",
    isNew: true
  },
  {
    id: "p2",
    name: "Mechanic Overshirt - Raw Indigo",
    price: 12000.00,
    image: "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/4734259a-bad7-422f-981e-ce01e79184f2_1600w.jpg"
  },
  {
    id: "p3",
    name: "Wayfarer Cap - Rust Orange",
    price: 3200.00,
    image: "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/c543a9e1-f226-4ced-80b0-feb8445a75b9_1600w.jpg"
  },
  {
    id: "p4",
    name: "Utility Tote - Olive Canvas",
    price: 8500.00,
    image: "https://images.unsplash.com/photo-1550928431-ee0ec6db30d3?q=80&w=2070&auto=format&fit=crop"
  }
];

export default function NewArrivals() {
  const { addToCart } = useCart();
  const [addingId, setAddingId] = useState<string | null>(null);

  const handleQuickAdd = (product: any) => {
    setAddingId(product.id);
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      size: "L" // Default size for quick add
    });
    setTimeout(() => setAddingId(null), 800);
  };

  return (
    <section className="section_new-arrivals bg-white">
      <div className="padding-global px-5 lg:px-20">
        <div className="container-large max-w-[1792px] mx-auto">
          <div className="padding-section-medium py-12">
            
            {/* Header Component */}
            <div className="new-arrivals_header flex flex-row flex-nowrap justify-between items-center border-t border-[#1c1a19] pt-7 pb-7 lg:pl-[34px] lg:pr-[34px] mb-0 w-full">
              <h3 className="font-mono text-base font-light text-[#1c1a19]">
                New Arrivals
              </h3>
              <div className="new-arrivals_tabs flex gap-2">
                <button className="px-5 py-2 text-sm font-mono border border-[#1c1a19] bg-[#1c1a19] text-white rounded-none transition-all hover:opacity-90" type="button">
                  All
                </button>
                <button className="px-5 py-2 text-sm font-mono border border-[#e5e5e5] text-[#1c1a19] rounded-none hover:border-[#1c1a19] transition-all bg-transparent" type="button">
                  Men&apos;s
                </button>
                <button className="px-5 py-2 text-sm font-mono border border-[#e5e5e5] text-[#1c1a19] rounded-none hover:border-[#1c1a19] transition-all bg-transparent" type="button">
                  Women&apos;s
                </button>
              </div>
            </div>

            {/* Slider List Wrapper */}
            <div className="new-arrivals_list flex overflow-x-auto snap-x snap-mandatory gap-5 pb-8 lg:grid lg:grid-cols-4 lg:gap-5 scrollbar-hide pt-8">
              
              {products.map((product) => (
                <div key={product.id} className="new-arrivals_item snap-start shrink-0 w-[85vw] sm:w-[45vw] lg:w-auto flex flex-col group min-w-0">
                  <Link href={`/product/${product.id}`} className="product_image-wrapper relative aspect-[0.8] bg-[#f8f8f8] overflow-hidden mb-0 block">
                    {product.isNew && (
                      <span className="absolute top-4 left-4 bg-[#a58c69] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 z-10 transition-transform group-hover:scale-110">New</span>
                    )}
                    <Image 
                      src={product.image} 
                      alt={product.name} 
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </Link>
                  <div className="product_content bg-[#fafafa] p-[16px_10px] flex flex-col gap-[10px] w-full border border-transparent group-hover:bg-white group-hover:border-[#f0f0f0] transition-all duration-300">
                    <Link href={`/product/${product.id}`} className="block hover:text-[#a58c69] transition-colors">
                      <h3 className="font-mono text-base font-light leading-5 text-[#1c1a19] line-clamp-1">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex justify-between items-center w-full">
                      <div className="font-mono text-base font-light text-[#1c1a19]">KSh {product.price.toFixed(2)}</div>
                      <button 
                        onClick={() => handleQuickAdd(product)}
                        disabled={addingId === product.id}
                        type="button" 
                        className={`font-mono text-base font-light underline decoration-1 underline-offset-4 uppercase transition-all duration-300 flex items-center gap-2 ${addingId === product.id ? 'text-[#a58c69] no-underline' : 'text-[#1c1a19] hover:text-[#a58c69]'}`}
                      >
                        {addingId === product.id ? (
                          <Icon icon="lucide:check" width="16" className="animate-in zoom-in duration-300" />
                        ) : "+ ADD"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
