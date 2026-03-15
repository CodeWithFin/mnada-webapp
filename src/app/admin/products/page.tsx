"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

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

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get('category');
  
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
  const [categories, setCategories] = useState<any[]>([]);

  const fetchProducts = async () => {
    setIsLoading(true);
    // We can use the public client because products are readable by everyone
    let query = supabase
      .from('products')
      .select('*')
      .neq('category', 'SYSTEM_AUTH');
    
    if (categoryFilter) {
      query = query.eq('category', categoryFilter);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
      
    if (data && !error) {
      const formattedProducts = data.map((p: any) => {
        let galleryImages = [p.image];
        let cleanDescription = p.description || "";

        if (p.description && p.description.includes("---GALLERY_DATA---")) {
          const parts = p.description.split("---GALLERY_DATA---");
          cleanDescription = parts[0].trim();
          try {
            galleryImages = JSON.parse(parts[1]);
          } catch (e) {
            console.error("Error parsing gallery data:", e);
          }
        }
        return {
          ...p,
          description: cleanDescription,
          images: galleryImages
        };
      });
      setProducts(formattedProducts);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [categoryFilter]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.filter((c: any) => c.name !== 'SYSTEM_AUTH'));
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setImageFiles(selectedFiles);
      
      // Create previews
      const previews = selectedFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProductId(product.id);
    let cleanDescription = product.description || "";
    if (cleanDescription.includes("---GALLERY_DATA---")) {
      cleanDescription = cleanDescription.split("---GALLERY_DATA---")[0].trim();
    }

    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      description: cleanDescription,
      isNew: product.is_new
    });
    setImageFiles([]); // Clear any previously selected files
    setImagePreviews([]); // Clear any previously selected previews
    setExistingImages(product.images || [product.image]); // Load existing images
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingProductId(null);
    setFormData({ name: "", price: "", category: categories[0]?.name || "Men's", description: "", isNew: false });
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setIsModalOpen(false);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProductId && imageFiles.length === 0) {
      alert("Please select at least one image");
      return;
    }

    setIsAdding(true);
    const authHeader = `Bearer ${localStorage.getItem('mnada_admin_token')}`;

    try {
      const form = new FormData();
      if (editingProductId) {
        form.append('id', editingProductId);
      }
      imageFiles.forEach(file => {
        form.append('images', file);
      });
      
      if (editingProductId) {
          form.append('existingImages', JSON.stringify(existingImages));
      }
      form.append('name', formData.name);
      form.append('price', formData.price);
      form.append('category', formData.category);
      form.append('description', formData.description);
      form.append('isNew', String(formData.isNew));

      const method = editingProductId ? 'PUT' : 'POST';

      const response = await fetch('/api/admin/products', {
        method: method,
        headers: {
          'Authorization': authHeader
        },
        body: form
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || `Failed to ${editingProductId ? 'update' : 'add'} product`);
      }

      // Success
      resetForm();
      fetchProducts(); // Refresh list

    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    
    const authHeader = `Bearer ${localStorage.getItem('mnada_admin_token')}`;
    
    try {
      const response = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': authHeader
        }
      });

      if (response.ok) {
        setProducts(products.filter(p => p.id !== id));
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      console.error(error);
      alert("Could not delete product.");
    }
  };

  const handleDeleteAllProducts = async () => {
    if (products.length === 0) {
      return;
    }

    const firstConfirm = window.confirm(`Delete all ${products.length} products? This cannot be undone.`);
    if (!firstConfirm) {
      return;
    }

    const secondConfirm = window.confirm('Please confirm again: delete ALL products now?');
    if (!secondConfirm) {
      return;
    }

    const authHeader = `Bearer ${localStorage.getItem('mnada_admin_token')}`;
    setIsDeletingAll(true);

    try {
      const response = await fetch('/api/admin/products?all=true', {
        method: 'DELETE',
        headers: {
          'Authorization': authHeader
        }
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to delete all products');
      }

      setProducts([]);
      alert('All products deleted successfully.');
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Could not delete all products.');
    } finally {
      setIsDeletingAll(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex justify-between items-end border-b border-[#e5e5e5] pb-4">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-tight text-[#1c1a19]">
            Products {categoryFilter ? `- ${categoryFilter}` : ""}
          </h1>
          <p className="text-sm font-mono text-gray-500 mt-2">Manage your inventory</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDeleteAllProducts}
            disabled={isLoading || products.length === 0 || isDeletingAll}
            className="h-10 px-4 bg-red-600 text-white font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeletingAll ? <Icon icon="lucide:loader" width="16" className="animate-spin" /> : <Icon icon="lucide:trash-2" width="16" />}
            Delete All
          </button>

          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="h-10 px-6 bg-[#1c1a19] text-white font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-[#a58c69] transition-colors"
          >
            <Icon icon="lucide:plus" width="16" /> Add Product
          </button>
        </div>
      </header>

      {/* Add Product Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-5">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-[#e5e5e5] bg-[#f8f8f8] sticky top-0 z-10">
              <h2 className="text-xl font-bold uppercase tracking-widest text-[#1c1a19]">
                  {editingProductId ? "Edit Product" : "Add New Product"}
              </h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-[#1c1a19]">
                <Icon icon="lucide:x" width="24" />
              </button>
            </div>
            
            <form onSubmit={handleAddProduct} className="p-6 flex flex-col gap-6">
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Product Images {editingProductId ? "(Optional)" : "*"}</label>
                <div className="flex flex-col gap-4">
                  <input 
                    type="file" 
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="w-full text-sm font-mono file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-widest file:bg-[#f0f0f0] file:text-[#1c1a19] hover:file:bg-[#e5e5e5] cursor-pointer"
                    required={!editingProductId}
                  />
                  
                  <div className="flex flex-col gap-4">
                    {/* Existing Images (Gallery) */}
                    {existingImages.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Current Gallery:</span>
                        <div className="flex flex-wrap gap-2">
                          {existingImages.map((url, index) => (
                            <div key={url} className="relative w-24 h-24 border border-[#e5e5e5] bg-[#f8f8f8]">
                              <Image 
                                src={url} 
                                alt={`Existing ${index}`} 
                                fill 
                                className="object-cover" 
                                sizes="96px"
                              />
                              <button 
                                type="button"
                                onClick={() => setExistingImages(prev => prev.filter(img => img !== url))}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors z-10"
                                title="Remove existing image"
                              >
                                <Icon icon="lucide:x" width="14" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* New Previews */}
                    {imagePreviews.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">New Additions:</span>
                        <div className="flex flex-wrap gap-2">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative w-24 h-24 border border-[#e5e5e5] bg-[#f8f8f8]">
                              <Image 
                                src={preview} 
                                alt={`New Preview ${index}`} 
                                fill 
                                className="object-cover" 
                                sizes="96px"
                              />
                              <button 
                                type="button"
                                onClick={() => {
                                  const newFiles = [...imageFiles];
                                  const newPreviews = [...imagePreviews];
                                  newFiles.splice(index, 1);
                                  newPreviews.splice(index, 1);
                                  setImageFiles(newFiles);
                                  setImagePreviews(newPreviews);
                                }}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors z-10"
                                title="Remove new file"
                              >
                                <Icon icon="lucide:x" width="14" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    

                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Name *</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full h-12 border border-[#e5e5e5] px-4 font-mono text-sm focus:outline-none focus:border-[#1c1a19]"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Price (KSh) *</label>
                  <input 
                    type="number" 
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full h-12 border border-[#e5e5e5] px-4 font-mono text-sm focus:outline-none focus:border-[#1c1a19]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Category *</label>
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full h-12 border border-[#e5e5e5] px-4 font-mono text-sm focus:outline-none focus:border-[#1c1a19] bg-white capitalize"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-3 pt-8">
                  <input 
                    type="checkbox" 
                    name="isNew"
                    checked={formData.isNew}
                    onChange={handleInputChange}
                    className="w-5 h-5 accent-[#1c1a19]"
                  />
                  <label className="text-xs font-bold uppercase tracking-widest text-[#1c1a19]">Mark as 'New Arrival'</label>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Description</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full min-h-[100px] border border-[#e5e5e5] p-4 font-mono text-sm focus:outline-none focus:border-[#1c1a19]"
                  placeholder="Enter product description..."
                />
              </div>

              <div className="border-t border-[#e5e5e5] pt-6 flex justify-end gap-4 mt-4">
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="h-12 px-6 border border-[#e5e5e5] text-gray-500 font-bold uppercase tracking-widest text-xs hover:bg-[#f8f8f8] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isAdding}
                  className="h-12 px-8 bg-[#1c1a19] text-white font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-[#a58c69] transition-colors disabled:opacity-50"
                >
                  {isAdding ? <><Icon icon="lucide:loader" className="animate-spin" /> Saving...</> : "Save Product"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="w-full h-64 flex items-center justify-center">
          <div className="animate-pulse flex items-center gap-2 font-mono text-sm uppercase tracking-widest text-gray-400">
            <Icon icon="lucide:loader" className="animate-spin" /> Loading Library...
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="w-full text-center py-20 bg-white border border-[#e5e5e5] flex flex-col items-center gap-4">
          <Icon icon="lucide:box" width="48" className="text-gray-300" />
          <p className="font-mono text-sm text-gray-500 uppercase tracking-widest">No products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white border border-[#e5e5e5] group relative flex flex-col">
              <div className="relative w-full aspect-[0.8] bg-[#f8f8f8] overflow-hidden">
                <Image 
                  src={product.image} 
                  alt={product.name} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleEditClick(product)}
                    className="w-8 h-8 bg-white text-[#1c1a19] border border-[#e5e5e5] flex items-center justify-center hover:bg-[#f8f8f8]"
                    title="Edit Product"
                  >
                    <Icon icon="lucide:edit-2" width="16" />
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="w-8 h-8 bg-white text-red-500 border border-red-100 flex items-center justify-center hover:bg-red-50"
                    title="Delete Product"
                  >
                    <Icon icon="lucide:trash-2" width="16" />
                  </button>
                </div>
              </div>
              
              <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#a58c69]">{product.category}</span>
                  {product.is_new && <span className="bg-[#1c1a19] text-white text-[9px] uppercase tracking-widest px-2 py-0.5">New</span>}
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#1c1a19] line-clamp-2 mb-4 leading-relaxed">
                  {product.name}
                </h3>
                <div className="mt-auto flex justify-between items-center border-t border-[#e5e5e5] pt-4">
                  <span className="text-sm font-mono text-[#1c1a19]">KSh {product.price.toFixed(2)}</span>
                  <span className="text-[10px] font-mono text-gray-400">ID: {product.mock_id.substring(0,6)}...</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
