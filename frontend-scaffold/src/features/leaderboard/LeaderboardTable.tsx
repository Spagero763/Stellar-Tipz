import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";

import AmountDisplay from "../../components/shared/AmountDisplay";
import CreditBadge from "../../components/shared/CreditBadge";
import Avatar from "../../components/ui/Avatar";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import { LeaderboardEntry } from "../../types/contract";

const PAGE_SIZE = 20;

// ---------------------------------------------------------------------------
// LeaderboardRow
// ---------------------------------------------------------------------------
// Exported so it can be reused if a dedicated LeaderboardRow file lands later.
export interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  rank: number;
}

export const LeaderboardRow: React.FC<LeaderboardRowProps> = ({ entry, rank }) => (
  <tr className="border-b-2 border-black bg-white transition-transform duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
    <td className="px-4 py-4 text-sm font-black tabular-nums">{rank}</td>
    <td className="px-4 py-4">
      <Link
        to={`/@${entry.username}`}
        className="flex items-center gap-3 hover:underline"
      >
        <Avatar
          address={entry.address}
          alt={entry.username}
          fallback={entry.username}
          size="md"
        />
        <span className="font-black uppercase">{entry.username}</span>
      </Link>
    </td>
    <td className="px-4 py-4">
      <AmountDisplay amount={entry.totalTipsReceived} className="text-sm" />
    </td>
    <td className="px-4 py-4">
      <CreditBadge score={entry.creditScore} />
    </td>
  </tr>
);

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
