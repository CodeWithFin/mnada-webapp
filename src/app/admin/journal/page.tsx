"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import Image from "next/image";

interface JournalPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  tag: string;
  date: string;
  read_time: string;
  is_featured: boolean;
  content: string[];
}

export default function AdminJournalPage() {
  const [posts, setPosts] = useState<JournalPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    image: "",
    tag: "",
    date: "",
    read_time: "",
    is_featured: false,
    content: "", // Will be converted to array
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fetchPosts = async () => {
    setIsLoading(true);
    const authHeader = `Bearer ${localStorage.getItem('mnada_admin_token')}`;
    try {
      const res = await fetch("/api/admin/journal", {
        headers: { 'Authorization': authHeader }
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error("Failed to fetch journal posts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : value 
    }));
    
    // Auto-generate slug from title if slug is empty
    if (name === "title" && !formData.slug) {
        setFormData(prev => ({ ...prev, slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditClick = (post: JournalPost) => {
    setEditingPostId(post.id);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      image: post.image,
      tag: post.tag,
      date: post.date,
      read_time: post.read_time,
      is_featured: post.is_featured,
      content: post.content.join("\n\n"),
    });
    setImagePreview(post.image);
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingPostId(null);
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      image: "",
      tag: "",
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      read_time: "",
      is_featured: false,
      content: "",
    });
    setSelectedFile(null);
    setImagePreview(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const authHeader = `Bearer ${localStorage.getItem('mnada_admin_token')}`;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("slug", formData.slug);
      formDataToSend.append("excerpt", formData.excerpt);
      formDataToSend.append("tag", formData.tag);
      formDataToSend.append("date", formData.date);
      formDataToSend.append("read_time", formData.read_time);
      formDataToSend.append("is_featured", String(formData.is_featured));
      formDataToSend.append("content", JSON.stringify(formData.content.split("\n\n").filter(p => p.trim() !== "")));
      
      if (editingPostId) {
        formDataToSend.append("id", editingPostId);
      }
      
      if (selectedFile) {
        formDataToSend.append("image", selectedFile);
      } else if (editingPostId && formData.image) {
        formDataToSend.append("existingImage", formData.image);
      } else if (!editingPostId) {
        alert("Please upload an image");
        setIsSaving(false);
        return;
      }

      const method = editingPostId ? "PUT" : "POST";
      const res = await fetch("/api/admin/journal", {
        method,
        headers: {
          "Authorization": authHeader,
        },
        body: formDataToSend,
      });

      if (res.ok) {
        resetForm();
        fetchPosts();
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

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    
    const authHeader = `Bearer ${localStorage.getItem('mnada_admin_token')}`;
    try {
      const res = await fetch(`/api/admin/journal?id=${id}`, {
        method: "DELETE",
        headers: { 'Authorization': authHeader }
      });
      if (res.ok) {
        setPosts(posts.filter(p => p.id !== id));
      }
    } catch (err) {
      alert("Could not delete post");
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex justify-between items-end border-b border-[#e5e5e5] pb-4">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-tight text-[#1c1a19]">Journal</h1>
          <p className="text-sm font-mono text-gray-500 mt-2">Manage your blog posts and stories</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="h-10 px-6 bg-[#1c1a19] text-white font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-[#a58c69] transition-colors"
        >
          <Icon icon="lucide:plus" width="16" /> Add New Post
        </button>
      </header>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-5">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-[#e5e5e5] bg-[#f8f8f8] sticky top-0 z-10">
              <h2 className="text-xl font-bold uppercase tracking-widest text-[#1c1a19]">
                {editingPostId ? "Edit Journal Post" : "Create New Post"}
              </h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-[#1c1a19]">
                <Icon icon="lucide:x" width="24" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full h-12 border border-[#e5e5e5] px-4 font-mono text-sm focus:outline-none focus:border-[#1c1a19]"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Slug *</label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    className="w-full h-12 border border-[#e5e5e5] px-4 font-mono text-sm focus:outline-none focus:border-[#1c1a19]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Tag (e.g. Style Guide) *</label>
                  <input
                    type="text"
                    name="tag"
                    value={formData.tag}
                    onChange={handleInputChange}
                    className="w-full h-12 border border-[#e5e5e5] px-4 font-mono text-sm focus:outline-none focus:border-[#1c1a19]"
                    required
                  />
                </div>
                <div className="flex items-center gap-3 pt-8">
                  <input 
                    type="checkbox" 
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleInputChange}
                    className="w-5 h-5 accent-[#1c1a19]"
                  />
                  <label className="text-xs font-bold uppercase tracking-widest text-[#1c1a19]">Featured Story on Home</label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Read Time *</label>
                  <input
                    type="text"
                    name="read_time"
                    value={formData.read_time}
                    onChange={handleInputChange}
                    placeholder="e.g. 5 min read"
                    className="w-full h-12 border border-[#e5e5e5] px-4 font-mono text-sm focus:outline-none focus:border-[#1c1a19]"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Date *</label>
                  <input
                    type="text"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full h-12 border border-[#e5e5e5] px-4 font-mono text-sm focus:outline-none focus:border-[#1c1a19]"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Image *</label>
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="relative w-full md:w-48 aspect-[1.5] bg-[#f8f8f8] border border-dashed border-[#e5e5e5] h-32 flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                      <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <Icon icon="lucide:image" width="24" />
                        <span className="text-[10px] uppercase font-mono">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 w-full">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="blog-image-upload"
                    />
                    <label
                      htmlFor="blog-image-upload"
                      className="h-12 border border-[#1c1a19] px-6 font-bold uppercase tracking-widest text-[10px] flex items-center justify-center cursor-pointer hover:bg-[#1c1a19] hover:text-white transition-colors gap-2"
                    >
                      <Icon icon="lucide:upload" width="14" />
                      {imagePreview ? "Change Image" : "Upload Image"}
                    </label>
                    <p className="text-[10px] text-gray-400 mt-2 font-mono uppercase tracking-widest">
                      Recommended size: 1200x800px. JPG, PNG or WebP.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Excerpt *</label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  className="w-full min-h-[80px] border border-[#e5e5e5] p-4 font-mono text-sm focus:outline-none focus:border-[#1c1a19]"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Content (Separate paragraphs with double Enter) *</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  className="w-full min-h-[300px] border border-[#e5e5e5] p-4 font-mono text-sm focus:outline-none focus:border-[#1c1a19]"
                  required
                />
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
                  {isSaving ? "Saving..." : "Save Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="w-full h-64 flex items-center justify-center">
          <Icon icon="lucide:loader" className="animate-spin text-gray-300" width="32" />
        </div>
      ) : posts.length === 0 ? (
        <div className="w-full text-center py-20 bg-white border border-[#e5e5e5] flex flex-col items-center gap-4">
          <Icon icon="lucide:book" width="48" className="text-gray-200" />
          <p className="font-mono text-sm text-gray-400 uppercase tracking-widest">No journal posts found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white border border-[#e5e5e5] group relative flex flex-col">
              <div className="relative w-full aspect-[1.5] bg-[#f8f8f8] overflow-hidden">
                <Image src={post.image} alt={post.title} fill className="object-cover" />
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditClick(post)}
                    className="w-8 h-8 bg-white text-[#1c1a19] shadow-sm flex items-center justify-center hover:bg-[#f8f8f8]"
                  >
                    <Icon icon="lucide:edit-2" width="16" />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="w-8 h-8 bg-white text-red-500 shadow-sm flex items-center justify-center hover:bg-red-50"
                  >
                    <Icon icon="lucide:trash-2" width="16" />
                  </button>
                </div>
              </div>
              <div className="p-5 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#a58c69]">{post.tag}</span>
                    {post.is_featured && <span className="bg-[#1c1a19] text-white text-[9px] uppercase tracking-widest px-2 py-0.5">Featured</span>}
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#1c1a19] line-clamp-2 leading-relaxed">
                  {post.title}
                </h3>
                <div className="mt-4 flex justify-between items-center border-t border-[#e5e5e5] pt-4 text-[10px] font-mono text-gray-400">
                  <span>{post.date}</span>
                  <span>{post.read_time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
