"use client";
import { exportAllOrdersExcel, exportSummaryExcel, exportItemSizeMatrixExcel } from '../../lib/excel-exports';
import { useState, useMemo } from 'react';
import type { District } from '../components/order-form';

interface Uniform {
  id: string;
  name: string;
  size: string;
  quantity: string;
}

interface Order {
  id: string;
  firstname: string;
  lastname: string;
  recipientname: string;
  recipientlastaname: string;
  rank?: string;
  recipientpercalid: string;
  ismale: boolean;
  createdAt: string;
  uniforms: Uniform[];
  stationId: string;
}

interface StationEntry {
  stationName: string;
  districtName: string;
  stations?: Record<string, { stationName: string; districtName: string }>;
}

interface DownloadsClientProps {
  orders: Order[];
  stationMap: Record<string, StationEntry>;
}

export default function DownloadsClient({ orders, stationMap }: DownloadsClientProps) {
  const [loading, setLoading] = useState(false);

  // Reorganize orders by district and station using the station map
  const districts: District[] = useMemo(() => {
    const districtMap: Record<string, District> = {};
    const stationMap_: Record<string, { id: string; name: string; orders: Order[] }> = {};

    for (const order of orders) {
      const stationId = order.stationId || 'unknown';
      const mapping = stationMap[stationId];
      const stationName = mapping ? mapping.stationName : stationId;
      const districtName = mapping ? mapping.districtName : 'Unknown District';

      const districtId = districtName;
      if (!districtMap[districtId]) {
        districtMap[districtId] = { id: districtId, name: districtName, stattions: [] };
      }

      if (!stationMap_[stationId]) {
        stationMap_[stationId] = { id: stationId, name: stationName, orders: [] };
      }

      stationMap_[stationId].orders.push(order);
    }

    // Build districts with their stations
    for (const districtId in districtMap) {
      const district = districtMap[districtId];
      const stationIds = Object.keys(stationMap_).filter((sId) => {
        const mapping = stationMap[sId];
        return mapping && mapping.districtName === districtId;
      });

      district.stattions = stationIds.map((sId) => stationMap_[sId]);
    }

    return Object.values(districtMap);
  }, [orders, stationMap]);

  const handleDownloadSummary = () => {
    exportSummaryExcel(districts);
  };

  const handleDownloadAllOrders = () => {
    exportAllOrdersExcel(districts);
  };

  const handleDownloadMatrix = () => {
    exportItemSizeMatrixExcel(districts);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-2xl mx-auto px-4 py-16 space-y-8">
        <h1 className="text-2xl font-bold text-gray-800">Downloads</h1>
        <p className="text-gray-600">Total Orders: {orders.length}</p>
        <div className="flex flex-col gap-4">
          <button
            onClick={handleDownloadSummary}
            disabled={loading}
            className="px-6 py-3 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 transition-colors shadow disabled:opacity-50"
          >
            Download Summary Excel
          </button>
          <button
            onClick={handleDownloadAllOrders}
            disabled={loading}
            className="px-6 py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors shadow disabled:opacity-50"
          >
            Download All Orders Excel
          </button>
          <button
            onClick={handleDownloadMatrix}
            disabled={loading}
            className="px-6 py-3 bg-gray-400 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors shadow disabled:opacity-50"
          >
            Download Item Size Matrix Excel
          </button>
        </div>
      </main>
    </div>
  );
}
