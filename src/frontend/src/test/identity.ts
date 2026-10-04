import type { Identity } from "@icp-sdk/core/agent";
import { Principal } from "@icp-sdk/core/principal";

/** Deterministic 29-byte principal bytes derived from a seed string. */
function principalBytes(seed: string): Uint8Array {
  const bytes = new Uint8Array(29);
  for (let i = 0; i < seed.length; i += 1) {
    bytes[i % 29] = (bytes[i % 29] + seed.charCodeAt(i) * (i + 1)) % 256;
  }
  // Avoid the all-zero (management canister) principal.
  bytes[0] = (bytes[0] || 1) % 256;
  return bytes;
}

/** A stable principal for a named test user. */
export function testPrincipal(seed: string): Principal {
  return Principal.fromUint8Array(principalBytes(seed));
}

/** A valid principal text for a named test user. */
export function testPrincipalText(seed: string): string {
  return testPrincipal(seed).toText();
}

/**
 * A minimal `Identity` whose principal is derived from a seed. The app only
 * calls `getPrincipal()`, so a full crypto identity is unnecessary.
 */
export function testIdentity(seed: string): Identity {
  const principal = testPrincipal(seed);
  return {
    getPrincipal: () => principal,
    transformRequest: (request: unknown) => request,
  } as unknown as Identity;
}
