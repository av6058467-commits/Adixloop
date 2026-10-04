import { Layout } from "@/components/Layout";
import {
  SettingsActionRow,
  SettingsLinkRow,
  SettingsToggleRow,
} from "@/components/SettingsRow";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Bookmark,
  ChevronRight,
  Database,
  Download,
  Globe,
  HelpCircle,
  Languages,
  Lock,
  LogOut,
  Moon,
  Palette,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
  UserRound,
  UserX,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const THEME_STORAGE_KEY = "adixloop-theme";

type Theme = "dark" | "light";

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" ? "light" : "dark";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

/** Settings menu with grouped rows, appearance toggle, and logout. */
export function SettingsPage() {
  const { auth } = useApp();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<Theme>(readStoredTheme);

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const handleLogout = useCallback(() => {
    auth.logout();
    void navigate({ to: "/" });
  }, [auth, navigate]);

  const isDark = theme === "dark";

  return (
    <Layout title="Settings">
      <div data-ocid="settings.page" className="flex flex-col gap-6 pb-4">
        {/* Account */}
        <section data-ocid="settings.section.account">
          <h2 className="mb-2 px-1 font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Account
          </h2>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <SettingsLinkRow
              to={auth.profile ? "/profile/$userId" : "/settings"}
              params={
                auth.profile ? { userId: auth.profile.id.toText() } : undefined
              }
              icon={UserRound}
              label="Account"
              description="Profile, username, and bio"
              ocid="settings.account"
            />
            <div className="mx-3 h-px bg-border" />
            <SettingsLinkRow
              to="/wallet"
              icon={Bookmark}
              label="Saved & Wallet"
              description="Saved reels and balance"
              ocid="settings.wallet"
            />
          </div>
        </section>

        {/* Privacy & Security */}
        <section data-ocid="settings.section.privacy">
          <h2 className="mb-2 px-1 font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Privacy & Security
          </h2>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <SettingsLinkRow
              to="/settings"
              icon={Lock}
              label="Privacy"
              description="Who can see and interact with you"
              ocid="settings.privacy"
            />
            <div className="mx-3 h-px bg-border" />
            <SettingsLinkRow
              to="/settings"
              icon={ShieldCheck}
              label="Security"
              description="Login activity and account safety"
              ocid="settings.security"
            />
            <div className="mx-3 h-px bg-border" />
            <SettingsLinkRow
              to="/settings"
              icon={UserX}
              label="Blocked Accounts"
              description="Manage people you've blocked"
              ocid="settings.blocked"
            />
          </div>
        </section>

        {/* Notifications */}
        <section data-ocid="settings.section.notifications">
          <h2 className="mb-2 px-1 font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Notifications
          </h2>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <SettingsLinkRow
              to="/settings"
              icon={Bell}
              label="Notifications"
              description="Likes, comments, and new followers"
              ocid="settings.notifications"
            />
          </div>
        </section>

        {/* Content Preferences */}
        <section data-ocid="settings.section.content">
          <h2 className="mb-2 px-1 font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Content
          </h2>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <SettingsLinkRow
              to="/settings"
              icon={SlidersHorizontal}
              label="Content Preferences"
              description="Tune the reels you see"
              ocid="settings.content_preferences"
            />
            <div className="mx-3 h-px bg-border" />
            <SettingsLinkRow
              to="/settings"
              icon={Languages}
              label="Language"
              value="English"
              ocid="settings.language"
            />
          </div>
        </section>

        {/* Appearance */}
        <section data-ocid="settings.section.appearance">
          <h2 className="mb-2 px-1 font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Appearance
          </h2>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <SettingsToggleRow
              icon={isDark ? Moon : Sun}
              label="Dark theme"
              description={
                isDark ? "Neon Nocturne is on" : "Switch to the dark canvas"
              }
              checked={isDark}
              onCheckedChange={(checked) =>
                setTheme(checked ? "dark" : "light")
              }
              ocid="settings.appearance"
              accent
            />
            <div className="mx-3 h-px bg-border" />
            <SettingsLinkRow
              to="/settings"
              icon={Palette}
              label="Theme & Accents"
              description="Neon pink and blue highlights"
              ocid="settings.theme_accents"
            />
          </div>
        </section>

        {/* Data & Storage */}
        <section data-ocid="settings.section.data">
          <h2 className="mb-2 px-1 font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Data & Storage
          </h2>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <SettingsLinkRow
              to="/settings"
              icon={Database}
              label="Data Usage"
              description="Control how much data reels use"
              ocid="settings.data_usage"
            />
            <div className="mx-3 h-px bg-border" />
            <SettingsLinkRow
              to="/settings"
              icon={Download}
              label="Downloads"
              description="Offline reels and saved media"
              ocid="settings.downloads"
            />
          </div>
        </section>

        {/* Help & Support */}
        <section data-ocid="settings.section.help">
          <h2 className="mb-2 px-1 font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Support
          </h2>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <SettingsLinkRow
              to="/settings"
              icon={HelpCircle}
              label="Help & Support"
              description="FAQs, reporting, and contact"
              ocid="settings.help"
            />
            <div className="mx-3 h-px bg-border" />
            <SettingsLinkRow
              to="/settings"
              icon={Globe}
              label="About AdixLoop"
              value="v1.0"
              ocid="settings.about"
            />
          </div>
        </section>

        {/* Logout */}
        {auth.isAuthenticated ? (
          <section data-ocid="settings.section.session">
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <SettingsActionRow
                icon={LogOut}
                label="Log out"
                description="Sign out of this device"
                onClick={handleLogout}
                destructive
                ocid="settings.logout_button"
              />
            </div>
          </section>
        ) : (
          <section data-ocid="settings.section.session">
            <Button
              type="button"
              className="h-11 w-full rounded-full font-semibold"
              data-ocid="settings.login_button"
              onClick={() => void navigate({ to: "/login" })}
            >
              Sign in
              <ChevronRight className="size-4" />
            </Button>
          </section>
        )}
      </div>
    </Layout>
  );
}
