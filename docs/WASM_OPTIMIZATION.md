# WASM Binary Size Optimization

This document describes the optimizations applied to reduce the WASM binary size for cheaper deployment and lower invocation costs.

## Current Optimizations

### 1. Cargo Release Profile (`contracts/Cargo.toml`)

```toml
[profile.release]
opt-level = "z"              # Optimize for size
overflow-checks = true       # Keep overflow checks for safety
debug = 0                    # No debug info
strip = "symbols"            # Strip symbols
debug-assertions = false     # Disable debug assertions
panic = "abort"              # Smaller panic handler
codegen-units = 1            # Better optimization (slower compile)
lto = true                   # Link-time optimization
```

### 2. Code-Level Optimizations

- **Minimal allocations**: Avoid unnecessary `Vec` cloning in hot paths
- **Efficient storage access**: Use direct storage reads where possible
- **String operations**: Use byte comparisons in validation where applicable
- **Leaderboard optimization**: Use slicing instead of cloning vectors

### 3. Size Threshold

Target: **< 64KB** (65,536 bytes)

The CI pipeline will fail if the WASM binary exceeds this threshold.

## Checking Binary Size

### Local Check

```bash
cd contracts
make size
```

### CI Check

The size check runs automatically in the CI pipeline after building the WASM binary.

## Analyzing Binary Size

To identify the largest functions in the WASM binary, use `twiggy`:

```bash
# Install twiggy
cargo install twiggy

# Build the WASM
cd contracts
cargo build --target wasm32-unknown-unknown --release

# Analyze top functions
twiggy top target/wasm32-unknown-unknown/release/tipz_contract.wasm

# Analyze dominators (what keeps each item alive)
twiggy dominators target/wasm32-unknown-unknown/release/tipz_contract.wasm

# Analyze paths (why something is included)
twiggy paths target/wasm32-unknown-unknown/release/tipz_contract.wasm <function_name>
```

## Future Optimization Opportunities

If the binary size grows beyond the threshold:

1. **Profile-guided optimization**: Use `cargo-pgo` for profile-guided optimization
2. **Feature flags**: Split optional functionality into feature flags
3. **Dependency audit**: Review and minimize dependencies
4. **Code deduplication**: Look for repeated patterns that can be abstracted
5. **Inline hints**: Add `#[inline(never)]` to large cold functions

## Baseline Measurements

Record baseline measurements here after each significant change:

| Date       | Version | Size (bytes) | Notes                               |
| ---------- | ------- | ------------ | ----------------------------------- |
| 2026-03-28 | 0.1.0   | TBD          | Initial measurement with get_config |
