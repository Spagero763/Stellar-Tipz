import React, { useMemo, useState } from "react";

import EmptyState from "../../components/ui/EmptyState";
import Input from "../../components/ui/Input";
import Table from "../../components/ui/Table";
import { mockTips } from "../mockData";

const PAGE_SIZE = 20;

function stroopsToXlm(stroops: string): string {
  return (Number(stroops) / 1e7).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 7,
  });
}

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}…${address.slice(-6)}`;
}

const TipsTab: React.FC = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [senderSearch, setSenderSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    return mockTips.filter((tip) => {
      if (startDate) {
        const start = new Date(startDate).getTime();
        if (tip.timestamp < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate).getTime() + 24 * 60 * 60 * 1000 - 1;
        if (tip.timestamp > end) return false;
      }
      if (senderSearch.trim()) {
        const q = senderSearch.trim().toLowerCase();
        if (!tip.from.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [startDate, endDate, senderSearch]);

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const endIdx = Math.min(startIdx + PAGE_SIZE, totalCount);
  const paginated = filtered.slice(startIdx, endIdx);

  const tableData = paginated.map((tip) => ({
    date: formatTimestamp(tip.timestamp),
    from: truncateAddress(tip.from),
    amount: `${stroopsToXlm(tip.amount)} XLM`,
    message: tip.message || "—",
  }));

  const columns = [
    { key: "date", label: "Date" },
    { key: "from", label: "Sender" },
    { key: "amount", label: "Amount", align: "right" as const },
    { key: "message", label: "Message" },
  ];

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  return (
    <div className="space-y-5">
      {/* Filter row */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
            From date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              handleFilterChange();
            }}
            className="h-10 border-2 border-black bg-white px-3 text-sm font-medium focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
            To date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              handleFilterChange();
            }}
            className="h-10 border-2 border-black bg-white px-3 text-sm font-medium focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          />
        </div>
        <div className="flex-1 min-w-[220px]">
          <Input
            label="Search by sender"
            placeholder="Paste sender address…"
            value={senderSearch}
            onChange={(e) => {
              setSenderSearch(e.target.value);
              handleFilterChange();
            }}
          />
        </div>
      </div>

      {/* Row count */}
      {totalCount > 0 && (
        <p className="text-sm font-bold text-gray-600">
          Showing {startIdx + 1}–{endIdx} of {totalCount} tip{totalCount !== 1 ? "s" : ""}
        </p>
      )}

      {/* Responsive table */}
      {paginated.length === 0 ? (
        <EmptyState
          title="No tips found"
          description="Try adjusting your date range or sender address filter."
        />
      ) : (
        <div className="overflow-x-auto">
          <Table columns={columns} data={tableData} />
        </div>
      )}

      {/* Simple pagination */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="border-2 border-black px-4 py-2 text-sm font-black uppercase disabled:opacity-40 hover:bg-black hover:text-white transition-colors"
          >
            Prev
          </button>
          <span className="text-sm font-bold">
            Page {safePage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="border-2 border-black px-4 py-2 text-sm font-black uppercase disabled:opacity-40 hover:bg-black hover:text-white transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default TipsTab;
