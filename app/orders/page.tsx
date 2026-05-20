
"use client";
import { useEffect, useState } from "react";
import OrdersView from "@/app/components/orders-view";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders-redis-server", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        setOrders(data.orders || []);
      } catch (err) {
        setError("Could not load orders.");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  if (loading) return <div className="p-10 text-center text-gray-400">Loading orders…</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;
  return <OrdersView orders={orders} />;
}
