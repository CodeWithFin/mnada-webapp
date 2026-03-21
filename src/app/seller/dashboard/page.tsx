"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";

interface Stats {
  summary: {
    totalRevenue: number;
    totalPotentialProfit: number;
    salesCount: number;
    productCount: number;
    commissionRate: number;
  };
  recentOrders: any[];
}

export default function SellerDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const authHeader = `Bearer ${localStorage.getItem('mnada_seller_token')}`;
      try {
        const res = await fetch('/api/seller/stats', {
          headers: { 'Authorization': authHeader }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Icon icon="lucide:loader" className="animate-spin text-gray-300" width="32" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <header>
        <h1 className="text-3xl font-bold uppercase tracking-tight text-[#1c1a19]">Dashboard</h1>
        <p className="text-sm font-mono text-gray-500 mt-2">Overview of your shop performance</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Potential Profit" 
          value={`KSh ${(stats?.summary?.totalPotentialProfit || 0).toLocaleString()}`} 
          icon="lucide:wallet" 
          detail={`After ${(stats?.summary?.commissionRate || 0) * 100}% commission`}
        />
        <StatCard 
          title="Total Revenue" 
          value={`KSh ${(stats?.summary?.totalRevenue || 0).toLocaleString()}`} 
          icon="lucide:trending-up" 
          detail={`${stats?.summary?.salesCount || 0} items sold`}
        />
        <StatCard 
          title="My Products" 
          value={(stats?.summary?.productCount || 0).toString()} 
          icon="lucide:package" 
          detail="Active items in store"
        />
        <StatCard 
          title="Sales" 
          value={(stats?.summary?.salesCount || 0).toString()} 
          icon="lucide:shopping-bag" 
          detail="Successfully confirmed"
        />
      </div>

      <section className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold uppercase tracking-widest text-[#1c1a19]">Recent Activity</h2>
          <Link href="/seller/orders" className="text-xs font-bold uppercase tracking-widest text-[#a58c69] hover:underline">View All Orders</Link>
        </div>

        <div className="bg-white border border-[#e5e5e5]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e5e5e5] bg-[#f8f8f8]">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Order Ref</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Product</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Quantity</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Total</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center font-mono text-sm text-gray-400">No recent orders yet.</td>
                  </tr>
                ) : (
                  stats?.recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-[#f0f0f0] last:border-0 hover:bg-[#fafafa] transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-gray-400">{(order.order_id || 'ID').substring(0,8)}...</td>
                      <td className="px-6 py-4 font-bold text-xs uppercase text-[#1c1a19]">{order.product_name || 'Product'}</td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">{order.quantity || 0}</td>
                      <td className="px-6 py-4 font-mono text-xs text-[#1c1a19]">KSh {(order.total || 0).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value, icon, detail }: any) {
  return (
    <div className="bg-white border border-[#e5e5e5] p-6 flex flex-col gap-4">
      <div className="flex justify-between items-center text-gray-400">
        <Icon icon={icon} width="20" />
        <span className="text-[10px] font-bold uppercase tracking-widest">{title}</span>
      </div>
      <div className="text-2xl font-bold text-[#1c1a19] tracking-tight">{value}</div>
      <div className="text-[10px] font-mono text-gray-400 uppercase">{detail}</div>
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'delivered': return 'bg-green-50 text-green-600 border border-green-100';
    case 'pending': return 'bg-yellow-50 text-yellow-600 border border-yellow-100';
    case 'cancelled': return 'bg-red-50 text-red-600 border border-red-100';
    default: return 'bg-blue-50 text-blue-600 border border-blue-100';
  }
}
