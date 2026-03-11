"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const auth = localStorage.getItem("mnada_admin_auth");
    const storedUsername = localStorage.getItem("mnada_admin_username");
    if (auth === "true" && storedUsername) {
      setIsAuthenticated(true);
      setUsername(storedUsername);
    }
  }, []);

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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center p-5">
        <form onSubmit={handleLogin} className="bg-white p-10 max-w-sm w-full border border-[#e5e5e5] flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold uppercase tracking-widest text-[#1c1a19] mb-2">Mnada Admin</h1>
            <p className="text-xs font-mono text-gray-500">Sign in to access dashboard</p>
          </div>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full h-12 border border-[#e5e5e5] px-4 font-mono text-sm focus:outline-none focus:border-[#1c1a19]"
              autoFocus
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full h-12 border border-[#e5e5e5] px-4 font-mono text-sm focus:outline-none focus:border-[#1c1a19]"
              required
            />
          </div>
          {error && <p className="text-red-500 text-xs font-mono text-center">{error}</p>}
          <button type="submit" className="h-12 bg-[#1c1a19] text-white font-bold uppercase tracking-widest text-xs hover:bg-[#a58c69] transition-colors">
            Login
          </button>
          <Link href="/" className="text-center text-xs font-mono text-gray-400 hover:text-[#1c1a19] underline underline-offset-4 mt-4">
            Return to Store
          </Link>
        </form>
      </div>
    );
  }

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
            <div className={`flex items-center justify-between transition-colors ${(pathname === '/admin/products' || pathname.startsWith('/admin/products/'))  ? 'bg-[#f8f8f8]' : 'hover:bg-[#fafafa]'}`}>
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
            
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isCategoryOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="flex flex-col py-2 bg-[#fafafa]">
                <Link href="/admin/products?category=mens" className="pl-14 pr-8 py-2 text-xs font-mono text-gray-500 hover:text-[#1c1a19] transition-colors">
                  Men's
                </Link>
                <Link href="/admin/products?category=womens" className="pl-14 pr-8 py-2 text-xs font-mono text-gray-500 hover:text-[#1c1a19] transition-colors">
                  Women's
                </Link>
                <Link href="/admin/products?category=accessories" className="pl-14 pr-8 py-2 text-xs font-mono text-gray-500 hover:text-[#1c1a19] transition-colors">
                  Accessories
                </Link>
              </div>
            </div>
          </div>
          
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
