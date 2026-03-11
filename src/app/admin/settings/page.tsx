"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";

export default function AdminSettingsPage() {
  const [currentUsername, setCurrentUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    // Pre-fill username from localStorage
    const savedUsername = localStorage.getItem("mnada_admin_username");
    if (savedUsername) {
      setCurrentUsername(savedUsername);
    }
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const parentUsername = localStorage.getItem("mnada_admin_username") || "";

      const res = await fetch("/api/admin/auth/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentUsername: parentUsername,
          currentPassword,
          newUsername: newUsername || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage({ type: "success", text: "Settings updated successfully." });
        if (newUsername) {
          localStorage.setItem("mnada_admin_username", newUsername);
          setCurrentUsername(newUsername);
        }
        // Clear sensitive / intent fields
        setCurrentPassword("");
        setNewUsername("");
        setNewPassword("");
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update settings." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold uppercase tracking-widest text-[#1c1a19] mb-2">Settings</h1>
        <p className="text-gray-500 font-mono text-sm">Update your admin credentials.</p>
      </div>

      <div className="bg-white border border-[#e5e5e5] p-6 lg:p-8">
        <h2 className="text-xl font-bold uppercase tracking-widest text-[#1c1a19] mb-6 flex items-center gap-3">
          <Icon icon="lucide:shield" width="20" className="text-[#a58c69]" /> Account Credentials
        </h2>

        <form onSubmit={handleUpdate} className="flex flex-col gap-6">
          {message.text && (
            <div className={`p-4 text-sm font-mono flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              <Icon icon={message.type === 'success' ? "lucide:check-circle" : "lucide:alert-circle"} width="18" />
              {message.text}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Current Logged-in Username</label>
            <div className="h-12 border border-[#e5e5e5] px-4 font-mono text-sm focus:outline-none bg-gray-50 text-gray-500 flex items-center">
              {currentUsername || "Not provided"}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Current Password (Required to update)</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full h-12 border border-[#e5e5e5] px-4 font-mono text-sm focus:outline-none focus:border-[#1c1a19]"
            />
          </div>

          <hr className="border-[#e5e5e5] my-2" />

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">New Username (Optional)</label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Leave blank to keep current"
              className="w-full h-12 border border-[#e5e5e5] px-4 font-mono text-sm focus:outline-none focus:border-[#1c1a19]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">New Password (Optional)</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Leave blank to keep current"
              className="w-full h-12 border border-[#e5e5e5] px-4 font-mono text-sm focus:outline-none focus:border-[#1c1a19]"
            />
            <p className="text-xs text-gray-400 font-mono italic">We recommend a strong combination of letters and numbers.</p>
          </div>

          <div className="mt-4">
            <button 
              type="submit" 
              disabled={isLoading || !currentPassword}
              className={`h-12 px-8 bg-[#1c1a19] text-white font-bold uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2 ${(isLoading || !currentPassword) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#a58c69]'}`}
            >
              {isLoading ? (
                <><Icon icon="lucide:loader-2" className="animate-spin" width="16" /> Updating...</>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
