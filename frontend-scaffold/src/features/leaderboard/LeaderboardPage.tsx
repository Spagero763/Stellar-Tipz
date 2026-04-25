import React from "react";
import { Crown, Medal, Trophy } from "lucide-react";
import { Link } from "react-router-dom";

import PageContainer from "../../components/layout/PageContainer";
import AmountDisplay from "../../components/shared/AmountDisplay";
import CreditBadge from "../../components/shared/CreditBadge";
import Avatar from "../../components/ui/Avatar";
import Card from "../../components/ui/Card";
import VirtualList from "../../components/shared/VirtualList";
import ErrorState from "../../components/shared/ErrorState";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { categorizeError } from "@/helpers/error";
import LeaderboardSkeleton from "./LeaderboardSkeleton";


const PAGE_SIZE = 5;

const LeaderboardPage: React.FC = () => {
  usePageTitle('Leaderboard');

  const { entries, loading, error, refetch } = useLeaderboard();

  if (loading && entries.length === 0 && !error) {
    return <LeaderboardSkeleton count={PAGE_SIZE} />;
  }

  return (
    <PageContainer maxWidth="xl" className="space-y-8 py-10">
      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="space-y-5 bg-yellow-100" padding="lg" hover>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-gray-600">
            Leaderboard
          </p>
          <h1 className="flex items-center gap-3 text-4xl font-black uppercase">
            <Trophy size={34} />
            Top creators
          </h1>
          <p className="max-w-2xl text-base leading-7 text-gray-700">
            A real-time snapshot of creators earning the most support on Stellar Tipz. These rankings are fetched directly from the Tipz Soroban contract.
          </p>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          {error ? (
            <div className="sm:col-span-3">
              <ErrorState category={categorizeError(error).category} onRetry={refetch} />
            </div>
          ) : (
            entries.slice(0, 3).map((entry, index) => {
              const icons = [<Crown key="crown" size={18} />, <Medal key="silver" size={18} />, <Medal key="bronze" size={18} />];
              const labels = ["1st", "2nd", "3rd"];

              return (
                <Card key={entry.address} className="space-y-4" padding="lg" hover>
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 text-sm font-black uppercase">
                      {icons[index]}
                      {labels[index]}
                    </span>
                    <CreditBadge score={entry.creditScore} showScore={false} />
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar address={entry.address} alt={entry.username} fallback={entry.username} size="lg" />
                    <div>
                      <p className="text-lg font-black uppercase truncate max-w-[120px]">{entry.username}</p>
                      <AmountDisplay amount={entry.totalTipsReceived} className="text-sm" />
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </section>

      <section>
        <Card className="space-y-6" padding="lg">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-black uppercase">Full rankings</h2>
            <Link to="/dashboard" className="text-sm font-black uppercase underline">
              Open your dashboard
            </Link>
          </div>

          <div className="overflow-x-auto">
            {entries.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-black">
                <p className="font-black uppercase text-gray-500">No creators found on the leaderboard yet.</p>
              </div>
            ) : (
              <div className="min-w-[700px] w-full border-collapse">
                <div className="grid grid-cols-[100px_1fr_150px_150px] border-b-2 border-black text-left w-full pr-4">
                  <div className="px-4 py-3 text-xs font-black uppercase tracking-[0.2em]">Rank</div>
                  <div className="px-4 py-3 text-xs font-black uppercase tracking-[0.2em]">Creator</div>
                  <div className="px-4 py-3 text-xs font-black uppercase tracking-[0.2em]">Volume</div>
                  <div className="px-4 py-3 text-xs font-black uppercase tracking-[0.2em]">Credit</div>
                </div>
                <VirtualList
                  items={entries}
                  height={500}
                  estimateSize={64}
                  renderItem={(entry, index) => {
                    const rank = index + 1;
                    return (
                      <div className="grid grid-cols-[100px_1fr_150px_150px] border-b border-gray-300 hover:bg-gray-50 transition-colors h-full items-center">
                        <div className="px-4 text-sm font-black">{rank}</div>
                        <div className="px-4">
                          <Link to={`/@${entry.username}`} className="flex items-center gap-3 w-max">
                            <Avatar address={entry.address} alt={entry.username} fallback={entry.username} size="md" />
                            <span className="font-black uppercase">{entry.username}</span>
                          </Link>
                        </div>
                        <div className="px-4">
                          <AmountDisplay amount={entry.totalTipsReceived} className="text-sm" />
                        </div>
                        <div className="px-4">
                          <CreditBadge score={entry.creditScore} />
                        </div>
                      </div>
                    );
                  }}
                />
              </div>
            )}
          </div>
        </Card>
      </section>
    </PageContainer>
  );
};

export default LeaderboardPage;
