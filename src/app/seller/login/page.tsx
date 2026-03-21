"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

export default function SellerLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if already logged in as seller
    const storedRole = localStorage.getItem("mnada_seller_role");
    const storedToken = localStorage.getItem("mnada_seller_token");
    if (storedRole === "seller" && storedToken) {
      router.push("/seller/dashboard");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/seller/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem("mnada_seller_auth", "true");
        localStorage.setItem("mnada_seller_username", data.username);
        localStorage.setItem("mnada_seller_email", data.email);
        localStorage.setItem("mnada_seller_token", data.token);
        localStorage.setItem("mnada_seller_role", data.role);
        localStorage.setItem("mnada_seller_id", data.id || ""); // If returned
        
        router.push("/seller/dashboard");
      } else {
        setError(data.error || "Authentication failed");
      }
    } catch {
      setError("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-md border border-[#e5e5e5] bg-white p-8 flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#a58c69]">Seller Portal</span>
          <h1 className="text-3xl font-bold uppercase tracking-tight text-[#1c1a19]">Seller Login</h1>
          <p className="text-sm font-mono text-gray-500">Manage your products and track your earnings.</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          {error ? (
            <div className="border border-red-200 bg-red-50 px-4 py-3 font-mono text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 border border-[#e5e5e5] px-4 font-mono text-sm focus:outline-none focus:border-[#1c1a19]"
              autoComplete="email"
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
            disabled={isLoading}
            className="h-12 bg-[#1c1a19] text-white font-bold uppercase tracking-widest text-xs hover:bg-[#a58c69] transition-colors disabled:opacity-50"
          >
            {isLoading ? "Signing In..." : "Sign In as Seller"}
          </button>
        </form>
      </div>
    </div>
  );
}
