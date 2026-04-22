import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Network = 'TESTNET' | 'PUBLIC';
type SigningStatus = 'idle' | 'signing' | 'signed' | 'error';

interface WalletState {
  publicKey: string | null;
  connected: boolean;
  connecting: boolean;
  isReconnecting: boolean;
  error: string | null;
  network: Network;
  walletType: string | null;
  signingStatus: SigningStatus;
}

interface WalletActions {
  connect: (publicKey: string, walletType?: string) => void;
  disconnect: () => void;
  setConnecting: (connecting: boolean) => void;
  setReconnecting: (isReconnecting: boolean) => void;
  setError: (error: string | null) => void;
  setNetwork: (network: Network) => void;
  setSigningStatus: (status: SigningStatus) => void;
}

type WalletStore = WalletState & WalletActions;

export const useWalletStore = create<WalletStore>()(
  persist(
    (set) => ({
      publicKey: null,
      connected: false,
      connecting: false,
      isReconnecting: false,
      error: null,
      network: 'TESTNET',
      walletType: null,
      signingStatus: 'idle',

      connect: (publicKey: string, walletType?: string) =>
        set({ publicKey, connected: true, connecting: false, isReconnecting: false, error: null, walletType: walletType ?? null }),

      disconnect: () =>
        set({ publicKey: null, connected: false, error: null, walletType: null, signingStatus: 'idle' }),

      setConnecting: (connecting: boolean) => set({ connecting }),

      setReconnecting: (isReconnecting: boolean) => set({ isReconnecting }),

      setError: (error: string | null) => set({ error, connecting: false, isReconnecting: false }),

      setNetwork: (network: Network) => set({ network }),

      setSigningStatus: (signingStatus: SigningStatus) => set({ signingStatus }),
    }),
    {
      name: 'tipz_wallet',
      // Only persist the fields needed for reconnection — not transient UI state
      partialize: (state) => ({
        walletType: state.walletType,
        network: state.network,
        publicKey: state.publicKey,
        connected: state.connected,
      }),
    },
  ),
);
