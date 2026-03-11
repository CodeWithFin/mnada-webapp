"use client";

import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { cartItems, subtotal, clearCart } = useCart();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    postalCode: "",
    phone: ""
  });

  const shipping = 500; // Flat-rate shipping
  const total = subtotal + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePayNow = async () => {
    if (!formData.email) {
      alert("Please enter your email to receive a confirmation.");
      return;
    }

    setIsProcessing(true);

    try {
      // Send order to API for DB logging and email
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer: formData,
          orderDetails: cartItems,
          subtotal: subtotal,
          shipping: shipping,
          total: total
        }),
      });

      if (response.ok) {
        // Success logic: Clear cart and redirect or show success
        clearCart();
        alert("Success! Your order has been placed. You will pay upon delivery/pickup. Check your email for confirmation.");
        router.push('/');
      } else {
        throw new Error("Failed to send confirmation email.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="page-wrapper flex flex-col min-h-screen bg-white items-center justify-center">
        <div className="animate-pulse font-mono text-sm uppercase tracking-widest text-gray-400">Loading Checkout...</div>
      </div>
    );
  }

  // Redirect if cart is empty (optional, but good practice)
  if (cartItems.length === 0) {
    return (
      <div className="page-wrapper flex flex-col min-h-screen bg-white items-center justify-center gap-6">
        <h2 className="text-xl font-mono uppercase tracking-widest text-gray-400">Your cart is empty</h2>
        <Link href="/mens" className="px-8 h-12 bg-[#1c1a19] text-white flex items-center justify-center text-xs font-bold uppercase tracking-widest hover:bg-[#a58c69] transition-colors">
          Return to Shop
        </Link>
      </div>
    )
  }

  return (
    <div className="page-wrapper flex flex-col min-h-screen bg-white">
      <nav className="nav_component sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#f0f0f0] h-[70px]">
        <div className="padding-global px-5 lg:px-20 h-full">
          <div className="container-large max-w-[1792px] mx-auto h-full w-full flex items-center justify-center relative">
            <Link href="/" className="nav_brand text-xl font-bold tracking-tight uppercase text-[#1c1a19]">
              Mnada
            </Link>
            <Link href="/cart" className="absolute right-0 text-xs font-mono uppercase tracking-widest text-gray-500 hover:text-[#1c1a19] transition-colors flex items-center gap-2">
              <Icon icon="lucide:arrow-left" width="16" /> Return to Cart
            </Link>
          </div>
        </div>
      </nav>

      <main className="main-wrapper flex-grow">
        
        <div className="padding-global px-5 lg:px-20 py-10 lg:py-16">
          <div className="container-large max-w-[1792px] mx-auto">

            <div className="flex flex-col-reverse lg:grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
              
              {/* Form Section */}
              <div className="lg:col-span-7 flex flex-col gap-10">
                
                {/* Contact Info */}
                <section className="flex flex-col gap-6">
                  <div className="flex justify-between items-end border-b border-[#1c1a19] pb-2">
                    <h2 className="text-xl font-bold uppercase tracking-widest text-[#1c1a19]">Contact</h2>
                    <span className="text-xs font-mono text-gray-500">Have an account? <Link href="#" className="text-[#a58c69] hover:underline">Log in</Link></span>
                  </div>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email or mobile phone number" 
                    className="w-full h-12 border border-[#e5e5e5] px-4 font-mono text-sm focus:outline-none focus:border-[#1c1a19] transition-colors"
                    required
                  />
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 accent-[#1c1a19]" />
                    <span className="text-xs font-mono text-gray-600">Email me with news and offers</span>
                  </label>
                </section>

                {/* Delivery */}
                <section className="flex flex-col gap-6">
                  <h2 className="text-xl font-bold uppercase tracking-widest text-[#1c1a19] border-b border-[#1c1a19] pb-2">Delivery</h2>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="First name" 
                      className="w-full h-12 border border-[#e5e5e5] px-4 font-mono text-sm focus:outline-none focus:border-[#1c1a19] transition-colors"
                      required
                    />
                    <input 
                      type="text" 
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Last name" 
                      className="w-full h-12 border border-[#e5e5e5] px-4 font-mono text-sm focus:outline-none focus:border-[#1c1a19] transition-colors"
                      required
                    />
                  </div>

                  <input 
                    type="text" 
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Address" 
                    className="w-full h-12 border border-[#e5e5e5] px-4 font-mono text-sm focus:outline-none focus:border-[#1c1a19] transition-colors"
                    required
                  />
                  
                  <input 
                    type="text" 
                    name="apartment"
                    value={formData.apartment}
                    onChange={handleInputChange}
                    placeholder="Apartment, suite, etc. (optional)" 
                    className="w-full h-12 border border-[#e5e5e5] px-4 font-mono text-sm focus:outline-none focus:border-[#1c1a19] transition-colors"
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City" 
                      className="w-full h-12 border border-[#e5e5e5] px-4 font-mono text-sm focus:outline-none focus:border-[#1c1a19] transition-colors"
                      required
                    />
                    <input 
                      type="text" 
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      placeholder="Postal code" 
                      className="w-full h-12 border border-[#e5e5e5] px-4 font-mono text-sm focus:outline-none focus:border-[#1c1a19] transition-colors"
                      required
                    />
                  </div>
                  
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Phone" 
                    className="w-full h-12 border border-[#e5e5e5] px-4 font-mono text-sm focus:outline-none focus:border-[#1c1a19] transition-colors"
                    required
                  />
                </section>

                {/* Shipping Method */}
                <section className="flex flex-col gap-6">
                  <h2 className="text-xl font-bold uppercase tracking-widest text-[#1c1a19] border-b border-[#1c1a19] pb-2">Shipping Method</h2>
                  <div className="border border-[#e5e5e5] p-4 flex justify-between items-center bg-[#f8f8f8]">
                    <span className="text-sm font-mono text-[#1c1a19]">Standard Shipping (3-5 Business Days)</span>
                    <span className="text-sm font-mono font-bold text-[#1c1a19]">KSh 500.00</span>
                  </div>
                </section>

                <button 
                  type="button"
                  onClick={handlePayNow}
                  disabled={isProcessing}
                  className="w-full h-14 bg-[#1c1a19] text-white font-bold uppercase text-[11px] tracking-widest hover:bg-[#a58c69] transition-colors flex items-center justify-center mt-4 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? "Processing..." : "Place Order"}
                  {!isProcessing && <Icon icon="lucide:arrow-right" width="16" className="ml-2 group-hover:translate-x-1 transition-transform" />}
                </button>

              </div>

              {/* Order Summary (Sidebar) */}
              <div className="lg:col-span-5 bg-[#f8f8f8] p-6 lg:p-10 flex flex-col gap-8 lg:sticky lg:top-24 border border-[#e5e5e5] lg:border-0 relative lg:bg-[#f8f8f8] mb-10 lg:mb-0">
                
                {/* Visual Separator for mobile */}
                <h2 className="lg:hidden text-lg font-bold uppercase tracking-widest text-[#1c1a19] pb-4 border-b border-[#e5e5e5]">Order Summary</h2>

                <div className="flex flex-col gap-6">
                  {cartItems.map((item) => (
                    <div key={`${item.id}-${item.size}`} className="flex gap-4 items-center">
                      <div className="relative w-16 aspect-[0.8] bg-white border border-[#e5e5e5] shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                        <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-mono">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex flex-col flex-grow">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#1c1a19] line-clamp-1">{item.name}</h3>
                        <span className="text-[10px] font-mono text-gray-500">{item.size}</span>
                      </div>
                      <span className="text-xs font-mono text-[#1c1a19] shrink-0">
                        KSh {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 w-full pt-4 border-t border-[#e5e5e5]">
                  <input 
                    type="text" 
                    placeholder="Discount code or gift card" 
                    className="flex-grow h-12 border border-[#e5e5e5] px-4 font-mono text-sm focus:outline-none focus:border-[#1c1a19] transition-colors"
                  />
                  <button className="h-12 px-6 bg-[#1c1a19] text-white font-mono text-xs uppercase tracking-widest hover:bg-[#a58c69] transition-colors">
                    Apply
                  </button>
                </div>

                <div className="flex flex-col gap-4 text-sm font-mono border-y border-[#e5e5e5] py-6">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-[#1c1a19]">KSh {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Shipping</span>
                    <span className="text-[#1c1a19]">KSh {shipping.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xl font-bold uppercase tracking-widest text-[#1c1a19]">
                  <span>Total</span>
                  <span className="font-mono flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-sans">KSh</span>
                    {total.toFixed(2)}
                  </span>
                </div>

              </div>

            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
