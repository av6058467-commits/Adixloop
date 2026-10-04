import { BottomNav } from "@/components/BottomNav";
import { resetCoreMock, setSignedIn, setSignedOut } from "@/test/coreMock";
import { createMockActor, renderWithProviders } from "@/test/harness";
import { testIdentity } from "@/test/identity";
import { screen } from "@testing-library/react";
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

beforeEach(() => {
  resetCoreMock();
});

describe("BottomNav", () => {
  it("renders the five primary destinations and highlights the active tab", async () => {
    const actor = createMockActor({ getProfile: async () => null });
    setSignedIn(actor, testIdentity("viewer"));

    const { render } = renderWithProviders({
      component: BottomNav,
      path: "/discover",
      initialPath: "/discover",
    });
    render();

    expect(await screen.findByTestId("app.bottom_nav")).toBeInTheDocument();
    for (const label of ["Home", "Discover", "Create", "Inbox", "Profile"]) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }

    expect(screen.getByRole("link", { name: "Discover" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("routes protected tabs to sign-in for a signed-out visitor", async () => {
    setSignedOut();

    const { render } = renderWithProviders({
      component: BottomNav,
      initialPath: "/",
    });
    render();

    await screen.findByTestId("app.bottom_nav");
    // Home and Discover stay browsable; Create, Inbox, and Profile require auth.
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: "Discover" })).toHaveAttribute(
      "href",
      "/discover",
    );
    for (const label of ["Create", "Inbox", "Profile"]) {
      expect(screen.getByRole("link", { name: label })).toHaveAttribute(
        "href",
        "/login",
      );
    }
  });

  it("resolves the Profile tab to the signed-in user's profile", async () => {
    const actor = createMockActor({ getProfile: async () => null });
    const identity = testIdentity("viewer");
    setSignedIn(actor, identity);

    const { render } = renderWithProviders({
      component: BottomNav,
      initialPath: "/",
    });
    render();

    await screen.findByTestId("app.bottom_nav");
    // The Profile tab has no index route, so it points at the caller's own
    // profile rather than the bare /profile path.
    expect(screen.getByRole("link", { name: "Profile" })).toHaveAttribute(
      "href",
      `/profile/${identity.getPrincipal().toText()}`,
    );
  });
});
