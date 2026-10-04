import type { Timestamp } from "@/backend";

/** Convert a Motoko nanosecond timestamp into a JS Date, or null if invalid. */
export function timestampToDate(timestamp: Timestamp): Date | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Compact relative time: "now", "5m", "3h", "2d", "4w", "1y". */
export function formatRelativeTime(timestamp: Timestamp): string {
  const date = timestampToDate(timestamp);
  if (!date) return "";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 45) return "now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w`;
  const years = Math.floor(days / 365);
  if (years >= 1) return `${years}y`;
  return `${Math.floor(days / 30)}mo`;
}

/** Short calendar date, e.g. "12 Jun 2026". */
export function formatDate(timestamp: Timestamp): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Compact count: 1.2K, 3.4M. */
export function formatCount(value: bigint | number): string {
  const n = typeof value === "bigint" ? Number(value) : value;
  if (n < 1000) return `${n}`;
  if (n < 1_000_000) {
    const k = n / 1000;
    return `${k >= 10 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, "")}K`;
  }
  const m = n / 1_000_000;
  return `${m >= 10 ? Math.round(m) : m.toFixed(1).replace(/\.0$/, "")}M`;
}

/** Indian rupee amount from a paise-free integer (backend stores whole rupees). */
export function formatRupees(amount: bigint | number): string {
  const n = typeof amount === "bigint" ? Number(amount) : amount;
  return `₹${n.toLocaleString("en-IN")}`;
}

/** Signed rupee amount for transaction rows, e.g. "+₹250" / "-₹1,200". */
export function formatSignedRupees(amount: bigint | number): string {
  const n = typeof amount === "bigint" ? Number(amount) : amount;
  const sign = n < 0 ? "-" : "+";
  return `${sign}₹${Math.abs(n).toLocaleString("en-IN")}`;
}

/** Initials for an avatar fallback. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/** Normalize a hashtag: strip leading #, lowercase, remove invalid chars. */
export function normalizeHashtag(tag: string): string {
  return tag.replace(/^#+/, "").trim().toLowerCase();
}
