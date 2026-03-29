.PHONY: build test fmt clippy wasm clean size check-size

# Build the contract
build:
	cargo build

# Run all tests
test:
	cargo test

# Check formatting
fmt:
	cargo fmt -- --check

# Run clippy linter
clippy:
	cargo clippy -- -D warnings

# Build optimized Wasm binary
wasm:
	cargo build --target wasm32-unknown-unknown --release

# Check WASM binary size
size: wasm
	@echo "=== WASM Binary Size Report ==="
	@ls -lh target/wasm32-unknown-unknown/release/*.wasm | awk '{print $$9 " : " $$5}'
	@echo ""
	@SIZE=$$(stat -c%s target/wasm32-unknown-unknown/release/tipz_contract.wasm 2>/dev/null || stat -f%z target/wasm32-unknown-unknown/release/tipz_contract.wasm 2>/dev/null); \
	echo "tipz_contract.wasm: $$SIZE bytes"; \
	if [ $$SIZE -gt 65536 ]; then \
		echo "❌ WASM binary exceeds 64KB threshold ($$SIZE bytes)"; \
		exit 1; \
	else \
		echo "✅ WASM binary is within 64KB threshold ($$SIZE bytes)"; \
	fi

# Check WASM size (alias for CI)
check-size: size

# Run all checks (CI equivalent)
check: fmt clippy test

# Clean build artifacts
clean:
	cargo clean
