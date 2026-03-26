import { useState, useCallback } from 'react';

export type TxStatus = 'idle' | 'signing' | 'submitting' | 'confirming' | 'success' | 'error';

interface TipState {
  sending: boolean;
  withdrawing: boolean;
  error: string | null;
  txHash: string | null;
  txStatus: TxStatus;
}

interface UseTipzReturn extends TipState {
  sendTip: (creator: string, amount: string, message: string) => Promise<void>;
  withdrawTips: (amount: string) => Promise<void>;
  reset: () => void;
}

const initialState: TipState = {
  sending: false,
  withdrawing: false,
  error: null,
  txHash: null,
  txStatus: 'idle',
};

export const useTipz = (): UseTipzReturn => {
  const [state, setState] = useState<TipState>(initialState);

  const sendTip = useCallback(async (creator: string, amount: string, message: string): Promise<void> => {
    setState({ ...initialState, sending: true, txStatus: 'signing' });
    try {
      setState((prev) => ({ ...prev, txStatus: 'submitting' }));
      // Signing and submission delegated to the caller via the wallet hook.
      // Placeholder for contract invocation wired in issue #71.
      void creator;
      void amount;
      void message;
      setState((prev) => ({ ...prev, txStatus: 'confirming' }));
      setState((prev) => ({ ...prev, sending: false, txStatus: 'success' }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send tip';
      setState((prev) => ({ ...prev, sending: false, error: message, txStatus: 'error' }));
    }
  }, []);

  const withdrawTips = useCallback(async (amount: string): Promise<void> => {
    setState({ ...initialState, withdrawing: true, txStatus: 'signing' });
    try {
      setState((prev) => ({ ...prev, txStatus: 'submitting' }));
      // Placeholder for contract invocation wired in issue #71.
      void amount;
      setState((prev) => ({ ...prev, txStatus: 'confirming' }));
      setState((prev) => ({ ...prev, withdrawing: false, txStatus: 'success' }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to withdraw tips';
      setState((prev) => ({ ...prev, withdrawing: false, error: message, txStatus: 'error' }));
    }
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return { ...state, sendTip, withdrawTips, reset };
};
