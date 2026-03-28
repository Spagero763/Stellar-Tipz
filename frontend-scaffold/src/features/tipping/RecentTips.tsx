import React, { useEffect, useState } from "react";
import { Clock, ExternalLink, Sparkles } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface Tip {
  id: string;
  tipperAddress: string;
  amount: string;       // e.g. "12.5 XLM"
  message?: string;
  timestamp: number;    // unix ms
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const truncateAddress = (addr: string) =>
  `${addr.slice(0, 6)}…${addr.slice(-4)}`;

const timeAgo = (ms: number): string => {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

// ---------------------------------------------------------------------------
// Mock data — replace with real contract fetch when deployed
// ---------------------------------------------------------------------------
const MOCK_TIPS: Tip[] = [
  { id: "1", tipperAddress: "GBXYZ...ABC1", amount: "25 XLM", message: "Keep up the great work!", timestamp: Date.now() - 2 * 60_000 },
  { id: "2", tipperAddress: "GABC...DEF2", amount: "10 XLM", message: "Loved your last post 🔥", timestamp: Date.now() - 15 * 60_000 },
  { id: "3", tipperAddress: "GDEF...GHI3", amount: "50 XLM", timestamp: Date.now() - 60 * 60_000 },
  { id: "4", tipperAddress: "GHIJ...JKL4", amount: "5 XLM", message: "Small tip, big love ❤️", timestamp: Date.now() - 3 * 60 * 60_000 },
  { id: "5", tipperAddress: "GKLM...MNO5", amount: "100 XLM", message: "You deserve it!", timestamp: Date.now() - 24 * 60 * 60_000 },
];

const fetchRecentTips = async (_creatorAddress: string): Promise<Tip[]> => {
  // TODO: replace with real contract call
  // e.g. const tips = await contract.getRecentTips(creatorAddress, 10);
  await new Promise((r) => setTimeout(r, 600)); // simulate network
  return MOCK_TIPS;
};

// ---------------------------------------------------------------------------
// TipCard
// ---------------------------------------------------------------------------
interface TipCardProps {
  tip: Tip;
}

const TipCard: React.FC<TipCardProps> = ({ tip }) => (
  <li className="flex items-start gap-3 rounded-xl border border-stellar-border bg-stellar-surface px-4 py-3 transition hover:border-stellar-accent/30 hover:bg-stellar-accent/5">
    {/* Avatar placeholder */}
    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stellar-accent/10 text-xs font-bold text-stellar-accent">
      {tip.tipperAddress.slice(1, 3).toUpperCase()}
    </div>

    <div className="min-w-0 flex-1">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs text-stellar-text">
          {truncateAddress(tip.tipperAddress)}
        </span>
        <span className="shrink-0 rounded-full bg-stellar-accent/10 px-2 py-0.5 text-xs font-semibold text-stellar-accent">
          {tip.amount}
        </span>
      </div>

      {tip.message && (
        <p className="mt-1 truncate text-sm text-stellar-muted">{tip.message}</p>
      )}

      <div className="mt-1 flex items-center gap-1 text-xs text-stellar-muted/60">
        <Clock className="h-3 w-3" />
        {timeAgo(tip.timestamp)}
      </div>
    </div>
  </li>
);

// ---------------------------------------------------------------------------
// RecentTips
// ---------------------------------------------------------------------------
export interface RecentTipsProps {
  creatorAddress: string;
  username?: string;   // for empty-state message
  viewAllHref?: string;
}

const MAX_SHOWN = 10;

const RecentTips: React.FC<RecentTipsProps> = ({
  creatorAddress,
  username = "this creator",
  viewAllHref = "#",
}) => {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchRecentTips(creatorAddress)
      .then((data) => { if (!cancelled) setTips(data); })
      .catch(() => { if (!cancelled) setError("Could not load tips."); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [creatorAddress]);

  const shown = tips.slice(0, MAX_SHOWN);
  const hasMore = tips.length > MAX_SHOWN;

  return (
    <section className="w-full">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-semibold text-stellar-text">
          <Sparkles className="h-4 w-4 text-stellar-accent" />
          Recent Tips
        </h2>
        {hasMore && (
          <a
            href={viewAllHref}
            className="flex items-center gap-1 text-xs font-medium text-stellar-accent hover:underline"
          >
            View All <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <ul className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <li
              key={i}
              className="h-16 animate-pulse rounded-xl border border-stellar-border bg-stellar-surface"
            />
          ))}
        </ul>
      )}

      {/* Error */}
      {!loading && error && (
        <p className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      {/* Empty state */}
      {!loading && !error && tips.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stellar-border px-6 py-12 text-center">
          <Sparkles className="mb-3 h-8 w-8 text-stellar-accent/40" />
          <p className="text-sm font-medium text-stellar-text">No tips yet</p>
          <p className="mt-1 text-xs text-stellar-muted">
            Be the first to tip @{username}!
          </p>
        </div>
      )}

      {/* Tip list */}
      {!loading && !error && shown.length > 0 && (
        <ul className="space-y-3">
          {shown.map((tip) => (
            <TipCard key={tip.id} tip={tip} />
          ))}
        </ul>
      )}
    </section>
  );
};

export default RecentTips;