"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import Image from "next/image";

interface Product {
  id: string;
  mock_id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  is_new: boolean;
  description?: string;
  images?: string[];
}

export default function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  
  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "Men\'s",
    description: "",
    isNew: false
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const fetchProducts = async () => {
    setIsLoading(true);
    const authHeader = `Bearer ${localStorage.getItem('mnada_seller_token')}`;
    try {
      const res = await fetch('/api/seller/products', {
        headers: { 'Authorization': authHeader }
      });
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map((p: any) => {
          let galleryImages = [p.image];
          let cleanDesc = p.description || "";
          if (p.description && p.description.includes("---GALLERY_DATA---")) {
            const parts = p.description.split("---GALLERY_DATA---");
            cleanDesc = parts[0].trim();
            try { galleryImages = JSON.parse(parts[1]); } catch(e) {}
          }
          return { ...p, description: cleanDesc, images: galleryImages };
        });
        setProducts(formatted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories'); // Open for all roles
      if (res.ok) {
        const data = await res.json();
        setCategories(data.filter((c: any) => c.name !== 'SYSTEM_AUTH'));
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setImageFiles(selectedFiles);
      const previews = selectedFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  const resetForm = () => {
    setEditingProductId(null);
    setFormData({ name: "", price: "", category: categories[0]?.name || "Men's", description: "", isNew: false });
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setIsModalOpen(false);
  };

  const handleEditClick = (product: Product) => {
    setEditingProductId(product.id);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      description: product.description || "",
      isNew: product.is_new
    });
    setExistingImages(product.images || [product.image]);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProductId && imageFiles.length === 0) return alert("Select at least one image");

    setIsSaving(true);
    const authHeader = `Bearer ${localStorage.getItem('mnada_seller_token')}`;

    try {
      const form = new FormData();
      if (editingProductId) form.append('id', editingProductId);
      imageFiles.forEach(file => form.append('images', file));
      if (editingProductId) form.append('existingImages', JSON.stringify(existingImages));
      
      form.append('name', formData.name);
      form.append('price', formData.price);
      form.append('category', formData.category);
      form.append('description', formData.description);
      form.append('isNew', String(formData.isNew));

      const method = editingProductId ? 'PUT' : 'POST';
      const response = await fetch('/api/seller/products', {
        method,
        headers: { 'Authorization': authHeader },
        body: form
      });

      if (response.ok) {
        resetForm();
        fetchProducts();
      } else {
        const err = await response.json();
        alert(err.error);
      }
    } catch (err: any) {
      alert("Error saving product");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this product?")) return;
    const authHeader = `Bearer ${localStorage.getItem('mnada_seller_token')}`;
    try {
      const res = await fetch(`/api/seller/products?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': authHeader }
      });
      if (res.ok) setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      alert("Error deleting product");
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex justify-between items-end border-b border-[#e5e5e5] pb-4">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-tight text-[#1c1a19]">My Products</h1>
          <p className="text-sm font-mono text-gray-500 mt-2">Manage your catalog items</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="h-10 px-6 bg-[#1c1a19] text-white font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-[#a58c69] transition-colors"
        >
          <Icon icon="lucide:plus" width="16" /> Add Product
        </button>
      </header>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-5">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-[#e5e5e5] bg-[#f8f8f8] sticky top-0 z-10">
              <h2 className="text-xl font-bold uppercase tracking-widest text-[#1c1a19]">
                {editingProductId ? "Edit Product" : "Add New Product"}
              </h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-[#1c1a19]">
                <Icon icon="lucide:x" width="24" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Product Images</label>
                <div 
                  onClick={() => document.getElementById('seller-product-image')?.click()}
                  className="border-2 border-dashed border-[#e5e5e5] bg-[#f8f8f8] py-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#1c1a19] hover:bg-white transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Icon icon="lucide:upload-cloud" width="20" className="text-gray-400 group-hover:text-[#1c1a19]" />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#1c1a19]">Click to Upload Images</span>
                    <span className="text-[9px] font-mono text-gray-400 uppercase">(Multiple selection allowed)</span>
                  </div>
                  <input 
                    id="seller-product-image"
                    type="file" 
                    multiple 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="hidden" 
                    required={!editingProductId && imageFiles.length === 0} 
                  />
                </div>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {existingImages.map(url => (
                    <div key={url} className="relative w-20 h-20 border border-[#e5e5e5] bg-white group/img">
                      <Image src={url} alt="existing" fill className="object-cover" />
                      <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); setExistingImages(prev => prev.filter(i => i !== url)); }} 
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-md opacity-0 group-hover/img:opacity-100 transition-opacity"
                      >
                        <Icon icon="lucide:x" width="12" />
                      </button>
                    </div>
                  ))}
                  {imagePreviews.map((p, i) => (
                    <div key={i} className="relative w-20 h-20 border border-[#e5e5e5] bg-white group/img">
                      <Image src={p} alt="new preview" fill className="object-cover" />
                      <button 
                        type="button" 
                        onClick={(e) => { 
                          e.stopPropagation();
                          const newFiles = [...imageFiles];
                          const newPreviews = [...imagePreviews];
                          newFiles.splice(i, 1);
                          newPreviews.splice(i, 1);
                          setImageFiles(newFiles);
                          setImagePreviews(newPreviews);
                        }} 
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-md"
                      >
                        <Icon icon="lucide:x" width="12" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Name" className="h-12 border px-4 font-mono text-sm" required />
                <input type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="Price (KSh)" className="h-12 border px-4 font-mono text-sm" required />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <select name="category" value={formData.category} onChange={handleInputChange} className="h-12 border px-4 font-mono text-sm bg-white">
                  {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                </select>
                <div className="flex items-center gap-2">
                  <input type="checkbox" name="isNew" checked={formData.isNew} onChange={handleInputChange} className="w-4 h-4" />
                  <label className="text-xs font-bold uppercase tracking-widest">New Arrival</label>
                </div>
              </div>

              <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Description" className="min-h-[100px] border p-4 font-mono text-sm" />

              <div className="flex justify-end gap-4">
                <button type="button" onClick={resetForm} className="h-12 px-6 border text-xs uppercase font-bold tracking-widest">Cancel</button>
                <button type="submit" disabled={isSaving} className="h-12 px-8 bg-[#1c1a19] text-white font-bold uppercase tracking-widest text-xs disabled:opacity-50">
                  {isSaving ? "Saving..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20"><Icon icon="lucide:loader" className="animate-spin text-gray-300" width="40" /></div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 border bg-white flex flex-col items-center gap-4">
          <Icon icon="lucide:box" width="48" className="text-gray-200" />
          <p className="font-mono text-sm text-gray-400 uppercase tracking-widest">No products yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(p => (
            <div key={p.id} className="bg-white border p-4 group">
              <div className="relative aspect-square bg-[#f8f8f8] mb-4 overflow-hidden">
                <Image src={p.image} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-widest truncate">{p.name}</h3>
              <p className="text-sm font-mono text-[#a58c69] mt-1">KSh {p.price.toFixed(2)}</p>
              <div className="mt-4 flex gap-2">
                <button onClick={() => handleEditClick(p)} className="flex-1 h-9 border text-[10px] uppercase font-bold tracking-widest hover:bg-[#fafafa]">Edit</button>
                <button onClick={() => handleDelete(p.id)} className="w-9 h-9 border border-red-50 text-red-500 flex items-center justify-center hover:bg-red-50"><Icon icon="lucide:trash-2" width="16" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
