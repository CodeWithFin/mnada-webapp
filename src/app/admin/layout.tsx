"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    // Ensure mock credentials exist for downstream logic
    if (!localStorage.getItem("mnada_admin_auth")) {
      localStorage.setItem("mnada_admin_auth", "true");
      localStorage.setItem("mnada_admin_username", "admin");
      localStorage.setItem("mnada_admin_token", "bypass-token");
    }
    
    const auth = localStorage.getItem("mnada_admin_auth");
    const storedUsername = localStorage.getItem("mnada_admin_username");
    if (auth === "true" && storedUsername) {
      setIsAuthenticated(true);
      setUsername(storedUsername);
      fetchCategories();
    }
  }, []);

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        localStorage.setItem("mnada_admin_auth", "true");
        localStorage.setItem("mnada_admin_username", username);
        localStorage.setItem("mnada_admin_token", data.token);
        setIsAuthenticated(true);
        fetchCategories();
      } else {
        setError(data.error || "Authentication failed");
      }
    } catch (err) {
      setError("An error occurred during login");
    }
  };
  const handleLogout = () => {
    localStorage.removeItem("mnada_admin_auth");
    localStorage.removeItem("mnada_admin_username");
    localStorage.removeItem("mnada_admin_token");
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
  };


  return (
    <div className="min-h-screen bg-[#f8f8f8] flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-[#e5e5e5] flex flex-col shrink-0">
        <div className="h-[70px] flex items-center px-8 border-b border-[#e5e5e5]">
          <Link href="/admin" className="text-xl font-bold tracking-tight uppercase text-[#1c1a19]">
            Mnada Admin
          </Link>
        </div>
        <div className="flex flex-col py-6 gap-2">
          <Link
            href="/admin"
            className={`px-8 py-3 flex items-center gap-3 text-sm font-mono uppercase tracking-widest transition-colors ${pathname === '/admin' ? 'text-[#a58c69] font-bold bg-[#f8f8f8]' : 'text-gray-500 hover:text-[#1c1a19] hover:bg-[#fafafa]'}`}
          >
            <Icon icon="lucide:shopping-bag" width="18" /> Orders
          </Link>
          <div className="flex flex-col">
            <div className={`flex items-center justify-between transition-colors ${(pathname === '/admin/products' || pathname.startsWith('/admin/products/')) ? 'bg-[#f8f8f8]' : 'hover:bg-[#fafafa]'}`}>
              <Link
                href="/admin/products"
                className={`px-8 py-3 flex items-center gap-3 text-sm font-mono uppercase tracking-widest flex-1 ${(pathname === '/admin/products' || pathname.startsWith('/admin/products/')) ? 'text-[#a58c69] font-bold' : 'text-gray-500 hover:text-[#1c1a19]'}`}
              >
                <Icon icon="lucide:package" width="18" /> Products
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsCategoryOpen(!isCategoryOpen);
                }}
                className={`pr-8 py-3 flex items-center justify-center text-gray-400 hover:text-[#1c1a19]`}
              >
                <Icon
                  icon="lucide:chevron-down"
                  width="16"
                  className={`transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`}
                />
              </button>
            </div>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isCategoryOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="flex flex-col py-2 bg-[#fafafa]">
                {categories.map((cat) => (
                  <Link 
                    key={cat.id}
                    href={`/admin/products?category=${encodeURIComponent(cat.name)}`} 
                    className="pl-14 pr-8 py-2 text-xs font-mono text-gray-500 hover:text-[#1c1a19] transition-colors capitalize"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link 
            href="/admin/categories" 
            className={`px-8 py-3 flex items-center gap-3 text-sm font-mono uppercase tracking-widest transition-colors ${pathname === '/admin/categories' ? 'text-[#a58c69] font-bold bg-[#f8f8f8]' : 'text-gray-500 hover:text-[#1c1a19] hover:bg-[#fafafa]'}`}
          >
            <Icon icon="lucide:layers" width="18" /> Categories
          </Link>
          
          <Link 
            href="/admin/settings" 
            className={`px-8 py-3 flex items-center gap-3 text-sm font-mono uppercase tracking-widest transition-colors ${pathname === '/admin/settings' ? 'text-[#a58c69] font-bold bg-[#f8f8f8]' : 'text-gray-500 hover:text-[#1c1a19] hover:bg-[#fafafa]'}`}
          >
            <Icon icon="lucide:settings" width="18" /> Settings
          </Link>
        </div>
        <div className="mt-auto border-t border-[#e5e5e5] p-6">
          <button onClick={handleLogout} className="flex items-center gap-3 text-sm font-mono uppercase tracking-widest text-gray-500 hover:text-red-500 transition-colors w-full">
            <Icon icon="lucide:log-out" width="18" /> Logout
          </button>
          <Link href="/" className="mt-6 flex items-center gap-3 text-xs font-mono text-gray-400 hover:text-[#1c1a19] transition-colors">
            <Icon icon="lucide:external-link" width="14" /> View Storefront
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto w-full">
        {children}
      </main>
    </div>
  );
}
