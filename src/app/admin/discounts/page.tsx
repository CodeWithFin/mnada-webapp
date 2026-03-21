"use client";

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

export default function AdminDiscountsPage() {
  const [codes, setCodes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [percentage, setPercentage] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchCodes = async () => {
    try {
      const token = localStorage.getItem("mnada_admin_token");
      const res = await fetch(`/api/admin/discount-codes?t=${Date.now()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCodes(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);
    const token = localStorage.getItem("mnada_admin_token");

    try {
      const res = await fetch('/api/admin/discount-codes', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code: newCode, percentage }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: 'success', message: `Code ${newCode.toUpperCase()} created successfully!` });
        setNewCode('');
        setPercentage('');
        fetchCodes();
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to create code.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'An error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCode = async (id: string) => {
    if (!confirm("Are you sure you want to delete this discount code?")) return;

    const token = localStorage.getItem("mnada_admin_token");
    try {
      const res = await fetch(`/api/admin/discount-codes?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        fetchCodes();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-12 max-w-6xl">
      <div className="flex flex-col gap-3">
        <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#a58c69]">Promotions</span>
        <h1 className="text-3xl font-bold uppercase tracking-tight text-[#1c1a19]">Discount Codes</h1>
        <p className="text-sm font-mono text-gray-400">Create and manage percentages-based promotional codes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Creation Form */}
        <div className="flex flex-col gap-6">
          <div className="bg-white border border-[#e5e5e5] p-8">
            <h2 className="text-lg font-bold uppercase tracking-widest mb-6 pb-4 border-b border-[#f0f0f0]">New Discount Code</h2>
            <form onSubmit={handleCreateCode} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Code Name</label>
                <input 
                  type="text" 
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="e.g. SUMMER25"
                  className="bg-[#f8f8f8] border border-[#e5e5e5] h-12 px-4 text-xs font-mono outline-none focus:border-[#a58c69] transition-colors uppercase"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Discount Percentage (%)</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  max="100"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                  placeholder="20"
                  className="bg-[#f8f8f8] border border-[#e5e5e5] h-12 px-4 text-xs font-mono outline-none focus:border-[#a58c69] transition-colors"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-[#1c1a19] text-white h-12 font-bold uppercase text-[10px] tracking-widest hover:bg-[#a58c69] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Icon icon="lucide:loader" className="animate-spin" width="18" />
                ) : (
                  <>
                    <Icon icon="lucide:plus" width="16" />
                    Create Discount
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

        {/* List */}
        <div className="flex flex-col gap-6">
          <div className="bg-white border border-[#e5e5e5] overflow-hidden">
            <div className="p-6 border-b border-[#f0f0f0] flex justify-between items-center bg-[#fafafa]">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#1c1a19]">Active Codes ({codes.length})</h2>
              <button 
                onClick={fetchCodes} 
                className="text-[10px] font-mono uppercase text-[#a58c69] hover:underline"
              >
                Refresh
              </button>
            </div>
            
            <div className="max-h-[500px] overflow-y-auto">
              {isLoading ? (
                <div className="p-12 flex justify-center text-gray-400"><Icon icon="lucide:loader" className="animate-spin" width="24" /></div>
              ) : codes.length === 0 ? (
                <div className="p-12 text-center text-xs font-mono text-gray-400">No active codes.</div>
              ) : (
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-[#fafafa] border-b border-[#f0f0f0]">
                    <tr>
                      <th className="px-6 py-3 text-[9px] font-bold uppercase tracking-widest text-gray-500">Code</th>
                      <th className="px-6 py-3 text-[9px] font-bold uppercase tracking-widest text-gray-500">Discount</th>
                      <th className="px-6 py-3 text-[9px] font-bold uppercase tracking-widest text-gray-500 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f0f0]">
                    {codes.map((c) => (
                      <tr key={c.id} className="hover:bg-[#fafafa] transition-colors">
                        <td className="px-6 py-4 text-xs font-bold text-[#1c1a19]">{c.code}</td>
                        <td className="px-6 py-4 text-xs font-mono text-[#a58c69]">{c.percentage}% OFF</td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleDeleteCode(c.id)}
                            className="text-red-400 hover:text-red-600 transition-colors"
                          >
                            <Icon icon="lucide:trash-2" width="16" />
                          </button>
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
