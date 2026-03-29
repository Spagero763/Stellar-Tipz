import React, { useMemo, useState } from "react";

import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import type { LeaderboardEntry } from "../../types/contract";
import LeaderboardRow from "./LeaderboardRow";

const PAGE_SIZE = 20;

// ---------------------------------------------------------------------------
// LeaderboardTable
// ---------------------------------------------------------------------------
export interface LeaderboardTableProps {
  /**
   * Leaderboard entries starting from rank 4 (index 3 of the full list).
   * The rank of each row is derived as: 4 + pageOffset + localIndex.
   */
  entries: LeaderboardEntry[];
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ entries }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const pageEntries = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return entries.slice(start, start + PAGE_SIZE);
  }, [entries, safeCurrentPage]);

  // Ranks are 1-based over the full list; this slice begins at rank 4.
  const rankOffset = 4 + (safeCurrentPage - 1) * PAGE_SIZE;

  if (entries.length === 0) {
    return (
      <EmptyState
        title="No more creators"
        description="Only the top 3 have tips so far. Check back as more creators join."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto border-2 border-black">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-black bg-black text-left text-white">
              <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.2em]">
                Rank
              </th>
              <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.2em]">
                Creator
              </th>
              <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.2em]">
                Total Tips
              </th>
              <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.2em]">
                Credit Score
              </th>
            </tr>
          </thead>
          <tbody>
            {pageEntries.map((entry, index) => (
              <LeaderboardRow
                key={entry.address}
                entry={entry}
                rank={rankOffset + index}
              />
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default LeaderboardTable;
