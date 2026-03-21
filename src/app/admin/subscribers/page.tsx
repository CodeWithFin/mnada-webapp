"use client";

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [customEmails, setCustomEmails] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchSubscribers = async () => {
    try {
      const token = localStorage.getItem("mnada_admin_token");
      const res = await fetch(`/api/admin/subscribers?t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm("Are you sure you want to send this email to all subscribers?")) return;

    setIsSending(true);
    setStatus(null);
    const token = localStorage.getItem("mnada_admin_token");

    try {
      const res = await fetch('/api/admin/newsletter', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          subject, 
          message,
          customEmails: customEmails ? customEmails.split(',').map(e => e.trim()) : undefined
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: 'success', message: `Successfully sent to ${data.count} recipients!` });
        setSubject('');
        setMessage('');
        setCustomEmails('');
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to send emails.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'An error occurred while sending.' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-12 max-w-6xl">
      <div className="flex flex-col gap-3">
        <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#a58c69]">Email Marketing</span>
        <h1 className="text-3xl font-bold uppercase tracking-tight text-[#1c1a19]">Subscribers</h1>
        <p className="text-sm font-mono text-gray-400">Manage your newsletter audience and send bulk updates.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Email Form */}
        <div className="flex flex-col gap-6">
          <div className="bg-white border border-[#e5e5e5] p-8">
            <h2 className="text-lg font-bold uppercase tracking-widest mb-6 pb-4 border-b border-[#f0f0f0]">Send Newsletter</h2>
            <form onSubmit={handleSendEmail} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Recipients (Optional: leave blank for all)</label>
                <input 
                  type="text" 
                  value={customEmails}
                  onChange={(e) => setCustomEmails(e.target.value)}
                  placeholder="email1@test.com, email2@test.com"
                  className="bg-[#f8f8f8] border border-[#e5e5e5] h-12 px-4 text-xs font-mono outline-none focus:border-[#a58c69] transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Subject</label>
                <input 
                  type="text" 
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="New Collection Drop"
                  className="bg-[#f8f8f8] border border-[#e5e5e5] h-12 px-4 text-xs font-mono outline-none focus:border-[#a58c69] transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Message (HTML allowed)</label>
                <textarea 
                  required
                  rows={8}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="bg-[#f8f8f8] border border-[#e5e5e5] p-4 text-xs font-mono outline-none focus:border-[#a58c69] transition-colors resize-none"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isSending}
                className="bg-[#1c1a19] text-white h-12 font-bold uppercase text-[10px] tracking-widest hover:bg-[#a58c69] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSending ? (
                  <>
                    <Icon icon="lucide:loader" className="animate-spin" width="18" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Icon icon="lucide:send" width="16" />
                    Broadcast Message
                  </>
                )}
              </button>

              {status && (
                <div className={`p-4 text-[10px] uppercase tracking-widest font-bold ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-500'}`}>
                  {status.message}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Subscriber List */}
        <div className="flex flex-col gap-6">
          <div className="bg-white border border-[#e5e5e5] overflow-hidden">
            <div className="p-6 border-b border-[#f0f0f0] flex justify-between items-center bg-[#fafafa]">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#1c1a19]">Active Subscribers ({subscribers.length})</h2>
              <button 
                onClick={fetchSubscribers} 
                className="text-[10px] font-mono uppercase text-[#a58c69] hover:underline"
              >
                Refresh
              </button>
            </div>
            
            <div className="max-h-[500px] overflow-y-auto">
              {isLoading ? (
                <div className="p-12 flex justify-center text-gray-400"><Icon icon="lucide:loader" className="animate-spin" width="24" /></div>
              ) : subscribers.length === 0 ? (
                <div className="p-12 text-center text-xs font-mono text-gray-400">No subscribers yet.</div>
              ) : (
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-[#fafafa] border-b border-[#f0f0f0]">
                    <tr>
                      <th className="px-6 py-3 text-[9px] font-bold uppercase tracking-widest text-gray-500">Email</th>
                      <th className="px-6 py-3 text-[9px] font-bold uppercase tracking-widest text-gray-500 text-right">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f0f0]">
                    {subscribers.map((s) => (
                      <tr key={s.id} className="hover:bg-[#fafafa] transition-colors">
                        <td className="px-6 py-4 text-xs font-bold text-[#1c1a19]">{s.email}</td>
                        <td className="px-6 py-4 text-[10px] font-mono text-gray-400 text-right">
                          {new Date(s.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
