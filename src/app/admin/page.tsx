"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  size: string;
}

interface Order {
  id: string;
  created_at: string;
  customer_email: string;
  customer_first_name: string;
  customer_last_name: string;
  shipping_address: string;
  shipping_city: string;
  customer_phone: string;
  status: string;
  total: number;
  order_items: OrderItem[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      // In a real app we'd use a more secure token standard than plain password in localstorage
      const authHeader = `Bearer ${localStorage.getItem('mnada_admin_token')}`;
      
      try {
        const response = await fetch('/api/admin/orders', {
          headers: {
            'Authorization': authHeader
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch orders');
        
        const data = await response.json();
        setOrders(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="animate-pulse flex items-center gap-2 font-mono text-sm uppercase tracking-widest text-gray-400">
          <Icon icon="lucide:loader" className="animate-spin" /> Loading Orders...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-red-50 text-red-600 p-6 border border-red-200 font-mono text-sm">
        Error loading orders: {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex justify-between items-end border-b border-[#e5e5e5] pb-4">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-tight text-[#1c1a19]">Orders</h1>
          <p className="text-sm font-mono text-gray-500 mt-2">Manage all customer checkouts</p>
        </div>
        <div className="text-xs font-mono bg-[#1c1a19] text-white px-4 py-2 uppercase tracking-widest">
          {orders.length} Total Orders
        </div>
      </header>

      {orders.length === 0 ? (
        <div className="w-full text-center py-20 bg-white border border-[#e5e5e5] flex flex-col items-center gap-4">
          <Icon icon="lucide:package-open" width="48" className="text-gray-300" />
          <p className="font-mono text-sm text-gray-500 uppercase tracking-widest">No orders received yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-[#e5e5e5] overflow-hidden">
              {/* Order Header */}
              <div className="bg-[#f8f8f8] p-4 lg:p-6 border-b border-[#e5e5e5] flex flex-col md:flex-row justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Order Placed</span>
                  <span className="text-sm font-mono text-[#1c1a19]">{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Total</span>
                  <span className="text-sm font-mono text-[#1c1a19]">KSh {Number(order.total).toFixed(2)}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Order ID</span>
                  <span className="text-xs font-mono text-[#1c1a19] uppercase">#{order.id.split('-')[0]}</span>
                </div>
                <div className="flex flex-col gap-1 md:items-end">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 ${order.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                      {order.status}
                    </span>
                </div>
              </div>

              {/* Order Details */}
              <div className="p-4 lg:p-6 flex flex-col lg:flex-row gap-8">
                
                {/* Items List */}
                <div className="w-full lg:w-2/3 flex flex-col gap-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-[#e5e5e5] pb-2">Line Items</h3>
                  {order.order_items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2">
                       <div className="flex flex-col">
                         <span className="text-sm font-bold uppercase tracking-widest text-[#1c1a19]">{item.product_name}</span>
                         <span className="text-xs font-mono text-gray-500">Size: {item.size} | Qty: {item.quantity}</span>
                       </div>
                       <span className="text-sm font-mono text-[#1c1a19]">KSh {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Customer Info */}
                <div className="w-full lg:w-1/3 flex flex-col gap-4 pl-0 lg:pl-8 lg:border-l border-[#e5e5e5]">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-[#e5e5e5] pb-2">Customer Details</h3>
                  <div className="flex flex-col gap-2 font-mono text-xs text-[#1c1a19]">
                    <span className="font-bold flex items-center gap-2"><Icon icon="lucide:user" /> {order.customer_first_name} {order.customer_last_name}</span>
                    <span className="flex items-center gap-2"><Icon icon="lucide:mail" /> {order.customer_email}</span>
                    <span className="flex items-center gap-2"><Icon icon="lucide:phone" /> {order.customer_phone}</span>
                    <span className="flex items-start gap-2 mt-2"><Icon icon="lucide:map-pin" className="shrink-0 mt-0.5" /> 
                      <span>{order.shipping_address}<br/>{order.shipping_city}</span>
                    </span>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
