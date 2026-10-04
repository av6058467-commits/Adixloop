import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { ChevronRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface SettingsRowBaseProps {
  /** Leading icon rendered inside a rounded tile. */
  icon: LucideIcon;
  /** Row label. */
  label: string;
  /** Optional supporting line under the label. */
  description?: string;
  /** Optional trailing text shown before the chevron (e.g. a value). */
  value?: string;
  /** Optional custom trailing node, overrides `value`. */
  trailing?: ReactNode;
  /** Deterministic test marker. */
  ocid?: string;
  /** Tint the icon tile with the neon-pink primary accent. */
  accent?: boolean;
}

interface SettingsLinkRowProps extends SettingsRowBaseProps {
  /** TanStack Router target. */
  to: string;
  /** Route params for dynamic segments (e.g. `/profile/$userId`). */
  params?: Record<string, string>;
}

interface SettingsToggleRowProps extends SettingsRowBaseProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

interface SettingsActionRowProps extends SettingsRowBaseProps {
  onClick: () => void;
  destructive?: boolean;
}

function RowShell({
  icon: Icon,
  label,
  description,
  value,
  trailing,
  ocid,
  accent = false,
  destructive = false,
  children,
}: SettingsRowBaseProps & {
  destructive?: boolean;
  children?: ReactNode;
}) {
  return (
    <div
      data-ocid={ocid}
      className="flex min-h-[3.25rem] items-center gap-3 px-3 py-2.5"
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-xl",
          destructive
            ? "bg-destructive/15 text-destructive"
            : accent
              ? "bg-primary/15 text-primary"
              : "bg-secondary text-secondary-foreground",
        )}
      >
        <Icon className="size-[1.15rem]" strokeWidth={2.1} />
      </span>

      <span className="flex min-w-0 flex-1 flex-col">
        <span
          className={cn(
            "truncate text-sm font-medium",
            destructive ? "text-destructive" : "text-foreground",
          )}
        >
          {label}
        </span>
        {description ? (
          <span className="truncate text-xs text-muted-foreground">
            {description}
          </span>
        ) : null}
      </span>

      {trailing ?? null}
      {value ? (
        <span className="shrink-0 text-xs text-muted-foreground">{value}</span>
      ) : null}
      {children}
    </div>
  );
}

/** Navigational settings row that routes to another screen. */
export function SettingsLinkRow({
  to,
  params,
  ...props
}: SettingsLinkRowProps) {
  return (
    <Link
      to={to}
      params={params}
      className="block rounded-2xl transition-smooth hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      <RowShell {...props}>
        <ChevronRight
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground"
        />
      </RowShell>
    </Link>
  );
}

/** Settings row with an inline switch control. */
export function SettingsToggleRow({
  checked,
  onCheckedChange,
  ...props
}: SettingsToggleRowProps) {
  return (
    <RowShell {...props}>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-label={props.label}
        data-ocid={props.ocid ? `${props.ocid}.switch` : undefined}
      />
    </RowShell>
  );
}

/** Settings row that triggers an action (e.g. logout). */
export function SettingsActionRow({
  onClick,
  destructive = false,
  ...props
}: SettingsActionRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full rounded-2xl text-left transition-smooth hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      <RowShell {...props} destructive={destructive}>
        <ChevronRight
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground"
        />
      </RowShell>
    </button>
  );
}
