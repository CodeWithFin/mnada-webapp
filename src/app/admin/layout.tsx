"use client";

import { startTransition, useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { usePathname } from "next/navigation";

type Category = {
  id: string;
  name: string;
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const pathname = usePathname();


  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data: Category[] = await res.json();
        setCategories(data.filter((category) => category.name !== "SYSTEM_AUTH"));
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  useEffect(() => {
    const auth = localStorage.getItem("mnada_admin_auth");
    const storedUsername = localStorage.getItem("mnada_admin_username");
    const storedToken = localStorage.getItem("mnada_admin_token");
    const storedRole = localStorage.getItem("mnada_admin_role");

    startTransition(() => {
      if (auth === "true" && storedUsername && storedToken && storedRole === "admin") {
        setIsAuthenticated(true);
        setUsername(storedUsername);
        fetchCategories();
      }

      setIsCheckingAuth(false);
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem("mnada_admin_auth", "true");
        localStorage.setItem("mnada_admin_username", data.username || username);
        localStorage.setItem("mnada_admin_token", data.token);
        localStorage.setItem("mnada_admin_role", data.role);
        setIsAuthenticated(true);
        setUsername(data.username || username);
        setPassword("");
        fetchCategories();
      } else {
        setError(data.error || "Authentication failed");
      }
    } catch {
      setError("An error occurred during login");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("mnada_admin_auth");
    localStorage.removeItem("mnada_admin_username");
    localStorage.removeItem("mnada_admin_token");
    localStorage.removeItem("mnada_admin_role");
    setIsAuthenticated(false);
    setUsername("admin");
    setPassword("");
    setCategories([]);
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center px-5">
        <div className="flex items-center gap-2 font-mono text-sm uppercase tracking-widest text-gray-500">
          <Icon icon="lucide:loader" className="animate-spin" /> Checking admin session...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md border border-[#e5e5e5] bg-white p-8 flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#a58c69]">Restricted Access</span>
            <h1 className="text-3xl font-bold uppercase tracking-tight text-[#1c1a19]">Admin Login</h1>
            <p className="text-sm font-mono text-gray-500">Only admin accounts can access orders, products, categories, and settings.</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            {error ? (
              <div className="border border-red-200 bg-red-50 px-4 py-3 font-mono text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 border border-[#e5e5e5] px-4 font-mono text-sm focus:outline-none focus:border-[#1c1a19]"
                autoComplete="username"
                required
              />
            </div>

            <div className="flex flex-col gap-2 relative">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 border border-[#e5e5e5] px-4 font-mono text-sm focus:outline-none focus:border-[#1c1a19]"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1c1a19]"
                >
                  <Icon icon={showPassword ? "lucide:eye-off" : "lucide:eye"} width="20" />
                </button>
              </div>
            </div>


            <button
              type="submit"
              className="h-12 bg-[#1c1a19] text-white font-bold uppercase tracking-widest text-xs hover:bg-[#a58c69] transition-colors"
            >
              Sign In as Admin
            </button>
          </form>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-white border-r border-[#e5e5e5] flex flex-col shrink-0">
        <div className="h-[70px] flex items-center px-8 border-b border-[#e5e5e5]">
          <Link href="/admin" className="text-xl font-bold tracking-tight uppercase text-[#1c1a19]">
            Mnada Admin
          </Link>
        </div>
        <div className="flex flex-col py-6 gap-2">
          <Link
            href="/admin"
            className={`px-8 py-3 flex items-center gap-3 text-sm font-mono uppercase tracking-widest transition-colors ${pathname === "/admin" ? "text-[#a58c69] font-bold bg-[#f8f8f8]" : "text-gray-500 hover:text-[#1c1a19] hover:bg-[#fafafa]"}`}
          >
            <Icon icon="lucide:shopping-bag" width="18" /> Orders
          </Link>
          <div className="flex flex-col">
            <div className={`flex items-center justify-between transition-colors ${(pathname === "/admin/products" || pathname.startsWith("/admin/products/")) ? "bg-[#f8f8f8]" : "hover:bg-[#fafafa]"}`}>
              <Link
                href="/admin/products"
                className={`px-8 py-3 flex items-center gap-3 text-sm font-mono uppercase tracking-widest flex-1 ${(pathname === "/admin/products" || pathname.startsWith("/admin/products/")) ? "text-[#a58c69] font-bold" : "text-gray-500 hover:text-[#1c1a19]"}`}
              >
                <Icon icon="lucide:package" width="18" /> Products
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsCategoryOpen(!isCategoryOpen);
                }}
                className="pr-8 py-3 flex items-center justify-center text-gray-400 hover:text-[#1c1a19]"
              >
                <Icon
                  icon="lucide:chevron-down"
                  width="16"
                  className={`transition-transform duration-200 ${isCategoryOpen ? "rotate-180" : ""}`}
                />
              </button>
            </div>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isCategoryOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"}`}>
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
            className={`px-8 py-3 flex items-center gap-3 text-sm font-mono uppercase tracking-widest transition-colors ${pathname === "/admin/categories" ? "text-[#a58c69] font-bold bg-[#f8f8f8]" : "text-gray-500 hover:text-[#1c1a19] hover:bg-[#fafafa]"}`}
          >
            <Icon icon="lucide:layers" width="18" /> Categories
          </Link>

          <Link
            href="/admin/journal"
            className={`px-8 py-3 flex items-center gap-3 text-sm font-mono uppercase tracking-widest transition-colors ${pathname.startsWith("/admin/journal") ? "text-[#a58c69] font-bold bg-[#f8f8f8]" : "text-gray-500 hover:text-[#1c1a19] hover:bg-[#fafafa]"}`}
          >
            <Icon icon="lucide:book-open" width="18" /> Journal
          </Link>

          <Link
            href="/admin/feedback"
            className={`px-8 py-3 flex items-center gap-3 text-sm font-mono uppercase tracking-widest transition-colors ${pathname.startsWith("/admin/feedback") ? "text-[#a58c69] font-bold bg-[#f8f8f8]" : "text-gray-500 hover:text-[#1c1a19] hover:bg-[#fafafa]"}`}
          >
            <Icon icon="lucide:message-square" width="18" /> Feedback
          </Link>

          <Link
            href="/admin/subscribers"
            className={`px-8 py-3 flex items-center gap-3 text-sm font-mono uppercase tracking-widest transition-colors ${pathname.startsWith("/admin/subscribers") ? "text-[#a58c69] font-bold bg-[#f8f8f8]" : "text-gray-500 hover:text-[#1c1a19] hover:bg-[#fafafa]"}`}
          >
            <Icon icon="lucide:users" width="18" /> Subscribers
          </Link>

          <Link
            href="/admin/discounts"
            className={`px-8 py-3 flex items-center gap-3 text-sm font-mono uppercase tracking-widest transition-colors ${pathname.startsWith("/admin/discounts") ? "text-[#a58c69] font-bold bg-[#f8f8f8]" : "text-gray-500 hover:text-[#1c1a19] hover:bg-[#fafafa]"}`}
          >
            <Icon icon="lucide:tag" width="18" /> Discounts
          </Link>

          <Link
            href="/admin/sellers"
            className={`px-8 py-3 flex items-center gap-3 text-sm font-mono uppercase tracking-widest transition-colors ${pathname === "/admin/sellers" ? "text-[#a58c69] font-bold bg-[#f8f8f8]" : "text-gray-500 hover:text-[#1c1a19] hover:bg-[#fafafa]"}`}
          >
            <Icon icon="lucide:users" width="18" /> Sellers
          </Link>

          <Link
            href="/admin/categories"
            className={`px-8 py-3 flex items-center gap-3 text-sm font-mono uppercase tracking-widest transition-colors ${pathname.startsWith("/admin/categories") ? "text-[#a58c69] font-bold bg-[#f8f8f8]" : "text-gray-500 hover:text-[#1c1a19] hover:bg-[#fafafa]"}`}
          >
            <Icon icon="lucide:layout-grid" width="18" /> Categories
          </Link>

          <Link
            href="/admin/settings"
            className={`px-8 py-3 flex items-center gap-3 text-sm font-mono uppercase tracking-widest transition-colors ${pathname === "/admin/settings" ? "text-[#a58c69] font-bold bg-[#f8f8f8]" : "text-gray-500 hover:text-[#1c1a19] hover:bg-[#fafafa]"}`}
          >
            <Icon icon="lucide:settings" width="18" /> Settings
          </Link>

        </div>
        <div className="mt-auto border-t border-[#e5e5e5] p-6">
          <div className="mb-6 text-[11px] font-mono uppercase tracking-widest text-gray-400">
            Signed in as {username}
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 text-sm font-mono uppercase tracking-widest text-gray-500 hover:text-red-500 transition-colors w-full">
            <Icon icon="lucide:log-out" width="18" /> Logout
          </button>
          <Link href="/" className="mt-6 flex items-center gap-3 text-xs font-mono text-gray-400 hover:text-[#1c1a19] transition-colors">
            <Icon icon="lucide:external-link" width="14" /> View Storefront
          </Link>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-12 overflow-y-auto w-full">
        {children}
      </main>
    </div>
  );
}
