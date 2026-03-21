"use client";

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { supabase } from '@/lib/supabase';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    hero_image_url: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("mnada_admin_token");
      const res = await fetch('/api/admin/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
        
        // Check if we need to seed "Mens" and "Womens" if they are missing
        const hasMens = data.some((c: any) => c.slug === 'men');
        const hasWomens = data.some((c: any) => c.slug === 'women');
        
        if (!hasMens || !hasWomens) {
          console.log("Seeding initial categories...");
          // We can't easily seed from browser without token/auth, 
          // but we can suggest the admin to create them or just do it via API if token is there.
        }
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `hero/${fileName}`;

    const { data, error } = await supabase.storage
      .from('categories')
      .upload(filePath, file);

    if (error) {
      if (error.message.includes('not found')) {
        // Attempt to create bucket (this might fail if RLS/Permissions don't allow)
        throw new Error("Storage bucket 'categories' not found. Please create it in Supabase dashboard.");
      }
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('categories')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);
    setUploadProgress(0);

    try {
      let hero_image_url = formData.hero_image_url;

      if (selectedFile) {
        setUploadProgress(20);
        hero_image_url = await uploadImage(selectedFile);
        setUploadProgress(80);
      }

      const token = localStorage.getItem("mnada_admin_token");
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, hero_image_url }),
      });

      if (res.ok) {
        setStatus({ type: 'success', message: 'Category page created successfully!' });
        setFormData({ name: '', slug: '', hero_image_url: '' });
        setSelectedFile(null);
        fetchCategories();
      } else {
        const data = await res.json();
        setStatus({ type: 'error', message: data.error || 'Failed to create category.' });
      }
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', message: err.message || 'An error occurred.' });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category page?')) return;

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
        <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#a58c69]">Page Builder</span>
        <h1 className="text-3xl font-bold uppercase tracking-tight text-[#1c1a19]">Category Pages</h1>
        <p className="text-sm font-mono text-gray-400">Add or edit category landing pages. You can customize the hero section for each category.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Create Category Form */}
        <div className="flex flex-col gap-6">
          <div className="bg-white border border-[#e5e5e5] p-8">
            <h2 className="text-lg font-bold uppercase tracking-widest mb-6 pb-4 border-b border-[#f0f0f0]">Add New Page</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Page Name (e.g. Mens)</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Mens, Womens, Accessories..."
                  className="bg-[#f8f8f8] border border-[#e5e5e5] h-12 px-4 text-xs font-mono outline-none focus:border-[#a58c69] transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">URL Slug (e.g. accessories)</label>
                <input 
                  type="text" 
                  name="slug"
                  required
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="men, women, accessories..."
                  className="bg-[#f8f8f8] border border-[#e5e5e5] h-12 px-4 text-xs font-mono outline-none focus:border-[#a58c69] transition-colors"
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Hero Section Image</label>
                <div className="flex flex-col gap-3">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileChange}
                      className="text-xs font-mono file:mr-4 file:py-2 file:px-4 file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-[#1c1a19] file:text-white hover:file:bg-[#a58c69] cursor-pointer"
                    />
                    <div className="flex items-center gap-4">
                        <div className="h-[1px] flex-grow bg-gray-200"></div>
                        <span className="text-[9px] text-gray-400 uppercase font-bold">or use URL</span>
                        <div className="h-[1px] flex-grow bg-gray-200"></div>
                    </div>
                    <input 
                      type="url" 
                      name="hero_image_url"
                      value={formData.hero_image_url}
                      onChange={handleInputChange}
                      placeholder="https://images.unsplash.com/..."
                      className="bg-[#f8f8f8] border border-[#e5e5e5] h-10 px-4 text-xs font-mono outline-none focus:border-[#a58c69] transition-colors"
                    />
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-[#1c1a19] text-white h-12 font-bold uppercase text-[10px] tracking-widest hover:bg-[#a58c69] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Icon icon="lucide:loader" className="animate-spin" width="18" /> : <Icon icon="lucide:plus" width="16" />}
                {isSubmitting ? 'Uploading & Creating...' : 'Add Page'}
              </button>

              {uploadProgress !== null && (
                  <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#a58c69] transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
              )}

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
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#1c1a19]">Manage Pages ({categories.length})</h2>
            </div>
            
            <div className="max-h-[500px] overflow-y-auto">
              {isLoading ? (
                <div className="p-12 flex justify-center text-gray-400"><Icon icon="lucide:loader" className="animate-spin" width="24" /></div>
              ) : categories.length === 0 ? (
                <div className="p-12 text-center text-xs font-mono text-gray-400">No category pages created yet.</div>
              ) : (
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-[#fafafa] border-b border-[#f0f0f0]">
                    <tr>
                      <th className="px-6 py-3 text-[9px] font-bold uppercase tracking-widest text-gray-500">Name / Slug</th>
                      <th className="px-6 py-3 text-[9px] font-bold uppercase tracking-widest text-gray-500">Preview</th>
                      <th className="px-6 py-3 text-[9px] font-bold uppercase tracking-widest text-gray-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f0f0]">
                    {categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-[#fafafa] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-[#1c1a19]">{cat.name}</span>
                            <span className="text-[10px] font-mono text-gray-400">/category/{cat.slug}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                            {cat.hero_image_url ? (
                                <div className="w-12 h-12 bg-gray-100 border border-gray-200 overflow-hidden">
                                    <img src={cat.hero_image_url} alt="" className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className="w-12 h-12 bg-gray-50 border border-dashed border-gray-300 flex items-center justify-center">
                                    <Icon icon="lucide:image" width="16" className="text-gray-300" />
                                </div>
                            )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <a 
                                href={`/category/${cat.slug}`} 
                                target="_blank"
                                className="p-2 text-gray-400 hover:text-[#a58c69] transition-colors"
                            >
                                <Icon icon="lucide:external-link" width="16" />
                            </a>
                            <button 
                                onClick={() => handleDelete(cat.id)}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <Icon icon="lucide:trash-2" width="16" />
                            </button>
                          </div>
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
