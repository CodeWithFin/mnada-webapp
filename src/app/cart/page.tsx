"use client";

import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import Lottie from "lottie-react";
import emptyCartAnimation from "@/assets/animations/empty-cart.json";

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, subtotal } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="page-wrapper flex flex-col min-h-screen bg-white">
        <AnnouncementBar />
        <Navbar />
        <main className="main-wrapper flex-grow flex items-center justify-center">
          <div className="animate-pulse font-mono text-sm uppercase tracking-widest text-gray-400">Loading Cart...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-wrapper flex flex-col min-h-screen bg-white">
      <AnnouncementBar />
      <Navbar />

      <main className="main-wrapper flex-grow">
        
        <div className="padding-global px-5 lg:px-20 py-10 lg:py-16">
          <div className="container-large max-w-[1792px] mx-auto">
            
            <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-tight text-[#1c1a19] mb-10 border-b border-[#1c1a19] pb-4">
              Your Cart
            </h1>

            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 lg:py-16 gap-6 w-full">
                <div className="w-full max-w-[400px] md:max-w-[500px] aspect-square flex items-center justify-center">
                  <Lottie 
                    animationData={emptyCartAnimation} 
                    loop={true}
                    style={{ height: '100%', width: '100%' }}
                  />
                </div>
                <div className="text-xl font-mono uppercase tracking-widest text-gray-400">Your cart is empty</div>
                <Link 
                  href="/mens" 
                  className="px-10 h-14 bg-[#1c1a19] text-white font-bold uppercase text-xs tracking-widest hover:bg-[#a58c69] transition-colors flex items-center justify-center"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
                
                {/* Cart Items */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                  {cartItems.map((item) => (
                    <div key={`${item.id}-${item.size}`} className="flex gap-6 border-b border-[#e5e5e5] pb-8 last:border-0 last:pb-0">
                      <div className="relative w-24 md:w-32 aspect-[0.8] bg-[#f8f8f8] shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex flex-col flex-grow justify-between py-1">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex flex-col gap-1">
                            <h3 className="text-sm md:text-base font-bold uppercase tracking-widest text-[#1c1a19] leading-tight">
                              {item.name}
                            </h3>
                            {item.size && <span className="text-xs font-mono text-gray-500">Size: {item.size}</span>}
                          </div>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-400 hover:text-[#1c1a19] transition-colors"
                          >
                            <Icon icon="lucide:x" width="20" />
                          </button>
                        </div>
                        <div className="flex justify-between items-end mt-4">
                          <div className="flex items-center border border-[#e5e5e5]">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-[#1c1a19] transition-colors"
                            >
                              -
                            </button>
                            <span className="text-xs font-mono w-8 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-[#1c1a19] transition-colors"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-sm font-mono text-[#1c1a19]">
                            KSh {(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-4 bg-[#f8f8f8] p-6 lg:p-8 flex flex-col gap-6 lg:sticky lg:top-24">
                  <h2 className="text-lg font-bold uppercase tracking-widest text-[#1c1a19]">Order Summary</h2>
                  
                  <div className="flex flex-col gap-4 text-sm font-mono border-b border-[#e5e5e5] pb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="text-[#1c1a19]">KSh {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Shipping</span>
                      <span className="text-[#1c1a19]">Calculated at checkout</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-base font-bold uppercase tracking-widest text-[#1c1a19]">
                    <span>Total</span>
                    <span className="font-mono">KSh {subtotal.toFixed(2)}</span>
                  </div>

                  <Link 
                    href="/checkout"
                    className="w-full h-14 bg-[#1c1a19] text-white font-bold uppercase text-[11px] tracking-widest hover:bg-[#a58c69] transition-colors flex items-center justify-center mt-2 group"
                  >
                    Proceed to Checkout
                    <Icon icon="lucide:arrow-right" className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link href="/mens" className="text-center text-xs font-mono uppercase tracking-widest text-gray-500 hover:text-[#1c1a19] underline decoration-1 underline-offset-4 transition-colors">
                    Continue Shopping
                  </Link>
                </div>

              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
