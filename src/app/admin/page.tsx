"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { getOrderReference } from "@/lib/orderReference";

const ORDER_STATUSES = ["pending", "confirmed", "dispatched", "delivered", "cancelled"] as const;

type OrderStatus = typeof ORDER_STATUSES[number];

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
  status: OrderStatus;
  total: number;
  order_items: OrderItem[];
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/orders", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("mnada_admin_token")}`,
        },
      });

      const payload: Order[] | { error?: string } = await response.json().catch(() => []);
      if (!response.ok) {
        const message = Array.isArray(payload) ? "Failed to fetch orders" : (payload.error || "Failed to fetch orders");
        throw new Error(message);
      }

      setOrders(Array.isArray(payload) ? payload : []);
    } catch (error) {
      setError(getErrorMessage(error, "Failed to fetch orders"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId: string, status: OrderStatus) => {
    setUpdatingOrderId(orderId);
    setError(null);

    try {
      const response = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("mnada_admin_token")}`,
        },
        body: JSON.stringify({ id: orderId, status }),
      });

      const payload: Order | { error?: string } = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = "error" in payload && payload.error ? payload.error : "Failed to update order";
        throw new Error(message);
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId ? { ...order, status: (payload as Order).status } : order
        )
      );
    } catch (error) {
      setError(getErrorMessage(error, "Failed to update order"));
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const filteredOrders = orders.filter((order) =>
    statusFilter === "all" ? true : order.status === statusFilter
  );

  const statusClasses: Record<OrderStatus, string> = {
    pending: "bg-amber-100 text-amber-800",
    confirmed: "bg-sky-100 text-sky-800",
    dispatched: "bg-indigo-100 text-indigo-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="animate-pulse flex items-center gap-2 font-mono text-sm uppercase tracking-widest text-gray-400">
          <Icon icon="lucide:loader" className="animate-spin" /> Loading Orders...
        </div>
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
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | OrderStatus)}
            className="h-10 border border-[#e5e5e5] bg-white px-3 font-mono text-xs uppercase tracking-widest text-[#1c1a19] focus:outline-none"
          >
            <option value="all">All Statuses</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button
            onClick={fetchOrders}
            className="h-10 px-4 border border-[#e5e5e5] bg-white font-mono text-xs uppercase tracking-widest text-[#1c1a19] hover:bg-[#f8f8f8] transition-colors flex items-center gap-2"
          >
            <Icon icon="lucide:refresh-cw" width="14" /> Refresh
          </button>
          <div className="text-xs font-mono bg-[#1c1a19] text-white px-4 py-2 uppercase tracking-widest">
            {filteredOrders.length} Visible Orders
          </div>
        </div>
      </header>

      {error ? (
        <div className="w-full bg-red-50 text-red-600 p-6 border border-red-200 font-mono text-sm">
          Error loading orders: {error}
        </div>
      ) : null}

      {filteredOrders.length === 0 ? (
        <div className="w-full text-center py-20 bg-white border border-[#e5e5e5] flex flex-col items-center gap-4">
          <Icon icon="lucide:package-open" width="48" className="text-gray-300" />
          <p className="font-mono text-sm text-gray-500 uppercase tracking-widest">No orders match the current filter.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white border border-[#e5e5e5] overflow-hidden">
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
                  <span className="text-xs font-mono text-[#1c1a19] uppercase">{getOrderReference(order)}</span>
                </div>
                <div className="flex flex-col gap-2 md:items-end">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 ${statusClasses[order.status] || "bg-gray-100 text-gray-700"}`}>
                    {order.status}
                  </span>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusUpdate(order.id, e.target.value as OrderStatus)}
                    disabled={updatingOrderId === order.id}
                    className="h-9 min-w-36 border border-[#e5e5e5] bg-white px-3 font-mono text-[11px] uppercase tracking-widest text-[#1c1a19] focus:outline-none disabled:opacity-60"
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-4 lg:p-6 flex flex-col lg:flex-row gap-8">
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

                <div className="w-full lg:w-1/3 flex flex-col gap-4 pl-0 lg:pl-8 lg:border-l border-[#e5e5e5]">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-[#e5e5e5] pb-2">Customer Details</h3>
                  <div className="flex flex-col gap-2 font-mono text-xs text-[#1c1a19]">
                    <span className="font-bold flex items-center gap-2"><Icon icon="lucide:user" /> {order.customer_first_name} {order.customer_last_name}</span>
                    <span className="flex items-center gap-2"><Icon icon="lucide:mail" /> {order.customer_email}</span>
                    <span className="flex items-center gap-2"><Icon icon="lucide:phone" /> {order.customer_phone}</span>
                    <span className="flex items-start gap-2 mt-2"><Icon icon="lucide:map-pin" className="shrink-0 mt-0.5" />
                      <span>{order.shipping_address}<br />{order.shipping_city}</span>
                    </span>
                    <div className="flex flex-wrap gap-3 pt-3">
                      <a
                        href={`tel:${order.customer_phone}`}
                        className="inline-flex items-center gap-2 border border-[#e5e5e5] px-3 py-2 text-[11px] uppercase tracking-widest hover:bg-[#f8f8f8] transition-colors"
                      >
                        <Icon icon="lucide:phone-call" width="14" /> Call
                      </a>
                      <a
                        href={`https://wa.me/${order.customer_phone.replace(/\D/g, "").replace(/^0/, "254")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 border border-[#e5e5e5] px-3 py-2 text-[11px] uppercase tracking-widest hover:bg-[#f8f8f8] transition-colors"
                      >
                        <Icon icon="lucide:message-circle" width="14" /> WhatsApp
                      </a>
                    </div>
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
