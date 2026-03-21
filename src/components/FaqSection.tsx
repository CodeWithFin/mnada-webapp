"use client";

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

type FAQ = {
  id: string;
  question: string;
  answer: string;
  category: string;
};

export default function FaqSection() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    question: ''
  });
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await fetch('/api/faqs');
        if (res.ok) {
          const data = await res.json();
          setFaqs(data);
          if (data.length > 0) {
            setExpandedId(data[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch FAQs:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  const handleToggle = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    setIsSending(true);

    try {
      const res = await fetch('/api/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: form.question,
          author_name: form.name,
          author_email: form.email
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit question');

      setResult({ type: 'success', message: 'Your question has been submitted! Our team will review and answer it soon.' });
      setForm({ name: '', email: '', question: '' });
    } catch (err) {
      setResult({ type: 'error', message: err instanceof Error ? err.message : 'Something went wrong.' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="bg-white min-h-[60vh]">
      <div className="padding-global px-5 lg:px-20 py-16 lg:py-24">
        <div className="container-large max-w-[1792px] mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
            
            {/* FAQ List */}
            <div className="lg:col-span-7 flex flex-col gap-10">
              <div className="flex flex-col gap-4">
                <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#a58c69]">Support Center</span>
                <h2 className="text-4xl lg:text-5xl font-bold uppercase tracking-tight text-[#1c1a19]">Frequently Asked Questions</h2>
              </div>

              {isLoading ? (
                <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                  <Icon icon="lucide:loader" className="animate-spin" /> Loading wisdom...
                </div>
              ) : faqs.length === 0 ? (
                <p className="text-sm font-mono text-gray-500 italic">No FAQs published yet. Have a question? Ask us below!</p>
              ) : (
                <div className="flex flex-col border-t border-[#e5e5e5]">
                  {faqs.map((faq) => (
                    <div key={faq.id} className="border-b border-[#e5e5e5] group">
                      <button 
                        onClick={() => handleToggle(faq.id)}
                        className="w-full py-8 flex items-center justify-between text-left group-hover:bg-[#fafafa] px-4 -mx-4 transition-colors"
                      >
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-[#a58c69]">{faq.category}</span>
                          <span className="text-lg font-bold uppercase tracking-tight text-[#1c1a19]">{faq.question}</span>
                        </div>
                        <Icon 
                          icon={expandedId === faq.id ? "lucide:minus" : "lucide:plus"} 
                          className={`w-5 h-5 transition-transform duration-300 ${expandedId === faq.id ? 'text-[#a58c69]' : 'text-gray-300'}`} 
                        />
                      </button>
                      <div 
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          expandedId === faq.id ? 'max-h-[500px] opacity-100 pb-8' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <p className="text-sm font-mono text-gray-600 leading-7 max-w-2xl px-0">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submission Form */}
            <div className="lg:col-span-5">
              <div className="bg-[#f8f8f8] border border-[#e5e5e5] p-8 lg:p-12 flex flex-col gap-8 sticky top-32">
                <div className="flex flex-col gap-3">
                  <h3 className="text-2xl font-bold uppercase tracking-tight text-[#1c1a19]">Still Curious?</h3>
                  <p className="text-xs font-mono text-gray-500 leading-6">
                    Can't find what you're looking for? Submit your question below and our team will get back to you with an answer.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Name</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className="h-12 bg-white border border-[#e5e5e5] px-4 font-mono text-sm focus:outline-none focus:border-[#1c1a19]"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Email (Optional)</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="To notify you of our answer"
                      className="h-12 bg-white border border-[#e5e5e5] px-4 font-mono text-sm focus:outline-none focus:border-[#1c1a19]"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Question</label>
                    <textarea
                      name="question"
                      value={form.question}
                      onChange={handleChange}
                      placeholder="What would you like to know?"
                      className="min-h-[120px] bg-white border border-[#e5e5e5] p-4 font-mono text-sm focus:outline-none focus:border-[#1c1a19]"
                      required
                    />
                  </div>

                  {result && (
                    <div className={`text-xs font-mono p-4 border ${
                      result.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {result.message}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSending}
                    className="h-14 bg-[#1c1a19] text-white font-bold uppercase tracking-widest text-xs hover:bg-[#a58c69] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {isSending ? <><Icon icon="lucide:loader" className="animate-spin" /> Submitting...</> : 'Submit Question'}
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
