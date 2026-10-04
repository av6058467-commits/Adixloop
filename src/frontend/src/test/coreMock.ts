import type { Identity } from "@icp-sdk/core/agent";

/**
 * Mutable state backing the `@caffeineai/core-infrastructure` mock.
 *
 * `vi.mock` factories are hoisted above imports, so they cannot close over
 * test-local variables. They can, however, dynamically import this module and
 * read the shared object at call time — which lets each test set the actor and
 * auth state before rendering.
 */
export interface CoreMockState {
  actor: unknown;
  isFetching: boolean;
  identity: Identity | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoggingIn: boolean;
  login: () => void;
  clear: () => void;
}

export const coreMockState: CoreMockState = {
  actor: null,
  isFetching: false,
  identity: null,
  isAuthenticated: false,
  isInitializing: false,
  isLoggingIn: false,
  login: () => {},
  clear: () => {},
};

/** Reset the shared mock state to signed-out defaults. */
export function resetCoreMock(): void {
  coreMockState.actor = null;
  coreMockState.isFetching = false;
  coreMockState.identity = null;
  coreMockState.isAuthenticated = false;
  coreMockState.isInitializing = false;
  coreMockState.isLoggingIn = false;
  coreMockState.login = () => {};
  coreMockState.clear = () => {};
}

/** Configure the mock as a signed-in caller with the given actor. */
export function setSignedIn(actor: unknown, identity: Identity): void {
  coreMockState.actor = actor;
  coreMockState.identity = identity;
  coreMockState.isAuthenticated = true;
  coreMockState.isInitializing = false;
}

/** Configure the mock as a signed-out visitor. */
export function setSignedOut(): void {
  coreMockState.actor = null;
  coreMockState.identity = null;
  coreMockState.isAuthenticated = false;
  coreMockState.isInitializing = false;
}
