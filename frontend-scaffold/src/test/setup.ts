import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds = [];

  disconnect(): void {}

  observe(): void {}

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  unobserve(): void {}
}

if (!("IntersectionObserver" in window)) {
  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  });
}

const mockWalletKit = {
  openModal: vi.fn(),
  setWallet: vi.fn(),
  getAddress: vi.fn(),
  signTransaction: vi.fn(),
  closeModal: vi.fn(),
  disconnect: vi.fn(),
};

vi.mock("@creit.tech/stellar-wallets-kit", () => ({
  StellarWalletsKit: vi.fn(function MockStellarWalletsKit() {
    return mockWalletKit;
  }),
  WalletNetwork: {
    TESTNET: "TESTNET",
    PUBLIC: "PUBLIC",
  },
  FREIGHTER_ID: "freighter",
  FreighterModule: vi.fn(function MockFreighterModule() {}),
  AlbedoModule: vi.fn(function MockAlbedoModule() {}),
  xBullModule: vi.fn(function MockXBullModule() {}),
  __mockWalletKit: mockWalletKit,
}));

vi.mock("@stellar/stellar-sdk", () => ({
  Contract: vi.fn(),
  TimeoutInfinite: 0,
  nativeToScVal: vi.fn(),
  xdr: {},
  Networks: {
    TESTNET: "Test SDF Network ; September 2015",
    PUBLIC: "Public Global Stellar Network ; September 2015",
  },
}));
