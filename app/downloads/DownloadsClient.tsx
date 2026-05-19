"use client";
import { exportAllOrdersExcel, exportSummaryExcel } from '../../lib/excel-exports';
import { useState } from 'react';

export default function DownloadsClient({ districts }) {
  const [loading, setLoading] = useState(false);

  const handleDownloadSummary = () => {
    exportSummaryExcel(districts);
  };
  const handleDownloadAllOrders = () => {
    exportAllOrdersExcel(districts);
  };
  const handleDownloadPlaceholder = () => {
    alert("Placeholder for third download");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-2xl mx-auto px-4 py-16 space-y-8">
        <h1 className="text-2xl font-bold text-gray-800">Downloads</h1>
        <div className="flex flex-col gap-4">
          <button
            onClick={handleDownloadSummary}
            className="px-6 py-3 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 transition-colors shadow"
          >
            Download Summary Excel
          </button>
          <button
            onClick={handleDownloadAllOrders}
            className="px-6 py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors shadow"
          >
            Download All Orders Excel
          </button>
          <button
            onClick={handleDownloadPlaceholder}
            className="px-6 py-3 bg-gray-400 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors shadow"
          >
            Placeholder Download
          </button>
        </div>
      </main>
    </div>
  );
}
