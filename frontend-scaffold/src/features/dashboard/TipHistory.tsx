import React, { useMemo, useState } from 'react';

import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import Table from '@/components/ui/Table';
import { truncateString } from '@/helpers/format';
import { mockTips } from '@/features/mockData';

type SortBy = 'date' | 'amount';
type DateRange = 'week' | 'month' | 'all';

const PAGE_SIZE = 20;

const rangeCutoff = (range: DateRange): number => {
  const now = Date.now();
  if (range === 'week') return now - 7 * 24 * 60 * 60 * 1000;
  if (range === 'month') return now - 30 * 24 * 60 * 60 * 1000;
  return 0;
};

const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const toCsv = (rows: Array<{ date: string; from: string; amount: string; message: string; txHash: string }>): string => {
  const headers = ['Date', 'From', 'Amount (XLM)', 'Message', 'TX Hash'];
  const escapeCell = (value: string): string => `"${value.replace(/"/g, '""')}"`;
  const body = rows.map((row) => [row.date, row.from, row.amount, row.message, row.txHash].map(escapeCell).join(','));
  return [headers.join(','), ...body].join('\n');
};

const TipHistory: React.FC = () => {
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [range, setRange] = useState<DateRange>('all');
  const [page, setPage] = useState(1);

  const filteredAndSorted = useMemo(() => {
    const cutoff = rangeCutoff(range);
    const filtered = mockTips.filter((tip) => (cutoff === 0 ? true : tip.timestamp >= cutoff));

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'amount') {
        return Number(b.amount) - Number(a.amount);
      }
      return b.timestamp - a.timestamp;
    });

    return sorted;
  }, [sortBy, range]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / PAGE_SIZE));

  const safePage = Math.min(page, totalPages);

  const pagedTips = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredAndSorted.slice(start, start + PAGE_SIZE);
  }, [filteredAndSorted, safePage]);

  const tableRows = pagedTips.map((tip) => {
    const txHash = `TX-${tip.timestamp.toString(16).toUpperCase()}`;
    return {
      date: formatDate(tip.timestamp),
      from: truncateString(tip.from),
      amount: (Number(tip.amount) / 1e7).toFixed(2),
      message: tip.message || 'No message',
      txHash: (
        <a
          href={`https://stellar.expert/explorer/public/tx/${txHash}`}
          target="_blank"
          rel="noreferrer"
          className="underline font-bold"
        >
          {truncateString(txHash)}
        </a>
      ),
      txHashRaw: txHash,
    };
  });

  const exportRows = tableRows.map((row) => ({
    date: row.date,
    from: row.from,
    amount: row.amount,
    message: row.message,
    txHash: row.txHashRaw,
  }));

  const handleExportCsv = () => {
    if (exportRows.length === 0) return;
    const csv = toCsv(exportRows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'tip-history.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={sortBy === 'date' ? 'primary' : 'outline'} onClick={() => setSortBy('date')}>
            Sort: Newest
          </Button>
          <Button size="sm" variant={sortBy === 'amount' ? 'primary' : 'outline'} onClick={() => setSortBy('amount')}>
            Sort: Amount
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={range === 'week' ? 'primary' : 'outline'} onClick={() => { setRange('week'); setPage(1); }}>
            This week
          </Button>
          <Button size="sm" variant={range === 'month' ? 'primary' : 'outline'} onClick={() => { setRange('month'); setPage(1); }}>
            This month
          </Button>
          <Button size="sm" variant={range === 'all' ? 'primary' : 'outline'} onClick={() => { setRange('all'); setPage(1); }}>
            All time
          </Button>
          <Button size="sm" variant="outline" onClick={handleExportCsv}>
            Export CSV
          </Button>
        </div>
      </div>

      {tableRows.length === 0 ? (
        <EmptyState title="No tips yet" description="Tip history appears here once supporters start sending tips." />
      ) : (
        <>
          <Table
            columns={[
              { key: 'date', label: 'Date' },
              { key: 'from', label: 'From' },
              { key: 'amount', label: 'Amount (XLM)', align: 'right' },
              { key: 'message', label: 'Message' },
              { key: 'txHash', label: 'TX Hash' },
            ]}
            data={tableRows}
          />
          <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

export default TipHistory;
