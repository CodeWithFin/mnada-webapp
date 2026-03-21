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
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);

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

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', slug: '', hero_image_url: '' });
    setSelectedFile(null);
    setStatus(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category: any) => {
    setEditingCategory(category);
    setFormData({ 
      name: category.name, 
      slug: category.slug, 
      hero_image_url: category.hero_image_url || '' 
    });
    setSelectedFile(null);
    setStatus(null);
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      // Auto-generate slug from name if slug is empty or matches previous name-based slug
      if (name === 'name' && !editingCategory && (!prev.slug || prev.slug === prev.name.toLowerCase().replace(/\s+/g, '-'))) {
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

    const { error } = await supabase.storage
      .from('categories')
      .upload(filePath, file);

    if (error) throw error;

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
      const method = editingCategory ? 'PUT' : 'POST';
      const body = editingCategory 
        ? { ...formData, id: editingCategory.id, hero_image_url }
        : { ...formData, hero_image_url };

      const res = await fetch('/api/admin/categories', {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setStatus({ type: 'success', message: `Category ${editingCategory ? 'updated' : 'created'} successfully!` });
        setTimeout(() => {
          setIsModalOpen(false);
          fetchCategories();
        }, 800);
      } else {
        const data = await res.json();
        setStatus({ type: 'error', message: data.error || 'Failed to save category.' });
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
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#a58c69]">Page Builder</span>
            <h1 className="text-3xl font-bold uppercase tracking-tight text-[#1c1a19]">Category Pages</h1>
          </div>
          <button 
            onClick={openAddModal}
            className="bg-[#1c1a19] text-white px-6 h-12 font-bold uppercase text-[10px] tracking-widest hover:bg-[#a58c69] transition-all flex items-center gap-2"
          >
            <Icon icon="lucide:plus" width="16" />
            Add Category Page
          </button>
        </div>
        <p className="text-sm font-mono text-gray-400">Manage store categories and their unique landing pages.</p>
      </div>

      {/* Categories List */}
      <div className="bg-white border border-[#e5e5e5] overflow-hidden">
        <div className="p-6 border-b border-[#f0f0f0] bg-[#fafafa]">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#1c1a19]">Active Pages ({categories.length})</h2>
        </div>
        
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 flex justify-center text-gray-400"><Icon icon="lucide:loader" className="animate-spin" width="24" /></div>
          ) : categories.length === 0 ? (
            <div className="p-12 text-center text-xs font-mono text-gray-400">No category pages created yet.</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-[#fafafa] border-b border-[#f0f0f0]">
                <tr>
                  <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-widest text-gray-500">Name / Slug</th>
                  <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-widest text-gray-500">Hero Image</th>
                  <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-widest text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0f0]">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-[#fafafa] transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#1c1a19]">{cat.name}</span>
                        <span className="text-[10px] font-mono text-gray-400">/category/{cat.slug}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                        {cat.hero_image_url ? (
                            <div className="w-20 h-12 bg-gray-100 border border-gray-200 overflow-hidden rounded-sm">
                                <img src={cat.hero_image_url} alt="" className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-20 h-12 bg-gray-50 border border-dashed border-gray-300 flex items-center justify-center rounded-sm">
                                <Icon icon="lucide:image" width="16" className="text-gray-300" />
                            </div>
                        )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <a 
                            href={`/category/${cat.slug}`} 
                            target="_blank"
                            className="p-2 text-gray-400 hover:text-[#a58c69] transition-colors"
                            title="View Page"
                        >
                            <Icon icon="lucide:external-link" width="18" />
                        </a>
                        <button 
                            onClick={() => openEditModal(cat)}
                            className="p-2 text-gray-400 hover:text-[#1c1a19] transition-colors"
                            title="Edit Page"
                        >
                            <Icon icon="lucide:edit-3" width="18" />
                        </button>
                        <button 
                            onClick={() => handleDelete(cat.id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete"
                        >
                            <Icon icon="lucide:trash-2" width="18" />
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

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isSubmitting && setIsModalOpen(false)}></div>
          
          <div className="relative bg-white w-full max-w-md shadow-2xl animate-in zoom-in duration-300 overflow-hidden">
            <div className="p-8 border-b border-[#f0f0f0] flex justify-between items-center bg-[#fafafa]">
              <h2 className="text-lg font-bold uppercase tracking-widest text-[#1c1a19]">
                {editingCategory ? 'Edit Category Page' : 'New Category Page'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black transition-colors">
                <Icon icon="lucide:x" width="24" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Page Name</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Mens, Accessories..."
                  className="bg-[#f8f8f8] border border-[#e5e5e5] h-12 px-4 text-xs font-mono outline-none focus:border-[#a58c69] transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">URL Slug</label>
                <input 
                  type="text" 
                  name="slug"
                  required
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="e.g. men, accessories..."
                  className="bg-[#f8f8f8] border border-[#e5e5e5] h-12 px-4 text-xs font-mono outline-none focus:border-[#a58c69] transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Hero Image</label>
                <div className="flex flex-col gap-4">
                    {formData.hero_image_url && !selectedFile && (
                        <div className="w-full h-32 bg-gray-50 border border-[#e5e5e5] overflow-hidden rounded-sm relative group">
                            <img src={formData.hero_image_url} alt="Current hero" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white text-[10px] font-bold uppercase">Current Image</span>
                            </div>
                        </div>
                    )}
                    <div className="flex flex-col gap-2">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleFileChange}
                          className="text-xs font-mono file:mr-4 file:py-2 file:px-4 file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-[#1c1a19] file:text-white hover:file:bg-[#a58c69] cursor-pointer"
                        />
                        <p className="text-[9px] text-gray-400 uppercase font-bold tracking-tighter">Uploading a new image will replace the current one.</p>
                    </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 mt-4">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-[#1c1a19] text-white h-14 font-bold uppercase text-xs tracking-[0.2em] hover:bg-[#a58c69] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Icon icon="lucide:loader" className="animate-spin" width="18" /> : <Icon icon="lucide:save" width="18" />}
                  {isSubmitting ? 'Saving Changes...' : (editingCategory ? 'Update Page' : 'Create Page')}
                </button>

                {uploadProgress !== null && (
                  <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#a58c69] transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                )}

                {status && (
                  <div className={`p-4 text-[10px] uppercase tracking-widest font-bold text-center ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-500'}`}>
                    {status.message}
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
