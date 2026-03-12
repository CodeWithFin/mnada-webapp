'use client';

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

interface Category {
  id: string;
  name: string;
  created_at?: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [error, setError] = useState('');
  
  // Notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.filter((c: any) => c.name !== 'SYSTEM_AUTH'));
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryName(category.name);
    } else {
      setEditingCategory(null);
      setCategoryName('');
    }
    setIsModalOpen(true);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      setError("Name is required");
      return;
    }

    const token = localStorage.getItem('mnada_admin_token');
    const method = editingCategory ? 'PUT' : 'POST';
    const body = editingCategory 
      ? JSON.stringify({ id: editingCategory.id, name: categoryName })
      : JSON.stringify({ name: categoryName });

    try {
      const res = await fetch('/api/admin/categories', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body
      });

      if (res.ok) {
        setIsModalOpen(false);
        showToast(`Category ${editingCategory ? 'updated' : 'created'} successfully`);
        fetchCategories();
      } else {
        const data = await res.json();
        setError(data.error || "Something went wrong");
      }
    } catch (err) {
      setError("Failed to save category");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    setIsDeleting(true);
    const token = localStorage.getItem('mnada_admin_token');
    try {
      const res = await fetch(`/api/admin/categories?id=${deleteConfirm.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        showToast("Category deleted successfully");
        setDeleteConfirm(null);
        fetchCategories();
      } else {
        showToast("Failed to delete category", "error");
      }
    } catch (err) {
      showToast("Error deleting category", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-mono uppercase tracking-[0.2em] text-[#1c1a19]">Categories</h1>
          <p className="text-sm font-mono text-gray-500 mt-2">Manage product categories</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-[#1c1a19] text-white px-8 py-4 text-xs font-mono uppercase tracking-widest hover:bg-[#a58c69] transition-all flex items-center gap-2"
        >
          <Icon icon="lucide:plus" /> Add Category
        </button>
      </div>

      <div className="bg-white border border-[#eaeaea]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#eaeaea] bg-[#fafafa]">
                <th className="px-8 py-5 text-[10px] font-mono uppercase tracking-widest text-gray-400">Name</th>
                <th className="px-8 py-5 text-[10px] font-mono uppercase tracking-widest text-gray-400">Created At</th>
                <th className="px-8 py-5 text-[10px] font-mono uppercase tracking-widest text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaeaea]">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-8 py-10 text-center font-mono text-xs text-gray-400">Loading...</td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-8 py-10 text-center font-mono text-xs text-gray-400">No categories found</td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="hover:bg-[#fafafa] transition-colors group">
                    <td className="px-8 py-5">
                      <span className="text-sm font-mono text-[#1c1a19] capitalize">{category.name}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-mono text-gray-400 whitespace-nowrap">
                        {category.created_at ? new Date(category.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-4">
                        <button 
                          onClick={() => handleOpenModal(category)}
                          className="text-gray-400 hover:text-[#a58c69] transition-colors"
                          title="Edit"
                        >
                          <Icon icon="lucide:edit-2" width="16" />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirm(category)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Icon icon="lucide:trash-2" width="16" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-10 right-10 z-[100] animate-in slide-in-from-right-10 duration-500`}>
          <div className={`${toast.type === 'success' ? 'bg-[#1c1a19]' : 'bg-red-600'} text-white px-8 py-4 flex items-center gap-3 shadow-2xl border-l-4 ${toast.type === 'success' ? 'border-[#a58c69]' : 'border-white'}`}>
            <Icon icon={toast.type === 'success' ? "lucide:check-circle" : "lucide:alert-circle"} width="20" />
            <span className="text-xs font-mono uppercase tracking-widest">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-md border border-[#eaeaea] p-10 animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col items-center text-center gap-6">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                <Icon icon="lucide:alert-triangle" width="32" />
              </div>
              <div>
                <h2 className="text-xl font-mono uppercase tracking-widest text-[#1c1a19]">Delete Category?</h2>
                <p className="text-sm font-mono text-gray-500 mt-4 leading-relaxed">
                  Are you sure you want to delete <span className="text-[#1c1a19] font-bold">"{deleteConfirm.name}"</span>?
                  <br />
                  <span className="text-xs mt-2 block">Products in this category will remain, but their category label will be outdated.</span>
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 w-full mt-4">
                <button 
                  onClick={() => setDeleteConfirm(null)}
                  disabled={isDeleting}
                  className="px-8 py-4 text-xs font-mono uppercase tracking-widest border border-[#eaeaea] hover:bg-[#fafafa] transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-red-600 text-white px-8 py-4 text-xs font-mono uppercase tracking-widest hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isDeleting ? <Icon icon="lucide:loader" className="animate-spin" /> : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md border border-[#eaeaea] p-10 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-start mb-10">
              <h2 className="text-xl font-mono uppercase tracking-widest text-[#1c1a19]">
                {editingCategory ? 'Edit Category' : 'New Category'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-[#1c1a19]">
                <Icon icon="lucide:x" width="20" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Category Name</label>
                <input 
                  type="text" 
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full border-b border-[#eaeaea] py-3 focus:outline-none focus:border-[#a58c69] text-sm font-mono transition-colors"
                  placeholder="e.g., Children's clothes"
                />
                {error && <p className="text-[10px] text-red-500 font-mono uppercase tracking-widest">{error}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-4 text-xs font-mono uppercase tracking-widest border border-[#eaeaea] hover:bg-[#fafafa] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-[#1c1a19] text-white px-8 py-4 text-xs font-mono uppercase tracking-widest hover:bg-[#a58c69] transition-all"
                >
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
