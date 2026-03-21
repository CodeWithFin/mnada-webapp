"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";

interface Seller {
  id: string;
  name: string;
  email: string;
  commission_rate: number;
  status: string;
  created_at: string;
  business_category?: string;
  estimated_sales?: string;
}

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [needsSchemaUpdate, setNeedsSchemaUpdate] = useState(false);
  const [activeTab, setActiveTab] = useState<"approved" | "pending">("approved");
  
  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSellerId, setEditingSellerId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    commission_rate: "0.10",
    status: "approved"
  });

  const fetchSellers = async () => {
    setIsLoading(true);
    const authHeader = `Bearer ${localStorage.getItem('mnada_admin_token')}`;
    try {
      const res = await fetch('/api/admin/sellers', {
        headers: { 'Authorization': authHeader }
      });
      if (res.ok) {
        const data = await res.json();
        setSellers(data);
        
        // Check if any seller is missing 'status' field (schema check)
        const hasMissingStatus = data.length > 0 && data.some((s: any) => s.status === undefined);
        setNeedsSchemaUpdate(hasMissingStatus);
      }
    } catch (err) {
      console.error("Failed to fetch sellers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditClick = (seller: Seller) => {
    setEditingSellerId(seller.id);
    setFormData({
      name: seller.name,
      email: seller.email,
      password: "", 
      commission_rate: seller.commission_rate.toString(),
      status: seller.status
    });
    setIsModalOpen(true);
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setIsSaving(true);
    const authHeader = `Bearer ${localStorage.getItem('mnada_admin_token')}`;
    try {
      const res = await fetch('/api/admin/sellers', {
        method: 'PUT',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (res.ok) {
        fetchSellers();
      } else {
        const err = await res.json();
        alert("Error: " + err.error);
      }
    } catch (err) {
      alert("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setEditingSellerId(null);
    setFormData({ name: "", email: "", password: "", commission_rate: "0.10", status: "approved" });
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const authHeader = `Bearer ${localStorage.getItem('mnada_admin_token')}`;

    try {
      const payload = {
        ...formData,
        id: editingSellerId,
        commission_rate: parseFloat(formData.commission_rate)
      };

      const method = editingSellerId ? 'PUT' : 'POST';
      const response = await fetch('/api/admin/sellers', {
        method,
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        resetForm();
        fetchSellers();
      } else {
        const err = await response.json();
        alert("Error: " + err.error);
      }
    } catch (error: any) {
      alert("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this seller?")) return;
    
    const authHeader = `Bearer ${localStorage.getItem('mnada_admin_token')}`;
    try {
      const res = await fetch(`/api/admin/sellers?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': authHeader }
      });
      if (res.ok) {
        setSellers(sellers.filter(s => s.id !== id));
      }
    } catch (err) {
      alert("Could not delete seller");
    }
  };

  const filteredSellers = sellers.filter(s => {
    const status = s.status || "pending"; // Default to pending if missing
    return status === activeTab;
  });

  return (
    <div className="flex flex-col gap-8 font-mono text-[#1c1a19]">
      {needsSchemaUpdate && (
        <div className="p-6 bg-amber-50 border border-amber-200 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3 text-amber-700">
            <Icon icon="lucide:alert-triangle" width="20" />
            <span className="text-xs font-bold uppercase tracking-widest">Database Update Required</span>
          </div>
          <p className="text-[11px] leading-relaxed text-amber-800">
            The multi-seller approval flow is active in the code, but your database is missing the <code className="bg-amber-100 px-1 font-bold">status</code> column. 
            The buttons below will not work until you run the SQL update in your Supabase Dashboard.
          </p>
          <div className="bg-[#1c1a19] p-4 font-mono text-[10px] text-gray-400 overflow-x-auto">
            ALTER TABLE public.sellers ADD COLUMN status TEXT DEFAULT 'pending';<br/>
            ALTER TABLE public.sellers ADD COLUMN business_category TEXT;<br/>
            ALTER TABLE public.sellers ADD COLUMN estimated_sales TEXT;
          </div>
        </div>
      )}

      <header className="flex flex-col gap-4 border-b border-[#e5e5e5] pb-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-tight text-[#1c1a19]">Sellers</h1>
            <p className="text-sm text-gray-400 mt-2 uppercase tracking-widest">Manage third-party manufacturers and applications</p>
          </div>
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="h-10 px-6 bg-[#1c1a19] text-white font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-[#a58c69] transition-colors"
          >
            <Icon icon="lucide:plus" width="16" /> Add Seller
          </button>
        </div>

        <div className="flex gap-8 mt-4">
          <button 
            onClick={() => setActiveTab("approved")}
            className={`text-xs font-bold uppercase tracking-[0.2em] pb-2 border-b-2 transition-colors ${activeTab === "approved" ? "border-[#a58c69] text-[#1c1a19]" : "border-transparent text-gray-400 hover:text-gray-600"}`}
          >
            Active Sellers ({sellers.filter(s => s.status === "approved").length})
          </button>
          <button 
            onClick={() => setActiveTab("pending")}
            className={`text-xs font-bold uppercase tracking-[0.2em] pb-2 border-b-2 transition-colors ${activeTab === "pending" ? "border-[#a58c69] text-[#1c1a19]" : "border-transparent text-gray-400 hover:text-gray-600"}`}
          >
            Pending Approvals ({sellers.filter(s => s.status === "pending").length})
          </button>
        </div>
      </header>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-5 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-[#e5e5e5] bg-[#f8f8f8]">
              <h2 className="text-xl font-bold uppercase tracking-widest text-[#1c1a19]">
                {editingSellerId ? "Edit Seller" : "Add New Seller"}
              </h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-[#1c1a19]">
                <Icon icon="lucide:x" width="24" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full h-12 border border-[#e5e5e5] px-4 text-sm focus:outline-none focus:border-[#1c1a19]"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full h-12 border border-[#e5e5e5] px-4 text-sm focus:outline-none focus:border-[#1c1a19]"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                  Password {editingSellerId ? "(Leave blank to keep current)" : "*"}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full h-12 border border-[#e5e5e5] px-4 text-sm focus:outline-none focus:border-[#1c1a19]"
                  required={!editingSellerId}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Commission Rate *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    name="commission_rate"
                    value={formData.commission_rate}
                    onChange={handleInputChange}
                    className="w-full h-12 border border-[#e5e5e5] px-4 text-sm focus:outline-none focus:border-[#1c1a19]"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full h-12 border border-[#e5e5e5] px-4 text-sm focus:outline-none focus:border-[#1c1a19] bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-[#e5e5e5] pt-6 flex justify-end gap-4 mt-4">
                <button type="button" onClick={resetForm} className="h-12 px-6 border border-[#e5e5e5] text-gray-500 font-bold uppercase tracking-widest text-xs hover:bg-[#f8f8f8] transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="h-12 px-8 bg-[#1c1a19] text-white font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-[#a58c69] transition-colors disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Seller"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="w-full h-64 flex items-center justify-center">
          <Icon icon="lucide:loader" className="animate-spin text-gray-200" width="32" />
        </div>
      ) : filteredSellers.length === 0 ? (
        <div className="w-full text-center py-20 bg-white border border-[#e5e5e5] flex flex-col items-center gap-4">
          <Icon icon={activeTab === "approved" ? "lucide:users" : "lucide:user-clock"} width="48" className="text-gray-100" />
          <p className="text-xs text-gray-400 uppercase tracking-widest">No {activeTab} sellers found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredSellers.map((seller) => (
            <div key={seller.id} className="bg-white border border-[#e5e5e5] p-6 flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-[#1c1a19] transition-colors">
              <div className="flex items-center gap-6 flex-1">
                <div className="w-14 h-14 bg-[#f8f8f8] flex items-center justify-center text-[#1c1a19] shrink-0">
                  <Icon icon="lucide:user" width="24" />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-[#1c1a19]">{seller.name}</h3>
                    {seller.status === "pending" && (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[9px] font-bold uppercase tracking-widest border border-amber-100">Pending</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{seller.email}</p>
                  {seller.business_category && (
                    <p className="text-[10px] text-[#a58c69] uppercase font-bold tracking-widest mt-1">
                      {seller.business_category} • {seller.estimated_sales}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-8 shrink-0">
                <div className="hidden lg:flex flex-col items-end gap-1">
                  <span className="text-[9px] text-gray-400 uppercase tracking-widest">Joined</span>
                  <span className="text-[10px] font-bold text-[#1c1a19]">{new Date(seller.created_at).toLocaleDateString()}</span>
                </div>
                
                <div className="flex gap-2">
                  {seller.status === "pending" ? (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(seller.id, "approved")}
                        className="h-9 px-4 bg-green-500 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-green-600 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(seller.id, "rejected")}
                        className="h-9 px-4 bg-white text-red-500 border border-red-100 font-bold uppercase tracking-widest text-[10px] hover:bg-red-50 transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditClick(seller)}
                        className="w-9 h-9 bg-white text-[#1c1a19] border border-[#e5e5e5] flex items-center justify-center hover:border-[#1c1a19] transition-colors"
                      >
                        <Icon icon="lucide:edit-2" width="16" />
                      </button>
                      <button
                        onClick={() => handleDelete(seller.id)}
                        className="w-9 h-9 bg-white text-red-500 border border-red-100 flex items-center justify-center hover:bg-red-50 transition-colors"
                      >
                        <Icon icon="lucide:trash-2" width="16" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
