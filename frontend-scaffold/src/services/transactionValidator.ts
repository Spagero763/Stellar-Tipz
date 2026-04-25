import { Transaction, Networks, scValToNative, Address } from '@stellar/stellar-sdk';

export interface ValidationParams {
  expectedContractId: string;
  expectedFunction: string;
  expectedArgs?: Record<string, any>;
  networkPassphrase?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates a Stellar transaction's XDR against expected parameters to prevent
 * transaction modification attacks by a malicious wallet extension.
 * 
 * @param txXdr Base64 encoded transaction XDR
 * @param params Expected transaction parameters
 * @returns ValidationResult indicating if the transaction matches intent
 */
export function validateTransaction(
  txXdr: string,
  params: ValidationParams
): ValidationResult {
  const errors: string[] = [];
  const passphrase = params.networkPassphrase || Networks.TESTNET;

  try {
    const tx = new Transaction(txXdr, passphrase);
    const envelopeXdr = tx.toEnvelope().v1().tx();
    const operations = envelopeXdr.operations();

    if (operations.length === 0) {
      return { isValid: false, errors: ['Transaction contains no operations'] };
    }

    // Find the invokeHostFunction operation
    let invokeOp = null;
    for (const op of operations) {
      if (op.body().switch().name === 'invokeHostFunction') {
        invokeOp = op.body().invokeHostFunctionOp();
        break;
      }
    }

    if (!invokeOp) {
      return { isValid: false, errors: ['No smart contract invocation found in transaction'] };
    }

    const hostFunction = invokeOp.hostFunction();
    if (hostFunction.switch().name !== 'hostFunctionTypeInvokeContract') {
      return { isValid: false, errors: ['Host function is not a contract invocation'] };
    }

    const invokeContract = hostFunction.invokeContract();
    
    // 1. Verify Contract ID
    const contractAddress = invokeContract.contractAddress();
    const contractId = Address.fromScAddress(contractAddress).toString();
    
    if (contractId !== params.expectedContractId) {
      errors.push(`Contract ID mismatch. Expected: ${params.expectedContractId}, Got: ${contractId}`);
    }

    // 2. Verify Function Name
    const functionName = invokeContract.functionName().toString();
    if (functionName !== params.expectedFunction) {
      errors.push(`Function name mismatch. Expected: ${params.expectedFunction}, Got: ${functionName}`);
    }

    // 3. Verify Arguments (if specified)
    if (params.expectedArgs) {
      const args = invokeContract.args();
      const nativeArgs = args.map(arg => scValToNative(arg));
      
      // Basic argument matching. In a real app, this might need deeper equality checks
      // depending on how args are structured (e.g., Maps, Vecs).
      // Here we just ensure all expected args are present in the native args array.
      
      // Specifically for our Tipz contract: 
      // send_tip: creator, amount, message
      // withdraw_tips: amount
      // register_profile: username, displayName, bio, imageUrl, xHandle
      
      const expectedValues = Object.values(params.expectedArgs);
      
      for (let i = 0; i < expectedValues.length; i++) {
        const expected = expectedValues[i];
        let found = false;
        
        for (const nativeArg of nativeArgs) {
          // Compare strings, numbers, bigints, or nested structures
          if (typeof expected === 'bigint' || typeof nativeArg === 'bigint') {
            if (expected.toString() === nativeArg.toString()) found = true;
          } else if (JSON.stringify(expected) === JSON.stringify(nativeArg)) {
            found = true;
          } else if (expected === nativeArg) {
            found = true;
          }
        }
        
        if (!found) {
          errors.push(`Argument mismatch. Could not find expected argument: ${expected}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };

  } catch (error) {
    return {
      isValid: false,
      errors: [`Failed to parse or validate transaction: ${error instanceof Error ? error.message : String(error)}`]
    };
  }
}
