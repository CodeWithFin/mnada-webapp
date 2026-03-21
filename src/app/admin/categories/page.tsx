"use client";

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    hero_image_url: ''
  });

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("mnada_admin_token");
      const res = await fetch('/api/admin/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      // Auto-generate slug from name if slug is empty or matches previous name-based slug
      if (name === 'name' && (!prev.slug || prev.slug === prev.name.toLowerCase().replace(/\s+/g, '-'))) {
        newData.slug = value.toLowerCase().replace(/\s+/g, '-');
      }
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      const token = localStorage.getItem("mnada_admin_token");
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus({ type: 'success', message: 'Category created successfully!' });
        setFormData({ name: '', slug: '', hero_image_url: '' });
        fetchCategories();
      } else {
        const data = await res.json();
        setStatus({ type: 'error', message: data.error || 'Failed to create category.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'An error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const token = localStorage.getItem("mnada_admin_token");
      const res = await fetch(`/api/admin/categories?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        fetchCategories();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-12 max-w-6xl">
      <div className="flex flex-col gap-3">
        <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#a58c69]">Store Management</span>
        <h1 className="text-3xl font-bold uppercase tracking-tight text-[#1c1a19]">Categories</h1>
        <p className="text-sm font-mono text-gray-400">Manage store categories and customize their hero images.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Create Category Form */}
        <div className="flex flex-col gap-6">
          <div className="bg-white border border-[#e5e5e5] p-8">
            <h2 className="text-lg font-bold uppercase tracking-widest mb-6 pb-4 border-b border-[#f0f0f0]">New Category</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Category Name</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Accessories"
                  className="bg-[#f8f8f8] border border-[#e5e5e5] h-12 px-4 text-xs font-mono outline-none focus:border-[#a58c69] transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Slug (URL identifier)</label>
                <input 
                  type="text" 
                  name="slug"
                  required
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="e.g. accessories"
                  className="bg-[#f8f8f8] border border-[#e5e5e5] h-12 px-4 text-xs font-mono outline-none focus:border-[#a58c69] transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Hero Image URL</label>
                <input 
                  type="url" 
                  name="hero_image_url"
                  value={formData.hero_image_url}
                  onChange={handleInputChange}
                  placeholder="https://images.unsplash.com/..."
                  className="bg-[#f8f8f8] border border-[#e5e5e5] h-12 px-4 text-xs font-mono outline-none focus:border-[#a58c69] transition-colors"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-[#1c1a19] text-white h-12 font-bold uppercase text-[10px] tracking-widest hover:bg-[#a58c69] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Icon icon="lucide:loader" className="animate-spin" width="18" /> : <Icon icon="lucide:plus" width="16" />}
                {isSubmitting ? 'Creating...' : 'Create Category'}
              </button>

              {status && (
                <div className={`p-4 text-[10px] uppercase tracking-widest font-bold ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-500'}`}>
                  {status.message}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Categories List */}
        <div className="flex flex-col gap-6">
          <div className="bg-white border border-[#e5e5e5] overflow-hidden">
            <div className="p-6 border-b border-[#f0f0f0] bg-[#fafafa]">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#1c1a19]">Active Categories ({categories.length})</h2>
            </div>
            
            <div className="max-h-[500px] overflow-y-auto">
              {isLoading ? (
                <div className="p-12 flex justify-center text-gray-400"><Icon icon="lucide:loader" className="animate-spin" width="24" /></div>
              ) : categories.length === 0 ? (
                <div className="p-12 text-center text-xs font-mono text-gray-400">No categories created yet.</div>
              ) : (
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-[#fafafa] border-b border-[#f0f0f0]">
                    <tr>
                      <th className="px-6 py-3 text-[9px] font-bold uppercase tracking-widest text-gray-500">Name / Slug</th>
                      <th className="px-6 py-3 text-[9px] font-bold uppercase tracking-widest text-gray-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f0f0]">
                    {categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-[#fafafa] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-[#1c1a19]">{cat.name}</span>
                            <span className="text-[10px] font-mono text-gray-400">/{cat.slug}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleDelete(cat.id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
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
