import { useState, useEffect, useCallback, useRef } from 'react';

import { useWalletStore } from '../store/walletStore';
import { useContract } from './useContract';
import { Profile, ContractStats, Tip } from '../types/contract';

const REFETCH_INTERVAL_MS = 30_000;

/**
 * Treats a contract error as "user not registered" so polling can pause
 * gracefully rather than spamming failed requests.
 */
const isNotRegisteredError = (err: unknown): boolean => {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.toLowerCase().includes('not found') ||
    msg.toLowerCase().includes('notfound') ||
    msg.toLowerCase().includes('not registered') ||
    msg.toLowerCase().includes('profile not found')
  );
};

export interface DashboardData {
  profile: Profile | null;
  tips: Tip[];
  stats: ContractStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Fetches all data required by the dashboard and keeps it fresh.
 *
 * Behaviour:
 * - Only fetches when the wallet is connected and the user is registered.
 * - Polls every 30 seconds for live-ish updates.
 * - Preserves the previous (stale) data while a background refetch is in
 *   progress so the UI never shows an empty state during polling (optimistic UI).
 * - `balance` is available via `profile.balance`.
 * - `feeInfo` is available via `stats.feeBps` and `stats.totalFeesCollected`.
 * - `tips` is stubbed as an empty array until a contract query endpoint is
 *   available (forward-compatible with future contract changes).
 */
export const useDashboard = (): DashboardData => {
  const { publicKey, connected } = useWalletStore();
  const { getProfile, getStats } = useContract();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [tips] = useState<Tip[]>([]);
  const [stats, setStats] = useState<ContractStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs avoid stale closure issues inside the polling callback.
  const hasDataRef = useRef(false);
  const isFetchingRef = useRef(false);
  // Tracks whether the user is registered so polling stops on unregistered wallets.
  const isRegisteredRef = useRef(true);

  const fetchDashboard = useCallback(async () => {
    if (!publicKey || !connected || isFetchingRef.current || !isRegisteredRef.current) return;

    isFetchingRef.current = true;
    // Only show the full spinner on the very first fetch (no cached data yet).
    if (!hasDataRef.current) {
      setLoading(true);
    }
    setError(null);

    try {
      const [fetchedProfile, fetchedStats] = await Promise.all([
        getProfile(publicKey),
        getStats(),
      ]);

      setProfile(fetchedProfile);
      setStats(fetchedStats);
      hasDataRef.current = true;
      isRegisteredRef.current = true;
    } catch (err) {
      if (isNotRegisteredError(err)) {
        // User is not registered — stop polling and clear stale data.
        isRegisteredRef.current = false;
        setProfile(null);
        setStats(null);
        hasDataRef.current = false;
      } else {
        // Network / contract failure — preserve stale data (optimistic UI).
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      }
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [publicKey, connected, getProfile, getStats]);

  // Initial fetch and cleanup when the connected wallet changes.
  useEffect(() => {
    if (publicKey && connected) {
      // Reset tracking refs whenever the wallet identity changes.
      isRegisteredRef.current = true;
      hasDataRef.current = false;
      setProfile(null);
      setStats(null);
      setError(null);
      fetchDashboard();
    } else {
      setProfile(null);
      setStats(null);
      setError(null);
      hasDataRef.current = false;
      isRegisteredRef.current = true;
    }
  }, [publicKey, connected]); // eslint-disable-line react-hooks/exhaustive-deps

  // Polling interval — 30 s for live-ish updates.
  useEffect(() => {
    if (!publicKey || !connected) return;

    const id = setInterval(() => {
      fetchDashboard();
    }, REFETCH_INTERVAL_MS);

    return () => clearInterval(id);
  }, [publicKey, connected, fetchDashboard]);

  const refetch = useCallback(() => {
    if (publicKey && connected) {
      // Re-enable polling in case it was stopped by a not-registered error.
      isRegisteredRef.current = true;
      fetchDashboard();
    }
  }, [publicKey, connected, fetchDashboard]);

  return { profile, tips, stats, loading, error, refetch };
};
