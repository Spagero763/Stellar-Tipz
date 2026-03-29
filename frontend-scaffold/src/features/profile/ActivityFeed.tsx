import { Gift } from 'lucide-react';
import React from 'react';

import TipCard from '@/components/shared/TipCard';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { useTips } from '@/hooks/useTips';
import Loader from '@/components/ui/Loader';

interface ActivityFeedProps {
  /** Creator address to filter tips for */
  address: string;
  /** Maximum number of tips to load per batch (default: 5) */
  limit?: number;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ address, limit = 5 }) => {
  const { tips, loading, error, loadMore, hasMore } = useTips(address, "creator", limit);

  if (loading && tips.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <Loader size="lg" text="Fetching activity..." />
      </div>
    );
  }

  if (tips.length === 0) {
    return (
      <EmptyState
        icon={<Gift size={32} />}
        title="No tips received yet"
        description={error || "Share your public profile link and your first supporter will appear here."}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* List of tips (newest first) */}
      <div className="grid gap-4 md:grid-cols-2">
        {tips.map((tip) => (
          <TipCard
            key={`${tip.from}-${tip.timestamp}`}
            tip={tip}
            showSender={true}
            showReceiver={false}
          />
        ))}
      </div>

      {/* Load More button */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={loadMore} loading={loading}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
