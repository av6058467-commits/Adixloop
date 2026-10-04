import { Card } from "@/components/ui/card";
import { formatRupees } from "@/lib/format";
import { Sparkles, TrendingUp, Users } from "lucide-react";

interface BalanceCardProps {
  /** Total withdrawable balance in whole rupees. */
  balance: bigint;
  /** Lifetime earnings from reel bonuses. */
  reelEarnings: bigint;
  /** Lifetime earnings from referrals. */
  referralEarnings: bigint;
}

/**
 * Hero balance card. Total balance is the dominant figure on a neon gradient
 * surface; reel and referral earnings sit beneath as a two-up breakdown.
 */
export function BalanceCard({
  balance,
  reelEarnings,
  referralEarnings,
}: BalanceCardProps) {
  return (
    <Card
      data-ocid="wallet.balance_card"
      className="relative overflow-hidden rounded-2xl border-border bg-card p-5 shadow-elevated"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-20 size-52 rounded-full bg-primary/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-16 size-48 rounded-full bg-accent/15 blur-3xl"
      />

      <div className="relative">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Total balance
        </p>
        <p
          data-ocid="wallet.balance_value"
          className="mt-1 font-display text-4xl font-bold tracking-tight text-foreground"
        >
          {formatRupees(balance)}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div
            data-ocid="wallet.reel_earnings"
            className="rounded-xl border border-border bg-background/50 p-3"
          >
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <TrendingUp
                className="size-3.5 text-primary"
                aria-hidden="true"
              />
              <span className="text-[11px] font-medium uppercase tracking-wide">
                Reel earnings
              </span>
            </div>
            <p className="mt-1 font-display text-lg font-semibold text-foreground">
              {formatRupees(reelEarnings)}
            </p>
          </div>

          <div
            data-ocid="wallet.referral_earnings"
            className="rounded-xl border border-border bg-background/50 p-3"
          >
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="size-3.5 text-accent" aria-hidden="true" />
              <span className="text-[11px] font-medium uppercase tracking-wide">
                Referral earnings
              </span>
            </div>
            <p className="mt-1 font-display text-lg font-semibold text-foreground">
              {formatRupees(referralEarnings)}
            </p>
          </div>
        </div>

        <p className="mt-4 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
          Earn from every reel that gets watched and every friend who joins.
        </p>
      </div>
    </Card>
  );
}
