"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SellerSignupPage() {
  const [step, setStep] = useState(1); // 1: Account, 2: Brand, 3: Success
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Form State
  const [accountData, setAccountData] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [brandData, setBrandData] = useState({
    name: "",
    category: "Clothing",
    range: "0 - 100,000 KSh"
  });

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (accountData.password !== accountData.confirmPassword) {
      return setError("Passwords do not match");
    }
    setError("");
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch('/api/seller/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: accountData.email,
          password: accountData.password,
          name: brandData.name,
          business_category: brandData.category,
          estimated_sales: brandData.range,
          status: 'pending' // Enforce pending status
        })
      });

      if (res.ok) {
        setStep(3);
      } else {
        const err = await res.json();
        setError(err.error || "Failed to submit request");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center p-5 py-20 font-mono">
      <div className="w-full max-w-lg bg-white border border-[#e5e5e5] p-8 md:p-12 shadow-sm">
        
        {step === 1 && (
          <div className="flex flex-col gap-8">
            <header className="flex flex-col gap-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#a58c69]">Step 1 of 2</span>
              <h1 className="text-3xl font-bold uppercase tracking-tight text-[#1c1a19]">Seller Registration</h1>
              <p className="text-xs text-gray-400 uppercase tracking-widest leading-relaxed">
                Create an account to start your journey with Mnada.
              </p>
            </header>

            <form onSubmit={handleNext} className="flex flex-col gap-6">
              {error && <div className="p-3 bg-red-50 border border-red-100 text-red-500 text-xs">{error}</div>}
              
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Email Address</label>
                <input 
                  type="email" 
                  value={accountData.email}
                  onChange={(e) => setAccountData({...accountData, email: e.target.value})}
                  className="w-full h-12 border border-[#e5e5e5] px-4 text-sm focus:outline-none focus:border-[#1c1a19]"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Create Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={accountData.password}
                    onChange={(e) => setAccountData({...accountData, password: e.target.value})}
                    className="w-full h-12 border border-[#e5e5e5] px-4 text-sm focus:outline-none focus:border-[#1c1a19]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1c1a19]"
                  >
                    <Icon icon={showPassword ? "lucide:eye-off" : "lucide:eye"} width="18" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Confirm Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={accountData.confirmPassword}
                    onChange={(e) => setAccountData({...accountData, confirmPassword: e.target.value})}
                    className="w-full h-12 border border-[#e5e5e5] px-4 text-sm focus:outline-none focus:border-[#1c1a19]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1c1a19]"
                  >
                    <Icon icon={showPassword ? "lucide:eye-off" : "lucide:eye"} width="18" />
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full h-14 bg-[#1c1a19] text-white font-bold uppercase tracking-widest text-xs hover:bg-[#a58c69] transition-colors mt-4"
              >
                Continue to Brand Info
              </button>
            </form>
            
            <p className="text-[10px] text-center text-gray-400 uppercase tracking-widest">
              Already have an account? <Link href="/seller/login" className="text-[#a58c69] font-bold hover:underline">Login here</Link>
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <header className="flex flex-col gap-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#a58c69]">Step 2 of 2</span>
              <h1 className="text-2xl font-bold uppercase tracking-tight text-[#1c1a19]">Tell us about your brand</h1>
              <button 
                onClick={() => setStep(1)} 
                className="text-[9px] uppercase font-bold tracking-widest text-gray-400 hover:text-[#1c1a19] flex items-center gap-1 w-fit"
              >
                <Icon icon="lucide:arrow-left" width="12" /> Back to Account
              </button>
            </header>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Brand Name</label>
                <input 
                  type="text" 
                  value={brandData.name}
                  onChange={(e) => setBrandData({...brandData, name: e.target.value})}
                  className="w-full h-12 border border-[#e5e5e5] px-4 text-sm focus:outline-none focus:border-[#1c1a19]"
                  placeholder="e.g., Nakuru Textiles"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Primary Category</label>
                <select 
                  value={brandData.category}
                  onChange={(e) => setBrandData({...brandData, category: e.target.value})}
                  className="w-full h-12 border border-[#e5e5e5] px-4 text-sm focus:outline-none focus:border-[#1c1a19] bg-white"
                >
                  <option>Clothing</option>
                  <option>Accessories</option>
                  <option>Footwear</option>
                  <option>Home Goods</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Estimated Monthly Sales</label>
                <select 
                  value={brandData.range}
                  onChange={(e) => setBrandData({...brandData, range: e.target.value})}
                  className="w-full h-12 border border-[#e5e5e5] px-4 text-sm focus:outline-none focus:border-[#1c1a19] bg-white"
                >
                  <option>0 - 100,000 KSh</option>
                  <option>100,000 - 500,000 KSh</option>
                  <option>500,000+ KSh</option>
                </select>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-[#1c1a19] text-white font-bold uppercase tracking-widest text-xs hover:bg-[#a58c69] transition-colors mt-4 disabled:opacity-50"
              >
                {isLoading ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center gap-8 py-10 text-center animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
              <Icon icon="lucide:check" className="text-green-500" width="40" />
            </div>
            <div className="flex flex-col gap-3">
              <h1 className="text-2xl font-bold uppercase tracking-tight text-[#1c1a19]">Request Submitted</h1>
              <p className="text-sm font-mono text-gray-500 leading-relaxed px-4">
                Thank you for your interest in selling on Mnada! Your application is now being reviewed by our team. 
              </p>
              <p className="text-sm font-mono text-[#a58c69] font-bold">
                You will receive an email once your account is approved.
              </p>
            </div>
            <Link 
              href="/"
              className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1c1a19] border-b border-[#1c1a19] hover:text-[#a58c69] hover:border-[#a58c69] transition-colors pb-1"
            >
              Back to Home
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
