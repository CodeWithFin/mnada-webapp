"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getOrderReference } from "@/lib/orderReference";

type OrderItem = {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  size: string;
};

type Order = {
  id: string;
  created_at: string;
  status: "pending" | "confirmed" | "dispatched" | "delivered" | "cancelled";
  total: number;
  shipping_address: string;
  shipping_city: string;
  order_items: OrderItem[];
};

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export default function AccountPage() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingApartment, setShippingApartment] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingPostalCode, setShippingPostalCode] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [isGoogleAuthLoading, setIsGoogleAuthLoading] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const statusClasses: Record<Order["status"], string> = useMemo(
    () => ({
      pending: "bg-amber-100 text-amber-800",
      confirmed: "bg-sky-100 text-sky-800",
      dispatched: "bg-indigo-100 text-indigo-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    }),
    []
  );

  const loadProfile = async (accessToken: string) => {
    try {
      const res = await fetch("/api/client/profile", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) return;
      const profile = await res.json();
      if (profile.first_name) setFirstName(profile.first_name);
      if (profile.last_name) setLastName(profile.last_name);
      if (profile.shipping_address) setShippingAddress(profile.shipping_address);
      if (profile.shipping_apartment) setShippingApartment(profile.shipping_apartment);
      if (profile.shipping_city) setShippingCity(profile.shipping_city);
      if (profile.shipping_postal_code) setShippingPostalCode(profile.shipping_postal_code);
      if (profile.shipping_phone) setShippingPhone(profile.shipping_phone);
    } catch {
      // non-blocking
    }
  };

  const loadOrders = async () => {
    setIsLoadingOrders(true);
    setError("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setOrders([]);
        setIsAuthenticated(false);
        return;
      }

      const response = await fetch("/api/client/orders", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const payload: Order[] | { error?: string } = await response.json().catch(() => []);

      if (!response.ok) {
        const message = Array.isArray(payload) ? "Failed to fetch orders" : payload.error || "Failed to fetch orders";
        throw new Error(message);
      }

      setOrders(Array.isArray(payload) ? payload : []);
      setIsAuthenticated(true);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load orders"));
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    const bootstrap = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (ignore) return;

      if (session?.user) {
        setIsAuthenticated(true);
        setEmail(session.user.email || "");
        const metadata = (session.user.user_metadata || {}) as Record<string, unknown>;
        setFirstName(String(metadata.firstName || metadata.given_name || ""));
        setLastName(String(metadata.lastName || metadata.family_name || ""));
        await loadProfile(session.access_token);
        await loadOrders();
      }
    };

    bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setIsAuthenticated(true);
        setEmail(session.user.email || "");
        const metadata = (session.user.user_metadata || {}) as Record<string, unknown>;
        setFirstName(String(metadata.firstName || metadata.given_name || ""));
        setLastName(String(metadata.lastName || metadata.family_name || ""));
        loadProfile(session.access_token);
        loadOrders();
      }

      if (event === "SIGNED_OUT") {
        setIsAuthenticated(false);
        setOrders([]);
        setEmail("");
        setFirstName("");
        setLastName("");
        setShippingAddress("");
        setShippingApartment("");
        setShippingCity("");
        setShippingPostalCode("");
        setShippingPhone("");
      }
    });

    return () => {
      ignore = true;
      subscription.unsubscribe();
    };
  }, []);

  const handleGoogleSignIn = async () => {
    setError("");
    setInfo("");
    setIsGoogleAuthLoading(true);

    try {
      const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/account` : undefined;

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });

      if (oauthError) {
        throw oauthError;
      }
    } catch (err) {
      setError(getErrorMessage(err, "Google sign in failed"));
      setIsGoogleAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setOrders([]);
    setInfo("You have been signed out.");
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setIsSavingProfile(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Not authenticated");

      const res = await fetch("/api/client/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          shipping_address: shippingAddress.trim(),
          shipping_apartment: shippingApartment.trim(),
          shipping_city: shippingCity.trim(),
          shipping_postal_code: shippingPostalCode.trim(),
          shipping_phone: shippingPhone.trim(),
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || "Failed to save profile");
      }

      // Also keep auth metadata in sync for Google-sourced names
      await supabase.auth.updateUser({
        data: { firstName: firstName.trim(), lastName: lastName.trim() },
      });

      setInfo("Profile & shipping details saved.");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to save profile"));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const shouldPromptProfile = isAuthenticated;

  return (
    <div className="page-wrapper min-h-screen bg-white">
      <main className="padding-global px-5 lg:px-20 py-12 lg:py-16">
        <div className="container-large max-w-[1200px] mx-auto flex flex-col gap-8">
          <header className="flex flex-col gap-3 border-b border-[#e5e5e5] pb-5">
            <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#a58c69]">Account</span>
            <h1 className="text-3xl font-bold uppercase tracking-tight text-[#1c1a19]">My Account</h1>
            <p className="text-sm font-mono text-gray-500">
              Sign in with Google to register or log in and track your Mnada orders.
            </p>
          </header>

          {!isAuthenticated ? (
            <section className="w-full max-w-xl border border-[#e5e5e5] bg-[#f8f8f8] p-6 lg:p-8 flex flex-col gap-5">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleAuthLoading}
                className="h-12 border border-[#1c1a19] bg-white text-[#1c1a19] font-bold uppercase tracking-widest text-xs hover:bg-[#1c1a19] hover:text-white transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <Icon icon="logos:google-icon" width="16" />
                {isGoogleAuthLoading ? "Redirecting..." : "Continue with Google"}
              </button>

              {error ? <p className="font-mono text-sm text-red-600">{error}</p> : null}
              {info ? <p className="font-mono text-sm text-green-700">{info}</p> : null}
            </section>
          ) : (
            <section className="flex items-center justify-between gap-4 border border-[#e5e5e5] bg-[#f8f8f8] p-4 lg:p-6">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Signed In</span>
                <span className="text-sm font-mono text-[#1c1a19]">{firstName ? `${firstName}${lastName ? ` ${lastName}` : ""}` : email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="h-10 px-4 border border-[#e5e5e5] bg-white text-xs font-mono uppercase tracking-widest text-[#1c1a19] hover:bg-[#1c1a19] hover:text-white transition-colors"
              >
                Logout
              </button>
            </section>
          )}

          {shouldPromptProfile ? (
            <section className="w-full border border-[#e5e5e5] bg-[#f8f8f8] p-6 lg:p-8">
              <form onSubmit={handleSaveProfile} className="flex flex-col gap-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-[#1c1a19] pb-2 border-b border-[#e5e5e5]">Profile &amp; Shipping Details</h2>

                <div className="flex flex-col gap-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#a58c69]">Personal</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                      className="h-12 border border-[#e5e5e5] bg-white px-4 font-mono text-sm focus:outline-none focus:border-[#1c1a19]"
                    />
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                      className="h-12 border border-[#e5e5e5] bg-white px-4 font-mono text-sm focus:outline-none focus:border-[#1c1a19]"
                    />
                  </div>
                  <input
                    type="tel"
                    value={shippingPhone}
                    onChange={(e) => setShippingPhone(e.target.value)}
                    placeholder="Phone number"
                    className="h-12 border border-[#e5e5e5] bg-white px-4 font-mono text-sm focus:outline-none focus:border-[#1c1a19]"
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#a58c69]">Default Shipping Address</h3>
                  <input
                    type="text"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Street address"
                    className="h-12 border border-[#e5e5e5] bg-white px-4 font-mono text-sm focus:outline-none focus:border-[#1c1a19]"
                  />
                  <input
                    type="text"
                    value={shippingApartment}
                    onChange={(e) => setShippingApartment(e.target.value)}
                    placeholder="Apartment, suite, etc. (optional)"
                    className="h-12 border border-[#e5e5e5] bg-white px-4 font-mono text-sm focus:outline-none focus:border-[#1c1a19]"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={shippingCity}
                      onChange={(e) => setShippingCity(e.target.value)}
                      placeholder="City"
                      className="h-12 border border-[#e5e5e5] bg-white px-4 font-mono text-sm focus:outline-none focus:border-[#1c1a19]"
                    />
                    <input
                      type="text"
                      value={shippingPostalCode}
                      onChange={(e) => setShippingPostalCode(e.target.value)}
                      placeholder="Postal code"
                      className="h-12 border border-[#e5e5e5] bg-white px-4 font-mono text-sm focus:outline-none focus:border-[#1c1a19]"
                    />
                  </div>
                </div>

                {error ? <p className="font-mono text-sm text-red-600">{error}</p> : null}
                {info ? <p className="font-mono text-sm text-green-700">{info}</p> : null}

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="h-11 w-fit px-6 bg-[#1c1a19] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#a58c69] transition-colors disabled:opacity-60"
                >
                  {isSavingProfile ? "Saving..." : "Save Details"}
                </button>
              </form>
            </section>
          ) : null}

          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold uppercase tracking-widest text-[#1c1a19]">Your Orders</h2>
              {isAuthenticated ? (
                <button
                  onClick={loadOrders}
                  disabled={isLoadingOrders}
                  className="h-10 px-4 border border-[#e5e5e5] bg-white text-xs font-mono uppercase tracking-widest text-[#1c1a19] hover:bg-[#f8f8f8] transition-colors disabled:opacity-60"
                >
                  {isLoadingOrders ? "Refreshing..." : "Refresh"}
                </button>
              ) : null}
            </div>

            {!isAuthenticated ? (
              <div className="border border-[#e5e5e5] bg-white p-8 text-center">
                <p className="font-mono text-sm text-gray-500">Sign in with Google to view your order history.</p>
              </div>
            ) : isLoadingOrders ? (
              <div className="border border-[#e5e5e5] bg-white p-8 flex items-center justify-center gap-2 text-gray-500 font-mono text-sm">
                <Icon icon="lucide:loader" className="animate-spin" /> Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="border border-[#e5e5e5] bg-white p-8 text-center flex flex-col items-center gap-3">
                <Icon icon="lucide:package-open" width="30" className="text-gray-300" />
                <p className="font-mono text-sm text-gray-500">No orders found for this account yet.</p>
                <Link
                  href="/mens"
                  className="h-10 px-4 inline-flex items-center border border-[#1c1a19] text-[#1c1a19] text-xs font-bold uppercase tracking-widest hover:bg-[#1c1a19] hover:text-white transition-colors"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {orders.map((order) => (
                  <article key={order.id} className="border border-[#e5e5e5] bg-white p-5 lg:p-6 flex flex-col gap-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-[#e5e5e5] pb-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Order</span>
                        <span className="text-sm font-mono text-[#1c1a19] uppercase">{getOrderReference(order)}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-mono text-gray-500">{new Date(order.created_at).toLocaleDateString()}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 ${statusClasses[order.status]}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {order.order_items?.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm font-mono text-[#1c1a19]">
                          <span>
                            {item.product_name} x{item.quantity} ({item.size})
                          </span>
                          <span>KSh {(item.quantity * item.price).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-[#e5e5e5] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                      <span className="text-xs font-mono text-gray-500">
                        Delivery: {order.shipping_address}, {order.shipping_city}
                      </span>
                      <span className="text-sm font-bold uppercase tracking-widest text-[#1c1a19]">
                        Total: KSh {Number(order.total).toFixed(2)}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
