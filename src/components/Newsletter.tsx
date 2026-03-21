"use client";

import { useState } from 'react';
import { Icon } from '@iconify/react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: 'success', message: data.message || 'Thanks for joining!' });
        setEmail('');
      } else {
        setStatus({ type: 'error', message: data.error || 'Something went wrong.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to connect. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="section_newsletter py-24 bg-[#f8f8f8] border-t border-[#f0f0f0]">
      <div className="padding-global px-5">
        <div className="container-medium max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold uppercase tracking-wide mb-3 text-[#1c1a19]">Join the Collective</h2>
          <p className="text-xs text-[#666666] mb-10 font-light tracking-wide">Sign up for early access to drops, exclusive offers, and tales from the road.</p>
          
          <div className="newsletter_form-block">
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-0 max-w-md mx-auto relative border border-[#e5e5e5]">
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ENTER YOUR EMAIL" 
                className="flex-1 bg-white h-20 md:h-16 px-8 text-base md:text-sm outline-none text-[#1c1a19] placeholder:text-gray-400 placeholder:tracking-[0.2em] placeholder:uppercase font-light"
                disabled={isSubmitting}
              />
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-[#1c1a19] text-white h-20 md:h-16 px-10 font-bold uppercase text-xs md:text-[10px] tracking-[0.2em] hover:bg-[#a58c69] transition-colors disabled:opacity-50"
              >
                {isSubmitting ? <Icon icon="lucide:loader" className="animate-spin" width="24" /> : 'Subscribe'}
              </button>
            </form>

            {status && (
              <p className={`mt-4 text-[10px] uppercase tracking-widest font-bold ${status.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                {status.message}
              </p>
            )}

            <div className="mt-6 flex items-center justify-center gap-3">
              <input 
                type="checkbox" 
                id="consent" 
                required
                className="w-3.5 h-3.5 border border-gray-300 rounded-none cursor-pointer custom-checkbox transition-colors"
              />
              <label htmlFor="consent" className="text-[9px] uppercase tracking-widest text-[#888] cursor-pointer select-none">
                I agree to the privacy policy
              </label>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
