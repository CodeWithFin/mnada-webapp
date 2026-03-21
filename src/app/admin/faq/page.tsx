"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";

type FAQ = {
  id: string;
  question: string;
  answer: string | null;
  status: "pending" | "published" | "archived";
  category: string;
  author_name: string | null;
  author_email: string | null;
  created_at: string;
  is_featured: boolean;
};

export default function AdminFaqPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchFaqs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/faqs", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("mnada_admin_token")}`,
        },
      });
      if (res.ok) {
        setFaqs(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch FAQs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq) return;

    setIsSaving(true);
    setMsg(null);

    try {
      const res = await fetch("/api/admin/faqs", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("mnada_admin_token")}`,
        },
        body: JSON.stringify(editingFaq),
      });

      if (res.ok) {
        setMsg({ type: "success", text: "FAQ updated successfully" });
        setEditingFaq(null);
        fetchFaqs();
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to update FAQ");
      }
    } catch (err) {
      setMsg({ type: "error", text: err instanceof Error ? err.message : "Error saving FAQ" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;

    try {
      const res = await fetch(`/api/admin/faqs?id=${id}`, { 
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("mnada_admin_token")}`,
        },
      });
      if (res.ok) {
        fetchFaqs();
      }
    } catch (err) {
      console.error("Failed to delete FAQ:", err);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-4">
          <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#a58c69]">Knowledge Base</span>
          <h1 className="text-4xl font-bold uppercase tracking-tight text-[#1c1a19]">FAQ Management</h1>
          <p className="text-sm font-mono text-gray-500 max-w-xl">
            Review and answer customer questions. Publish them to make them visible on the storefront FAQ page.
          </p>
        </div>
      </div>

      {msg && (
        <div className={`p-4 border text-xs font-mono uppercase tracking-widest ${msg.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
          {msg.text}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
          <Icon icon="lucide:loader" className="animate-spin" /> Loading frequencies...
        </div>
      ) : faqs.length === 0 ? (
        <div className="p-12 border border-dashed border-gray-200 rounded-lg text-center flex flex-col items-center gap-4">
          <Icon icon="lucide:message-circle-question" className="text-gray-200 w-12 h-12" />
          <p className="text-sm font-mono text-gray-400">No questions found yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {faqs.map((faq) => (
            <div key={faq.id} className="bg-white border border-[#e5e5e5] p-6 flex flex-col gap-4 group hover:border-[#1c1a19] transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-2 flex-grow">
                  <div className="flex items-center gap-3">
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 tracking-widest ${faq.status === 'published' ? 'bg-green-100 text-green-800' : faq.status === 'pending' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}`}>
                      {faq.status}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{faq.category}</span>
                  </div>
                  <h3 className="text-lg font-bold uppercase tracking-tight text-[#1c1a19]">{faq.question}</h3>
                  {faq.author_name && (
                    <p className="text-[10px] font-mono text-gray-400 italic">Asked by: {faq.author_name} {faq.author_email ? `(${faq.author_email})` : ''} on {new Date(faq.created_at).toLocaleDateString()}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditingFaq(faq)} className="p-2 hover:bg-[#f8f8f8] text-gray-400 hover:text-[#1c1a19] transition-colors" title="Edit/Answer">
                    <Icon icon="lucide:edit" width="18" />
                  </button>
                  <button onClick={() => handleDelete(faq.id)} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors" title="Delete">
                    <Icon icon="lucide:trash-2" width="18" />
                  </button>
                </div>
              </div>
              {faq.answer && (
                <div className="pt-4 border-t border-[#f0f0f0]">
                  <p className="text-sm font-mono text-gray-600 leading-6">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingFaq && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-5">
          <div className="w-full max-w-2xl bg-white border border-[#1c1a19] p-8 flex flex-col gap-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold uppercase tracking-tight text-[#1c1a19]">Answer Question</h2>
              <button onClick={() => setEditingFaq(null)} className="text-gray-400 hover:text-[#1c1a19]">
                <Icon icon="lucide:x" width="24" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Question</label>
                <textarea
                  value={editingFaq.question}
                  onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                  className="min-h-[80px] border border-[#e5e5e5] p-3 font-mono text-sm focus:outline-none focus:border-[#1c1a19]"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Answer</label>
                <textarea
                  value={editingFaq.answer || ""}
                  onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                  placeholder="Provide an answer..."
                  className="min-h-[150px] border border-[#e5e5e5] p-3 font-mono text-sm focus:outline-none focus:border-[#1c1a19]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Category</label>
                  <input
                    value={editingFaq.category}
                    onChange={(e) => setEditingFaq({ ...editingFaq, category: e.target.value })}
                    className="h-12 border border-[#e5e5e5] px-4 font-mono text-sm focus:outline-none focus:border-[#1c1a19]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Status</label>
                  <select
                    value={editingFaq.status}
                    onChange={(e) => setEditingFaq({ ...editingFaq, status: e.target.value as any })}
                    className="h-12 border border-[#e5e5e5] px-4 font-mono text-sm focus:outline-none focus:border-[#1c1a19] bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={editingFaq.is_featured}
                  onChange={(e) => setEditingFaq({ ...editingFaq, is_featured: e.target.checked })}
                  className="w-4 h-4 border-[#e5e5e5] accent-[#1c1a19]"
                />
                <label htmlFor="is_featured" className="text-xs font-bold uppercase tracking-widest text-[#1c1a19] cursor-pointer">Feature this FAQ</label>
              </div>

              <div className="flex gap-4 pt-4 border-t border-[#f0f0f0]">
                <button
                  type="button"
                  onClick={() => setEditingFaq(null)}
                  className="flex-1 h-14 border border-[#e5e5e5] font-bold uppercase tracking-widest text-xs hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 h-14 bg-[#1c1a19] text-white font-bold uppercase tracking-widest text-xs hover:bg-[#a58c69] transition-colors disabled:opacity-60"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
