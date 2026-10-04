import type { backendInterface } from "@/backend";
import { AppProvider } from "@/context/AppContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { render as rtlRender } from "@testing-library/react";
import type { ReactNode } from "react";
import { vi } from "vitest";

/**
 * A typed stand-in for the generated backend actor. Every method is a Vitest
 * mock so tests can assert on the calls the UI makes and control the replies.
 */
export type MockActor = {
  [K in keyof backendInterface]: ReturnType<typeof vi.fn>;
};

/** Build a mock actor whose methods all resolve to `undefined` by default. */
export function createMockActor(
  overrides: Partial<Record<keyof backendInterface, unknown>> = {},
): MockActor {
  const actor = {} as MockActor;
  const keys: Array<keyof backendInterface> = [
    "_initialize_access_control",
    "_internet_identity_sign_in_finish",
    "_internet_identity_sign_in_start",
    "addComment",
    "assignCallerUserRole",
    "createProfile",
    "createReel",
    "deleteDraft",
    "execute",
    "follow",
    "getApiDoc",
    "getCallerUserRole",
    "getFollowState",
    "getProfile",
    "getProfileByUsername",
    "getReel",
    "getReelForCaller",
    "getReelLikeState",
    "getUserSummary",
    "getWallet",
    "isCallerAdmin",
    "listActivity",
    "listComments",
    "listDrafts",
    "listFollowers",
    "listFollowing",
    "listFollowingFeed",
    "listForYouFeed",
    "listReelsByUser",
    "listTransactions",
    "reelsByHashtag",
    "reelsBySound",
    "requestWithdrawal",
    "saveDraft",
    "schema",
    "search",
    "toggleCommentLike",
    "toggleReelLike",
    "trendingHashtags",
    "unfollow",
    "updateProfile",
  ];
  for (const key of keys) {
    const override = overrides[key];
    actor[key] = vi.fn(
      override === undefined ? async () => undefined : (override as never),
    ) as never;
  }
  return actor;
}

/** A fresh QueryClient with retries disabled so failures surface immediately. */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

interface HarnessOptions {
  /** Initial URL path, e.g. "/" or "/wallet". */
  initialPath?: string;
  /** Route search params, e.g. { reel: "1" }. */
  search?: Record<string, unknown>;
  /** The page component to mount at the root route. */
  component: () => ReactNode;
  /**
   * Route path to mount `component` at. Defaults to "/". Use a param path such
   * as "/profile/$userId" when the component reads `useParams`.
   */
  path?: string;
  /** Extra routes keyed by path, for navigation targets. */
  routes?: Array<{ path: string; component: () => ReactNode }>;
}

/**
 * Mount a page inside the providers it needs: React Query and a memory router
 * with the same route shapes the app declares. Returns the router so tests can
 * assert on the current location after navigation.
 */
export function renderWithProviders({
  initialPath = "/",
  component,
  path = "/",
  routes = [],
}: HarnessOptions) {
  const rootRoute = createRootRoute({ component: () => <Outlet /> });
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path,
    component,
    validateSearch: (input: Record<string, unknown>) => input,
  });
  const childRoutes = routes.map((route) =>
    createRoute({
      getParentRoute: () => rootRoute,
      path: route.path,
      component: route.component,
    }),
  );
  const routeTree = rootRoute.addChildren([indexRoute, ...childRoutes]);
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
  const queryClient = createTestQueryClient();

  return {
    router,
    queryClient,
    render: () =>
      rtlRender(
        <QueryClientProvider client={queryClient}>
          <AppProvider>
            <RouterProvider router={router} />
          </AppProvider>
        </QueryClientProvider>,
      ),
  };
}
