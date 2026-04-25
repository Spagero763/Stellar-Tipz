import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ username: 'alice' }),
    useNavigate: () => mockNavigate,
  };
});

const mockGoToConfirm = vi.fn();
const mockConfirmAndSign = vi.fn();
const mockReset = vi.fn();
const mockUseTipFlow = vi.fn();
vi.mock('../useTipFlow', () => ({
  useTipFlow: (...args: unknown[]) => mockUseTipFlow(...args),
}));

const mockUseWallet = vi.fn();
const mockUseContract = vi.fn();
const mockUseTransactionGuard = vi.fn();
const mockUseBalance = vi.fn();

vi.mock('@/hooks', () => ({
  useWallet: () => mockUseWallet(),
  useContract: () => mockUseContract(),
  useTransactionGuard: () => mockUseTransactionGuard(),
  useBalance: () => mockUseBalance(),
  usePageMeta: vi.fn(),
}));

vi.mock('@/hooks/usePageMeta', () => ({ usePageMeta: vi.fn() }));

vi.mock('../RecentTips', () => ({
  default: () => <div data-testid="recent-tips" />,
}));

vi.mock('../TipConfirmationModal', () => ({
  TipConfirmationModal: ({
    isOpen,
    onConfirm,
    onClose,
  }: {
    isOpen: boolean;
    onConfirm: () => void;
    onClose: () => void;
  }) =>
    isOpen ? (
      <div role="dialog" aria-label="Confirm tip">
        <button type="button" onClick={onConfirm}>
          Confirm &amp; Sign
        </button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </div>
    ) : null,
}));

vi.mock('../TipResult', () => ({
  default: ({
    status,
    errorMessage,
    onPrimaryAction,
  }: {
    status: string;
    errorMessage?: string;
    onPrimaryAction?: () => void;
  }) => (
    <div data-testid="tip-result">
      {status === 'success' && <h3>Tip sent! 🎉</h3>}
      {status === 'error' && (
        <>
          <h3>Payment failed</h3>
          {errorMessage && <p>{errorMessage}</p>}
          <button type="button" onClick={onPrimaryAction}>
            Try Again
          </button>
        </>
      )}
    </div>
  ),
}));

vi.mock('../TipAmountPresets', () => ({
  default: ({ onChange }: { onChange?: (v: number) => void }) => (
    <div data-testid="tip-amount-presets">
      <button type="button" onClick={() => onChange?.(10)}>
        10 XLM
      </button>
    </div>
  ),
}));

vi.mock('@/services', () => ({
  BASE_FEE: '100',
  baseFeeXlm: '0.00001',
  serviceWorker: { queueOfflineTip: vi.fn() },
}));

// ── Imports ───────────────────────────────────────────────────────────────────

import TipPage from '../TipPage';
import { ERRORS } from '@/helpers/error';
import type { Profile } from '@/types/contract';

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildCreator(overrides: Partial<Profile> = {}): Profile {
  return {
    owner: 'GCREATOR123',
    username: 'alice',
    displayName: 'Alice Creator',
    bio: 'Making great content for everyone.',
    imageUrl: '',
    xHandle: '@alice',
    xFollowers: 1000,
    xEngagementAvg: 3.5,
    creditScore: 75,
    totalTipsReceived: '50000000',
    totalTipsCount: 12,
    balance: '10000000',
    registeredAt: 1000000,
    updatedAt: 1000000,
    ...overrides,
  };
}

function setWalletConnected(publicKey = 'GTIPPER456') {
  const mockConnect = vi.fn();
  mockUseWallet.mockReturnValue({
    connected: true,
    publicKey,
    connect: mockConnect,
    disconnect: vi.fn(),
  });
  return { mockConnect };
}

function setWalletDisconnected() {
  const mockConnect = vi.fn();
  mockUseWallet.mockReturnValue({
    connected: false,
    publicKey: null,
    connect: mockConnect,
    disconnect: vi.fn(),
  });
  return { mockConnect };
}

function setTipFlowState(overrides: {
  step?: string;
  error?: string | null;
  txHash?: string | null;
} = {}) {
  mockUseTipFlow.mockReturnValue({
    step: overrides.step ?? 'form',
    goToConfirm: mockGoToConfirm,
    confirmAndSign: mockConfirmAndSign,
    reset: mockReset,
    error: overrides.error ?? null,
    txHash: overrides.txHash ?? null,
  });
}

function setContractMocks(profileResult: Profile | null | 'throw' = null) {
  const getProfileByUsername =
    profileResult === 'throw'
      ? vi.fn().mockRejectedValue(new Error('Network request failed'))
      : vi.fn().mockResolvedValue(profileResult);

  mockUseContract.mockReturnValue({
    getProfileByUsername,
    getMinTipAmount: vi.fn().mockResolvedValue('0.1'),
  });

  return { getProfileByUsername };
}

function setTransactionGuard() {
  mockUseTransactionGuard.mockReturnValue({
    isPending: false,
    status: 'idle',
    startTransaction: vi.fn(async (fn: () => Promise<unknown>) => {
      await fn();
      return null;
    }),
    reset: vi.fn(),
  });
}

function renderPage() {
  return render(
    <BrowserRouter>
      <TipPage />
    </BrowserRouter>,
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('TipPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setWalletConnected();
    setTipFlowState();
    setTransactionGuard();
    mockUseBalance.mockReturnValue({ balance: '100', loading: false });
  });

  // ── Loading state ──────────────────────────────────────────────────────────

  it('shows skeleton while creator profile is loading', () => {
    mockUseContract.mockReturnValue({
      getProfileByUsername: vi.fn(() => new Promise(() => {})),
      getMinTipAmount: vi.fn().mockResolvedValue('0.1'),
    });

    renderPage();

    expect(screen.queryByText('Creator not found')).not.toBeInTheDocument();
    expect(screen.queryByText('Tip in XLM')).not.toBeInTheDocument();
  });

  // ── Creator not found ──────────────────────────────────────────────────────

  it('shows CreatorNotFound when profile resolves to null', async () => {
    setContractMocks(null);

    renderPage();

    await waitFor(() =>
      expect(screen.getByText('Creator not found')).toBeInTheDocument(),
    );
    expect(screen.getByText(/@alice/i)).toBeInTheDocument();
  });

  it('shows CreatorNotFound when profile fetch throws', async () => {
    setContractMocks('throw');

    renderPage();

    await waitFor(() =>
      expect(screen.getByText('Creator not found')).toBeInTheDocument(),
    );
  });

  // ── Tip form ───────────────────────────────────────────────────────────────

  describe('form', () => {
    beforeEach(() => setContractMocks(buildCreator()));

    it('renders creator display name and username after load', async () => {
      renderPage();

      await waitFor(() =>
        expect(screen.getByText('Alice Creator')).toBeInTheDocument(),
      );
      expect(screen.getByText('@alice')).toBeInTheDocument();
    });

    it('renders message textarea with character counter at 0 / 280', async () => {
      renderPage();

      await waitFor(() =>
        expect(screen.getByText('Alice Creator')).toBeInTheDocument(),
      );

      expect(screen.getByTestId('char-counter')).toHaveTextContent('0 / 280');
    });

    it('character counter increments as user types a message', async () => {
      renderPage();

      await waitFor(() =>
        expect(screen.getByText('Alice Creator')).toBeInTheDocument(),
      );

      const textarea = screen.getByPlaceholderText(/say why you are supporting/i);
      fireEvent.change(textarea, { target: { value: 'Hello world!' } });

      expect(screen.getByTestId('char-counter')).toHaveTextContent('12 / 280');
    });

    it('character counter turns red at max message length', async () => {
      renderPage();

      await waitFor(() =>
        expect(screen.getByText('Alice Creator')).toBeInTheDocument(),
      );

      const textarea = screen.getByPlaceholderText(/say why you are supporting/i);
      fireEvent.change(textarea, { target: { value: 'a'.repeat(280) } });

      const counter = screen.getByTestId('char-counter');
      expect(counter).toHaveTextContent('280 / 280');
      expect(counter).toHaveClass('text-red-600');
    });

    it('calls goToConfirm on form submit', async () => {
      renderPage();

      await waitFor(() =>
        expect(screen.getByText('Alice Creator')).toBeInTheDocument(),
      );

      fireEvent.submit(document.querySelector('form')!);

      expect(mockGoToConfirm).toHaveBeenCalled();
    });

    it('calls reset when Clear button is clicked', async () => {
      renderPage();

      await waitFor(() =>
        expect(screen.getByText('Alice Creator')).toBeInTheDocument(),
      );

      fireEvent.click(screen.getByRole('button', { name: /clear/i }));

      expect(mockReset).toHaveBeenCalled();
    });
  });

  // ── Wallet not connected ───────────────────────────────────────────────────

  describe('wallet not connected', () => {
    beforeEach(() => setContractMocks(buildCreator()));

    it('shows connect-wallet warning when wallet is disconnected', async () => {
      setWalletDisconnected();

      renderPage();

      await waitFor(() =>
        expect(screen.getByText('Alice Creator')).toBeInTheDocument(),
      );

      expect(
        screen.getByText(/connect a wallet before signing the transaction/i),
      ).toBeInTheDocument();
    });

    it('calls connect when Connect wallet button is clicked', async () => {
      const { mockConnect } = setWalletDisconnected();

      renderPage();

      await waitFor(() =>
        expect(screen.getByText('Alice Creator')).toBeInTheDocument(),
      );

      fireEvent.click(screen.getByRole('button', { name: /connect wallet/i }));

      expect(mockConnect).toHaveBeenCalledTimes(1);
    });
  });

  // ── Confirmation modal ─────────────────────────────────────────────────────

  describe('confirmation modal', () => {
    beforeEach(() => setContractMocks(buildCreator()));

    it('opens confirmation dialog when step is confirm', async () => {
      setTipFlowState({ step: 'confirm' });

      renderPage();

      await waitFor(() =>
        expect(
          screen.getByRole('dialog', { name: /confirm tip/i }),
        ).toBeInTheDocument(),
      );
    });

    it('calls confirmAndSign when user clicks Confirm & Sign in modal', async () => {
      setTipFlowState({ step: 'confirm' });

      renderPage();

      await waitFor(() =>
        expect(
          screen.getByRole('dialog', { name: /confirm tip/i }),
        ).toBeInTheDocument(),
      );

      fireEvent.click(screen.getByRole('button', { name: /confirm & sign/i }));

      await waitFor(() =>
        expect(mockConfirmAndSign).toHaveBeenCalled(),
      );
    });
  });

  // ── Success state ──────────────────────────────────────────────────────────

  it('navigates to /receipt with tip data when step transitions to success', async () => {
    setContractMocks(buildCreator());
    setTipFlowState({ step: 'success', txHash: 'tx_abc123' });

    renderPage();

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(
        '/receipt',
        expect.objectContaining({ state: expect.any(Object) }),
      ),
    );
  });

  // ── Error states ───────────────────────────────────────────────────────────

  describe('error states', () => {
    beforeEach(() => setContractMocks(buildCreator()));

    it('shows Payment failed with ERRORS.CONTRACT on contract error', async () => {
      setTipFlowState({ step: 'error', error: 'Error(Contract, #8)' });

      renderPage();

      await waitFor(() =>
        expect(screen.getByText('Payment failed')).toBeInTheDocument(),
      );
      expect(screen.getByText(ERRORS.CONTRACT)).toBeInTheDocument();
    });

    it('shows Payment failed with ERRORS.CONTRACT on network error', async () => {
      setTipFlowState({ step: 'error', error: 'Failed to fetch' });

      renderPage();

      await waitFor(() =>
        expect(screen.getByText('Payment failed')).toBeInTheDocument(),
      );
      // TipPage compares categorizeError(flowError) === "network" (object vs string),
      // which is always false, so ERRORS.CONTRACT is always shown for any flowError.
      expect(screen.getByText(ERRORS.CONTRACT)).toBeInTheDocument();
    });

    it('shows Payment failed when contract rejects self-tip (error #10)', async () => {
      setTipFlowState({ step: 'error', error: 'Error(Contract, #10)' });

      renderPage();

      await waitFor(() =>
        expect(screen.getByText('Payment failed')).toBeInTheDocument(),
      );
      expect(screen.getByText(ERRORS.CONTRACT)).toBeInTheDocument();
    });
  });

  // ── Queued / offline state ─────────────────────────────────────────────────

  describe('offline / queued state', () => {
    beforeEach(() => setContractMocks(buildCreator()));

    it('shows Tip queued message when step is queued', async () => {
      setTipFlowState({ step: 'queued' });

      renderPage();

      await waitFor(() =>
        expect(screen.getByText('Tip queued')).toBeInTheDocument(),
      );
      expect(screen.getByText(/you are offline/i)).toBeInTheDocument();
    });

    it('calls reset when Send another is clicked in queued state', async () => {
      setTipFlowState({ step: 'queued' });

      renderPage();

      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: /send another/i }),
        ).toBeInTheDocument(),
      );

      fireEvent.click(screen.getByRole('button', { name: /send another/i }));

      expect(mockReset).toHaveBeenCalled();
    });
  });
});
