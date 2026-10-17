import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

/**
 * Sign-in page. This repository currently uses Internet Identity.
 * Phone-number OTP and Google sign-in are not configured by this auth provider.
 */
export function LoginPage() {
  const navigate = useNavigate();
  const { auth } = useApp();
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.isAuthenticated) return;
    if (auth.needsProfile) {
      void navigate({ to: "/onboarding" });
    } else {
      void navigate({ to: "/" });
    }
  }, [auth.isAuthenticated, auth.needsProfile, navigate]);

  const handleLogin = () => {
    setLoginError(null);
    try {
      const result = auth.login();
      if (result && typeof (result as Promise<void>).catch === "function") {
        void (result as Promise<void>).catch((error: unknown) => {
          setLoginError(error instanceof Error ? error.message : "Sign-in failed. Please try again.");
        });
      }
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Sign-in failed. Please try again.");
    }
  };

  return (
    <Layout title="Sign in" hideNav back>
      <div data-ocid="login.page" className="flex flex-col items-center gap-6 py-10 text-center">
        <div className="relative flex size-20 items-center justify-center">
          <span aria-hidden="true" className="absolute inset-0 rounded-full bg-gradient-primary opacity-30 blur-2xl" />
          <span className="relative flex size-16 items-center justify-center rounded-full bg-gradient-primary font-display text-2xl font-bold text-primary-foreground">A</span>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Welcome to <span className="text-gradient-primary">AdixLoop</span>
          </h1>
          <p className="max-w-xs text-sm text-muted-foreground">
            Sign in to like, comment, post, and follow. Your feed stays open to browse either way.
          </p>
        </div>

        <Button
          type="button"
          data-ocid="login.signin_button"
          onClick={handleLogin}
          disabled={auth.isLoggingIn}
          className="h-11 w-full max-w-xs rounded-full bg-primary text-primary-foreground hover:opacity-90"
        >
          {auth.isLoggingIn ? "Signing in…" : "Sign in with Internet Identity"}
        </Button>

        {loginError ? (
          <p data-ocid="login.error" role="alert" className="max-w-xs text-sm text-destructive">
            {loginError}
          </p>
        ) : null}

        <p className="max-w-xs text-xs text-muted-foreground">
          Phone OTP and Google login require a separate authentication provider; they are not enabled in this repository yet.
        </p>

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
