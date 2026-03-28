import React from 'react';

import AmountDisplay from '@/components/shared/AmountDisplay';
import EmptyState from '@/components/ui/EmptyState';
import { mockTips } from '@/features/mockData';

const RecentTips: React.FC = () => {
  if (mockTips.length === 0) {
    return <EmptyState title="No recent tips" description="Recent tip activity will appear here." />;
  }

  return (
    <div className="space-y-3">
      {mockTips.slice(0, 3).map((tip) => (
        <div key={`${tip.from}-${tip.timestamp}`} className="border-2 border-black p-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Supporter note</p>
            <AmountDisplay amount={tip.amount} />
          </div>
          <p className="mt-3 text-sm font-medium text-gray-700">{tip.message || 'No message attached.'}</p>
        </div>
      ))}
    </div>
  );
};

export default RecentTips;
