"use client";

import { startTransition, useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { usePathname, useRouter } from "next/navigation";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [username, setUsername] = useState("Seller");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const auth = localStorage.getItem("mnada_seller_auth");
    const storedUsername = localStorage.getItem("mnada_seller_username");
    const storedToken = localStorage.getItem("mnada_seller_token");
    const storedRole = localStorage.getItem("mnada_seller_role");

    startTransition(() => {
      if (auth === "true" && storedUsername && storedToken && storedRole === "seller") {
        setIsAuthenticated(true);
        setUsername(storedUsername);
      } else if (pathname !== "/seller/login" && pathname !== "/seller/signup") {
        router.push("/seller/login");
      }
      setIsCheckingAuth(false);
    });
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem("mnada_seller_auth");
    localStorage.removeItem("mnada_seller_username");
    localStorage.removeItem("mnada_seller_email");
    localStorage.removeItem("mnada_seller_token");
    localStorage.removeItem("mnada_seller_role");
    localStorage.removeItem("mnada_seller_id");
    setIsAuthenticated(false);
    router.push("/seller/login");
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center px-5">
        <div className="flex items-center gap-2 font-mono text-sm uppercase tracking-widest text-gray-500">
          <Icon icon="lucide:loader" className="animate-spin" /> Checking seller session...
        </div>
      </div>
    );
  }

  // If on login page, don't show the layout
  if (pathname === "/seller/login") {
    return <>{children}</>;
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-white border-r border-[#e5e5e5] flex flex-col shrink-0">
        <div className="h-[70px] flex items-center px-8 border-b border-[#e5e5e5]">
          <Link href="/seller/dashboard" className="text-xl font-bold tracking-tight uppercase text-[#1c1a19]">
            Seller Portal
          </Link>
        </div>
        <div className="flex flex-col py-6 gap-2">
          <Link
            href="/seller/dashboard"
            className={`px-8 py-3 flex items-center gap-3 text-sm font-mono uppercase tracking-widest transition-colors ${pathname === "/seller/dashboard" ? "text-[#a58c69] font-bold bg-[#f8f8f8]" : "text-gray-500 hover:text-[#1c1a19] hover:bg-[#fafafa]"}`}
          >
            <Icon icon="lucide:layout-dashboard" width="18" /> Dashboard
          </Link>
          
          <Link
            href="/seller/products"
            className={`px-8 py-3 flex items-center gap-3 text-sm font-mono uppercase tracking-widest transition-colors ${pathname.startsWith("/seller/products") ? "text-[#a58c69] font-bold bg-[#f8f8f8]" : "text-gray-500 hover:text-[#1c1a19] hover:bg-[#fafafa]"}`}
          >
            <Icon icon="lucide:package" width="18" /> My Products
          </Link>

          <Link
            href="/seller/orders"
            className={`px-8 py-3 flex items-center gap-3 text-sm font-mono uppercase tracking-widest transition-colors ${pathname === "/seller/orders" ? "text-[#a58c69] font-bold bg-[#f8f8f8]" : "text-gray-500 hover:text-[#1c1a19] hover:bg-[#fafafa]"}`}
          >
            <Icon icon="lucide:shopping-bag" width="18" /> Orders
          </Link>
        </div>

        <div className="mt-auto border-t border-[#e5e5e5] p-6 text-center">
          <div className="mb-4 text-[10px] font-mono uppercase tracking-widest text-gray-400">
            {username}
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 text-sm font-mono uppercase tracking-widest text-gray-500 hover:text-red-500 transition-colors w-full px-2">
            <Icon icon="lucide:log-out" width="18" /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-12 overflow-y-auto w-full">
        {children}
      </main>
    </div>
  );
}
