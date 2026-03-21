"use client";

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchFeedback = async () => {
    try {
      const res = await fetch(`/api/feedback?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data);
      } else {
        setError("Failed to fetch feedback");
      }
    } catch (err) {
      setError("An error occurred while fetching feedback");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this feedback?")) return;

    setDeletingId(id);
    const token = localStorage.getItem("mnada_admin_token");

    try {
      const res = await fetch(`/api/feedback?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setFeedbacks(prev => prev.filter(f => (f.id || f.created_at) !== id));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete feedback");
      }
    } catch (err) {
      alert("An error occurred while deleting feedback");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#a58c69]">Management</span>
        <h1 className="text-3xl font-bold uppercase tracking-tight text-[#1c1a19]">Customer Feedback</h1>
        <p className="text-sm font-mono text-gray-400">Review and manage customer feedback and star ratings.</p>
      </div>

      <div className="bg-white border border-[#e5e5e5] overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-4 text-gray-400">
            <Icon icon="lucide:loader" className="animate-spin" width="24" />
            <span className="text-xs font-mono uppercase tracking-widest">Loading feedback...</span>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-sm font-mono text-red-500">{error}</p>
            <button onClick={fetchFeedback} className="mt-4 text-xs font-mono uppercase underline text-[#a58c69]">Try again</button>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="p-12 text-center text-gray-400 font-mono text-sm">
            No feedback found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e5e5e5] bg-[#fafafa]">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Customer</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Feedback</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-center">Rating</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Date</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0f0]">
                {feedbacks.map((f) => {
                  const id = f.id || f.created_at;
                  return (
                    <tr key={id} className="hover:bg-[#fafafa] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-[#1c1a19]">{f.name}</span>
                          <span className="text-[10px] font-mono text-gray-400">{f.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 max-w-md line-clamp-2" title={f.message}>
                          {f.message}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-0.5 text-[#a58c69]">
                          {[...Array(5)].map((_, i) => (
                            <Icon
                              key={i}
                              icon="lucide:star"
                              className={`w-3 h-3 ${i < (f.rating || 5) ? 'fill-current' : 'text-gray-200 fill-transparent'}`}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[10px] font-mono text-gray-400 capitalize whitespace-nowrap">
                        {new Date(f.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(id)}
                          disabled={deletingId === id}
                          className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                          title="Delete Feedback"
                        >
                          {deletingId === id ? (
                            <Icon icon="lucide:loader" className="animate-spin" width="16" />
                          ) : (
                            <Icon icon="lucide:trash-2" width="18" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
