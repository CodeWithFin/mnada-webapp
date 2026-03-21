"use client";

import { Icon } from '@iconify/react';

export default function ReturnsSection() {
  return (
    <section className="bg-white min-h-[60vh]">
      <div className="padding-global px-5 lg:px-20 py-16 lg:py-24">
        <div className="container-large max-w-[1792px] mx-auto">
          <div className="max-w-3xl flex flex-col gap-12">
            
            <div className="flex flex-col gap-4">
              <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#a58c69]">Policy</span>
              <h1 className="text-4xl lg:text-6xl font-bold uppercase tracking-tight text-[#1c1a19]">Returns & Exchanges</h1>
              <p className="text-sm font-mono text-gray-500 leading-7">
                We believe in the quality of our provisions. If you're not completely satisfied with your purchase, we're here to help make it right.
              </p>
            </div>

            <div className="flex flex-col gap-16 border-t border-[#e5e5e5] pt-16">
              
              {/* Policy Item 1 */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-12">
                <div className="md:col-span-4">
                  <h2 className="text-lg font-bold uppercase tracking-tight text-[#1c1a19]">General Policy</h2>
                </div>
                <div className="md:col-span-8">
                  <p className="text-sm font-mono text-gray-600 leading-7">
                    Items can be returned within 30 days of delivery. To be eligible for a return, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging.
                  </p>
                </div>
              </div>

              {/* Policy Item 2 */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-12 border-t border-[#f0f0f0] pt-12">
                <div className="md:col-span-4">
                  <h2 className="text-lg font-bold uppercase tracking-tight text-[#1c1a19]">How to Return</h2>
                </div>
                <div className="md:col-span-8 flex flex-col gap-6">
                  <p className="text-sm font-mono text-gray-600 leading-7">
                    Starting a return is simple. Follow these steps to ensure a smooth process:
                  </p>
                  <ul className="flex flex-col gap-6">
                    <li className="flex gap-4">
                      <div className="shrink-0 w-8 h-8 rounded-full bg-[#f8f8f8] flex items-center justify-center text-[10px] font-bold text-[#a58c69] border border-[#e5e5e5]">01</div>
                      <p className="text-sm font-mono text-gray-600 leading-6 pt-1.5">Contact us at <span className="text-[#1c1a19] font-bold underline decoration-[#a58c69]">support@mnada.com</span> with your order number.</p>
                    </li>
                    <li className="flex gap-4">
                      <div className="shrink-0 w-8 h-8 rounded-full bg-[#f8f8f8] flex items-center justify-center text-[10px] font-bold text-[#a58c69] border border-[#e5e5e5]">02</div>
                      <p className="text-sm font-mono text-gray-600 leading-6 pt-1.5">Pack the items securely in their original packaging, ensuring all tags are attached.</p>
                    </li>
                    <li className="flex gap-4">
                      <div className="shrink-0 w-8 h-8 rounded-full bg-[#f8f8f8] flex items-center justify-center text-[10px] font-bold text-[#a58c69] border border-[#e5e5e5]">03</div>
                      <p className="text-sm font-mono text-gray-600 leading-6 pt-1.5">Ship the package to the address provided by our support team.</p>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Policy Item 3 */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-12 border-t border-[#f0f0f0] pt-12">
                <div className="md:col-span-4">
                  <h2 className="text-lg font-bold uppercase tracking-tight text-[#1c1a19]">Refund Timing</h2>
                </div>
                <div className="md:col-span-8">
                  <p className="text-sm font-mono text-gray-600 leading-7">
                    Once we receive and inspect your return, we will notify you of the approval or rejection of your refund. If approved, your refund will be processed, and a credit will automatically be applied to your original method of payment within 7-10 business days.
                  </p>
                </div>
              </div>

              {/* Policy Item 4 */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-12 border-t border-[#f0f0f0] pt-12">
                <div className="md:col-span-4">
                  <h2 className="text-lg font-bold uppercase tracking-tight text-[#1c1a19]">Non-Returnable</h2>
                </div>
                <div className="md:col-span-8">
                  <p className="text-sm font-mono text-gray-600 leading-7">
                    Certain types of items cannot be returned, like perishable goods, custom products, and personal care goods. We also do not accept returns for hazardous materials, flammable liquids, or gases. Please get in touch if you have questions or concerns about your specific item.
                  </p>
                </div>
              </div>

            </div>

            <div className="bg-[#f8f8f8] border border-[#e5e5e5] p-8 lg:p-12 flex flex-col md:flex-row items-center justify-between gap-8 mt-6">
              <div className="flex flex-col gap-4">
                <h3 className="text-xl font-bold uppercase tracking-tight text-[#1c1a19]">Need more help?</h3>
                <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">Connect with our support team directly.</p>
              </div>
              <div className="flex items-center gap-4">
                <a 
                  href="mailto:support@mnada.com" 
                  className="h-14 px-8 bg-[#1c1a19] text-white font-bold uppercase tracking-widest text-[10px] hover:bg-[#a58c69] transition-colors flex items-center justify-center gap-2"
                >
                  <Icon icon="lucide:mail" width="16" /> Email Support
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
