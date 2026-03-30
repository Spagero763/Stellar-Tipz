# Deployment Guide

> How to deploy the Stellar Tipz contract and frontend to Testnet and Mainnet.

---

## Prerequisites

- Soroban CLI installed (`soroban --version` → 21.0+)
- Rust + `wasm32-unknown-unknown` target
- A funded Stellar account (Testnet: use Friendbot; Mainnet: real XLM)
- Node.js 18+ (for frontend)
- Vercel CLI (optional, for frontend deployment)

---

## 1. Contract Deployment

### Build the Wasm Binary

```bash
cd contracts

# Run tests first
cargo test

# Build optimized release binary
cargo build --target wasm32-unknown-unknown --release

# The Wasm file will be at:
# target/wasm32-unknown-unknown/release/tipz.wasm
```

### Deploy to Testnet

```bash
# Generate a deploy key (one time)
soroban keys generate tipz-deployer --network testnet

# Fund it via Friendbot
curl "https://friendbot.stellar.org?addr=$(soroban keys address tipz-deployer)"

# Deploy
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/tipz.wasm \
  --source tipz-deployer \
  --network testnet

# Save the contract ID! Example output:
# CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
```

### Initialize the Contract

```bash
CONTRACT_ID="<your-contract-id>"
DEPLOYER_ADDR="$(soroban keys address tipz-deployer)"

soroban contract invoke \
  --id $CONTRACT_ID \
  --source tipz-deployer \
  --network testnet \
  -- \
  initialize \
  --admin $DEPLOYER_ADDR \
  --fee_collector $DEPLOYER_ADDR \
  --fee_bps 200 \
  --native_token <XLM_SAC_ADDRESS>
```

> **Note:** Replace `<XLM_SAC_ADDRESS>` with the Stellar Asset Contract address for native XLM on your target network. For testnet, you can obtain this from the Stellar laboratory or by wrapping native XLM.

### Verify Deployment

```bash
# Check contract stats
soroban contract invoke \
  --id $CONTRACT_ID \
  --source tipz-deployer \
  --network testnet \
  -- \
  get_stats
```

---

## 2. Frontend Deployment

### Environment Setup

Create `frontend-scaffold/.env`:

```env
CONTRACT_ID=<deployed-contract-id>
REACT_APP_NETWORK=TESTNET
```

### Build

```bash
cd frontend-scaffold
npm install --legacy-peer-deps
npm run build
```

The production build will be in `frontend-scaffold/build/`.

### Deploy to Vercel

The repo includes a `vercel.json` at the root:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (from repo root)
vercel

# Or deploy to production
vercel --prod
```

Vercel configuration in `vercel.json` handles:
- Build command: `cd frontend-scaffold && npm install --legacy-peer-deps && npm run build`
- Output directory: `frontend-scaffold/build`
- SPA rewrites: all routes → `index.html`

### Deploy via Docker (Alternative)

```bash
cd frontend-scaffold

# Build image
docker build -t stellar-tipz-frontend .

# Run locally
docker run -p 8080:80 stellar-tipz-frontend
```

---

## 3. Mainnet Deployment (Future)

> ⚠️ Mainnet deployment requires a security audit first.

### Additional Steps for Mainnet

1. **Security audit** — Third-party audit of the Soroban contract
2. **Config changes**:
   - Update `REACT_APP_NETWORK=PUBLIC`
   - Update RPC URL to mainnet
   - Update network passphrase to `Public Global Stellar Network ; September 2015`
3. **Real XLM** — Deployer account needs real XLM for deployment
4. **Admin key security** — Use a hardware wallet or multisig for the admin key
5. **Monitoring** — Set up event monitoring and alerting

---

## 4. Helper Scripts

Located in `scripts/`:

### `deploy-testnet.sh`

Full automated testnet deployment:

```bash
./scripts/deploy-testnet.sh
```

### `fund-account.sh`

Fund a testnet account:

```bash
./scripts/fund-account.sh <PUBLIC_KEY>
```

### `generate-bindings.sh`

Generate TypeScript bindings from the deployed contract:

```bash
./scripts/generate-bindings.sh <CONTRACT_ID>
```

---

## 5. Post-Deployment Checklist

- [ ] Contract deployed and initialized
- [ ] `get_stats()` returns expected initial values
- [ ] Test `register_profile()` with a test account
- [ ] Test `send_tip()` between two test accounts
- [ ] Test `withdraw_tips()` and verify fee deduction
- [ ] Frontend `.env` updated with contract ID
- [ ] Frontend builds successfully
- [ ] Frontend deployed and accessible
- [ ] Freighter wallet connects on deployed frontend
- [ ] End-to-end happy path works (register → tip → withdraw)
