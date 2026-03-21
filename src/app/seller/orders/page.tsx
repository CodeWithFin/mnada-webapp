"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";

interface SellerOrder {
  id: string;
  order_id: string;
  order_reference: string;
  product_name: string;
  quantity: number;
  unit_price?: number;
  price?: number;
  customer_name: string;
  status: string;
  date: string;
  size: string;
}

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const authHeader = `Bearer ${localStorage.getItem('mnada_seller_token')}`;
      try {
        const res = await fetch('/api/seller/orders', {
          headers: { 'Authorization': authHeader }
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <header className="border-b border-[#e5e5e5] pb-4">
        <h1 className="text-3xl font-bold uppercase tracking-tight text-[#1c1a19]">Your Orders</h1>
        <p className="text-sm font-mono text-gray-500 mt-2">Track sales of your products</p>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Icon icon="lucide:loader" className="animate-spin text-gray-300" width="32" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 border bg-white flex flex-col items-center gap-4">
          <Icon icon="lucide:shopping-bag" width="48" className="text-gray-200" />
          <p className="font-mono text-sm text-gray-400 uppercase tracking-widest">No orders found.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#e5e5e5]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e5e5e5] bg-[#f8f8f8]">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Date</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Order Ref</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Customer</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Product</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Size/Qty</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Total</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-[#f0f0f0] last:border-0 hover:bg-[#fafafa] transition-colors">
                    <td className="px-6 py-4 font-mono text-[10px] text-gray-400">
                      {order.date ? new Date(order.date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                      #{order.order_reference || 'REF'}
                    </td>
                    <td className="px-6 py-4 font-bold text-xs uppercase text-[#1c1a19]">
                      {order.customer_name}
                    </td>
                    <td className="px-6 py-4 font-bold text-xs uppercase text-[#1c1a19]">
                      {order.product_name}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                      {order.size} x {order.quantity}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-[#1c1a19]">
                      KSh {((order.unit_price || order.price || 0) * (order.quantity || 0)).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
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
