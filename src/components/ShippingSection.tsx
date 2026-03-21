"use client";

import { Icon } from '@iconify/react';

export default function ShippingSection() {
  return (
    <section className="bg-white min-h-[60vh]">
      <div className="padding-global px-5 lg:px-20 py-16 lg:py-24">
        <div className="container-large max-w-[1792px] mx-auto">
          <div className="max-w-3xl flex flex-col gap-12">
            
            <div className="flex flex-col gap-4">
              <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#a58c69]">Logistics</span>
              <h1 className="text-4xl lg:text-6xl font-bold uppercase tracking-tight text-[#1c1a19]">Shipping & Delivery</h1>
              <p className="text-sm font-mono text-gray-500 leading-7">
                We deliver our curated provisions with care and efficiency, ensuring they reach your doorstep in pristine condition.
              </p>
            </div>

            <div className="flex flex-col gap-16 border-t border-[#e5e5e5] pt-16">
              
              {/* Shipping Item 1 */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-12">
                <div className="md:col-span-4">
                  <h2 className="text-lg font-bold uppercase tracking-tight text-[#1c1a19]">Domestic Shipping</h2>
                </div>
                <div className="md:col-span-8 flex flex-col gap-6">
                  <p className="text-sm font-mono text-gray-600 leading-7">
                    We offer multiple shipping options to meet your needs within Kenya:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-6 bg-[#f8f8f8] border border-[#e5e5e5] flex flex-col gap-2">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-[#a58c69]">Standard Delivery</span>
                       <span className="text-sm font-bold text-[#1c1a19]">2 - 3 Business Days</span>
                       <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">KSh 350 Flat Rate</span>
                    </div>
                    <div className="p-6 bg-[#f8f8f8] border border-[#e5e5e5] flex flex-col gap-2">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-[#1c1a19]">Express Delivery</span>
                       <span className="text-sm font-bold text-[#1c1a19]">Next Business Day</span>
                       <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">KSh 600 Flat Rate</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Item 2 */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-12 border-t border-[#f0f0f0] pt-12">
                <div className="md:col-span-4">
                  <h2 className="text-lg font-bold uppercase tracking-tight text-[#1c1a19]">Order Tracking</h2>
                </div>
                <div className="md:col-span-8">
                  <p className="text-sm font-mono text-gray-600 leading-7">
                    Once your order has been dispatched, you will receive a confirmation email containing your tracking number and a link to trace your package's journey. Please allow 24 hours for the tracking information to become active.
                  </p>
                </div>
              </div>

              {/* Shipping Item 3 */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-12 border-t border-[#f0f0f0] pt-12">
                <div className="md:col-span-4">
                  <h2 className="text-lg font-bold uppercase tracking-tight text-[#1c1a19]">Packaging</h2>
                </div>
                <div className="md:col-span-8">
                  <p className="text-sm font-mono text-gray-600 leading-7">
                    Sustainability is at the heart of our operations. All orders are packed using eco-friendly, recyclable materials designed to protect your items while minimizing our environmental footprint.
                  </p>
                </div>
              </div>

              {/* Shipping Item 4 */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-12 border-t border-[#f0f0f0] pt-12">
                <div className="md:col-span-4">
                  <h2 className="text-lg font-bold uppercase tracking-tight text-[#1c1a19]">Need it faster?</h2>
                </div>
                <div className="md:col-span-8">
                  <p className="text-sm font-mono text-gray-600 leading-7">
                    For special requests or urgent deliveries, please contact our logistics team directly. We will do our best to accommodate your requirements.
                  </p>
                </div>
              </div>

            </div>


          </div>
        </div>
      </div>
    </section>
  );
}
