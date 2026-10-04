import { useEffect, useState } from "react";

/**
 * Branded splash screen shown on first load while the identity is restored.
 * Auto-advances to the app after a short beat (handled by AppShell).
 */
export function SplashScreen() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = window.requestAnimationFrame(() => setVisible(true));
    return () => window.cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      data-ocid="splash.page"
      className="flex min-h-dvh flex-col items-center justify-center bg-background"
    >
      <div
        className={`flex flex-col items-center gap-4 transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        <div className="relative flex size-24 items-center justify-center">
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-gradient-primary opacity-30 blur-2xl"
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 animate-pulse-ring rounded-full border-2 border-primary/60"
          />
          <span className="relative flex size-20 items-center justify-center rounded-full bg-gradient-primary font-display text-3xl font-bold text-primary-foreground shadow-elevated">
            A
          </span>
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          <span className="text-foreground">Adix</span>
          <span className="text-gradient-primary">Loop</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Short-form video, looped in neon.
        </p>
      </div>
    </div>
  );
}
