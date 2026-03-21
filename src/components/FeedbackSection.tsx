"use client";

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

export default function FeedbackSection() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [isLoadingFeedbacks, setIsLoadingFeedbacks] = useState(true);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await fetch(`/api/feedback?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          setFeedbacks(data);
        }
      } catch (err) {
        console.error("Failed to fetch feedback:", err);
      } finally {
        setIsLoadingFeedbacks(false);
      }
    };
    fetchFeedbacks();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResult(null);
    setIsSending(true);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload.error || 'Could not send feedback.');
      }

      setResult({ type: 'success', message: 'Thank you! Your feedback has been received.' });
      setForm({ name: '', email: '', phone: '', message: '' });
      
      // Refresh feedbacks
      const freshRes = await fetch('/api/feedback');
      if (freshRes.ok) {
        const freshData = await freshRes.json();
        setFeedbacks(freshData);
      }
    } catch (error) {
      setResult({
        type: 'error',
        message: error instanceof Error ? error.message : 'Could not send feedback.'
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="bg-[#f8f8f8] border-y border-[#e5e5e5]">
      <div className="padding-global px-5 lg:px-20">
        <div className="container-large max-w-[1792px] mx-auto py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mb-20">
            <div className="flex flex-col gap-4">
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#a58c69]">Feedback</p>
              <h2 className="text-3xl lg:text-4xl font-bold uppercase tracking-tight text-[#1c1a19]">Tell Us How We Can Improve</h2>
              <p className="text-sm font-mono text-gray-600 leading-7 max-w-xl">
                Share your shopping experience, delivery feedback, or product requests. We read every message and use it to improve the Mnada experience.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white border border-[#e5e5e5] p-6 lg:p-8 flex flex-col gap-4">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                className="h-12 border border-[#e5e5e5] px-4 font-mono text-sm focus:outline-none focus:border-[#1c1a19]"
                required
              />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Your email"
                className="h-12 border border-[#e5e5e5] px-4 font-mono text-sm focus:outline-none focus:border-[#1c1a19]"
                required
              />
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone (optional)"
                className="h-12 border border-[#e5e5e5] px-4 font-mono text-sm focus:outline-none focus:border-[#1c1a19]"
              />
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Write your feedback..."
                className="min-h-[130px] border border-[#e5e5e5] p-4 font-mono text-sm focus:outline-none focus:border-[#1c1a19]"
                required
              />

              {result ? (
                <div
                  className={`text-xs font-mono uppercase tracking-widest p-3 border ${
                    result.type === 'success'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}
                >
                  {result.message}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSending}
                className="h-12 px-6 bg-[#1c1a19] text-white font-bold uppercase tracking-widest text-xs hover:bg-[#a58c69] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isSending ? <><Icon icon="lucide:loader" className="animate-spin" /> Sending...</> : 'Send Feedback'}
              </button>
            </form>
          </div>

          {/* Feedback Display Section */}
          <div className="border-t border-[#e5e5e5] pt-16">
            <h3 className="text-xl font-bold uppercase tracking-tight mb-10">Customer Voices</h3>
            
            {isLoadingFeedbacks ? (
              <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                <Icon icon="lucide:loader" className="animate-spin" /> Loading feedback...
              </div>
            ) : feedbacks.length === 0 ? (
              <p className="text-xs font-mono text-gray-500 italic">No feedback published yet. Be the first to share your experience!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {feedbacks.map((item, index) => (
                  <div key={item.id || index} className="bg-white border border-[#e5e5e5] p-6 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-1 text-[#a58c69]">
                        {[...Array(5)].map((_, i) => (
                          <Icon key={i} icon="lucide:star" className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                      <span className="text-[10px] font-mono text-gray-400 uppercase">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm font-mono text-[#1c1a19] leading-6 mb-4">"{item.message}"</p>
                    <div className="border-t border-[#f0f0f0] pt-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest">{item.name}</p>
                      <p className="text-[9px] text-gray-400 uppercase">Verified Customer</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
