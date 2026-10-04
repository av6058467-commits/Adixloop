import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

/**
 * Sign-in page. Internet Identity sign-in; the feed stays browsable signed out.
 * After a successful login, first-time users are routed to onboarding.
 */
export function LoginPage() {
  const navigate = useNavigate();
  const { auth } = useApp();

  useEffect(() => {
    if (!auth.isAuthenticated) return;
    if (auth.needsProfile) {
      void navigate({ to: "/onboarding" });
    } else {
      void navigate({ to: "/" });
    }
  }, [auth.isAuthenticated, auth.needsProfile, navigate]);

  return (
    <Layout title="Sign in" hideNav back>
      <div
        data-ocid="login.page"
        className="flex flex-col items-center gap-6 py-10 text-center"
      >
        <div className="relative flex size-20 items-center justify-center">
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-gradient-primary opacity-30 blur-2xl"
          />
          <span className="relative flex size-16 items-center justify-center rounded-full bg-gradient-primary font-display text-2xl font-bold text-primary-foreground">
            A
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Welcome to <span className="text-gradient-primary">AdixLoop</span>
          </h1>
          <p className="max-w-xs text-sm text-muted-foreground">
            Sign in to like, comment, post, and follow. Your feed stays open to
            browse either way.
          </p>
        </div>

        <Button
          type="button"
          data-ocid="login.signin_button"
          onClick={auth.login}
          disabled={auth.isLoggingIn}
          className="h-11 w-full max-w-xs rounded-full bg-primary text-primary-foreground hover:opacity-90"
        >
          {auth.isLoggingIn ? "Signing in…" : "Sign in with Internet Identity"}
        </Button>

        <button
          type="button"
          data-ocid="login.browse_button"
          onClick={() => void navigate({ to: "/" })}
          className="text-sm font-medium text-accent underline-offset-4 hover:underline"
        >
          Continue browsing
        </button>
      </div>
    </Layout>
  );
}
