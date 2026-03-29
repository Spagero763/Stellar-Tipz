import { useState, useEffect, useCallback, useRef } from 'react';
import { useContract } from './useContract';
import { Tip } from '../types/contract';
import { env } from '../helpers/env';
import { mockTips } from '../features/mockData';

export interface TipsData {
  tips: Tip[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  loadMore: () => void;
  hasMore: boolean;
}

/**
 * Hook for fetching paginated tip history for a creator or tipper.
 */
export const useTips = (address: string, role: 'creator' | 'tipper' = 'creator', limit = 10): TipsData => {
  const { getRecentTips, getCreatorTipCount, getTipsByTipper, getTipperTipCount } = useContract();
  
  const [tips, setTips] = useState<Tip[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);

  const isFetchingRef = useRef(false);

  const fetchTips = useCallback(async (isLoadMore = false) => {
    if (!address || isFetchingRef.current) return;

    // Mock fallback
    if (env.useMockData) {
      const filteredMocks = mockTips.filter(t => 
        role === 'creator' ? t.to === address : t.from === address
      );
      setTips(filteredMocks.slice(0, isLoadMore ? offset + limit : limit));
      setTotalCount(filteredMocks.length);
      setLoading(false);
      return;
    }

    isFetchingRef.current = true;
    if (!isLoadMore) setLoading(true);
    setError(null);

    try {
      const currentOffset = isLoadMore ? offset : 0;
      
      const [fetchedTips, count] = await Promise.all([
        role === 'creator' 
          ? getRecentTips(address, limit, currentOffset)
          : getTipsByTipper(address, limit), // Tipper pagination not fully supported by contract yet, assuming limit only for now
        role === 'creator'
          ? getCreatorTipCount(address)
          : getTipperTipCount(address)
      ]);

      if (isLoadMore) {
        setTips(prev => [...prev, ...fetchedTips]);
        setOffset(prev => prev + limit);
      } else {
        setTips(fetchedTips);
        setOffset(limit);
      }
      setTotalCount(count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tips');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [address, role, limit, offset, getRecentTips, getTipsByTipper, getCreatorTipCount, getTipperTipCount]);

  useEffect(() => {
    setTips([]);
    setOffset(0);
    fetchTips(false);
  }, [address, role]); // eslint-disable-line react-hooks/exhaustive-deps

  const refetch = useCallback(() => {
    setOffset(0);
    fetchTips(false);
  }, [fetchTips]);

  const loadMore = useCallback(() => {
    if (!loading && tips.length < totalCount) {
      fetchTips(true);
    }
  }, [loading, tips.length, totalCount, fetchTips]);

  const hasMore = tips.length < totalCount;

  return { tips, totalCount, loading, error, refetch, loadMore, hasMore };
};
