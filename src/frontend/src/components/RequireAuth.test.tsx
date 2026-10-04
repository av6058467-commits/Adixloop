import { RequireAuth } from "@/components/RequireAuth";
import { resetCoreMock, setSignedIn, setSignedOut } from "@/test/coreMock";
import { createMockActor, renderWithProviders } from "@/test/harness";
import { testIdentity } from "@/test/identity";
import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@caffeineai/core-infrastructure", async () => {
  const { coreMockState: state } = await import("@/test/coreMock");
  return {
    useActor: () => ({ actor: state.actor, isFetching: state.isFetching }),
    useInternetIdentity: () => ({
      identity: state.identity,
      isAuthenticated: state.isAuthenticated,
      isInitializing: state.isInitializing,
      isLoggingIn: state.isLoggingIn,
      login: state.login,
      clear: state.clear,
    }),
  };
});

function Protected() {
  return (
    <RequireAuth>
      <div data-ocid="protected.content">Secret wallet</div>
    </RequireAuth>
  );
}

beforeEach(() => {
  resetCoreMock();
});

describe("RequireAuth", () => {
  it("redirects a signed-out visitor to the sign-in route", async () => {
    setSignedOut();
    const { render, router } = renderWithProviders({
      component: Protected,
      routes: [{ path: "/login", component: () => <div>Login</div> }],
    });
    render();

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/login");
    });
    expect(screen.queryByText("Secret wallet")).not.toBeInTheDocument();
  });

  it("renders protected content for a signed-in user", async () => {
    const actor = createMockActor({
      getProfile: async () => null,
    });
    setSignedIn(actor, testIdentity("viewer"));

    const { render } = renderWithProviders({ component: Protected });
    render();

    expect(await screen.findByText("Secret wallet")).toBeInTheDocument();
  });
});
