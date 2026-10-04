import { BalanceCard } from "@/components/BalanceCard";
import { Layout } from "@/components/Layout";
import { RequireAuth } from "@/components/RequireAuth";
import { TransactionList } from "@/components/TransactionList";
import { WithdrawDialog } from "@/components/WithdrawDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTransactions, useWallet } from "@/hooks/useWallet";
import { Check, Copy, Gift, Wallet as WalletIcon } from "lucide-react";
import { useState } from "react";

/** Wallet & earnings: balance, transaction history, withdrawals, referrals. */
export function WalletPage() {
  const wallet = useWallet();
  const transactions = useTransactions();
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const balance = wallet.data?.balance ?? 0n;
  const referralCode = wallet.data?.referralCode ?? "";

  async function handleCopy() {
    if (!referralCode) return;
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <RequireAuth>
      <Layout title="Wallet">
        <div data-ocid="wallet.page" className="space-y-5">
          {wallet.isLoading ? (
            <Skeleton
              data-ocid="wallet.balance.loading_state"
              className="h-52 w-full rounded-2xl"
            />
          ) : wallet.isError || !wallet.data ? (
            <Card
              data-ocid="wallet.error_state"
              className="flex flex-col items-center gap-3 rounded-2xl border-border bg-card px-6 py-10 text-center"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                <WalletIcon className="size-5" aria-hidden="true" />
              </span>
              <p className="font-display text-sm font-semibold text-foreground">
                Couldn&apos;t load your wallet
              </p>
              <Button
                type="button"
                variant="outline"
                data-ocid="wallet.retry_button"
                className="rounded-full"
                onClick={() => void wallet.refetch()}
              >
                Try again
              </Button>
            </Card>
          ) : (
            <>
              <BalanceCard
                balance={wallet.data.balance}
                reelEarnings={wallet.data.reelEarnings}
                referralEarnings={wallet.data.referralEarnings}
              />

              <Button
                type="button"
                data-ocid="wallet.withdraw.open_modal_button"
                className="h-11 w-full rounded-full font-display text-sm font-semibold"
                onClick={() => setWithdrawOpen(true)}
              >
                Withdraw to UPI
              </Button>
            </>
          )}

          <Card
            data-ocid="wallet.referral_card"
            className="rounded-2xl border-border bg-card p-4"
          >
            <div className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-full bg-accent/15 text-accent">
                <Gift className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="font-display text-sm font-semibold text-foreground">
                  Invite friends
                </p>
                <p className="text-xs text-muted-foreground">
                  Share your code and earn referral bonuses.
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <div className="flex min-w-0 flex-1 items-center rounded-xl border border-border bg-background/60 px-3 py-2">
                <span
                  data-ocid="wallet.referral_code"
                  className="truncate font-mono text-sm font-semibold tracking-wider text-foreground"
                >
                  {referralCode || "—"}
                </span>
              </div>
              <Button
                type="button"
                variant="secondary"
                data-ocid="wallet.copy_referral_button"
                className="shrink-0 rounded-full"
                disabled={!referralCode}
                onClick={() => void handleCopy()}
              >
                {copied ? (
                  <>
                    <Check className="size-4" aria-hidden="true" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="size-4" aria-hidden="true" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </Card>

          <section data-ocid="wallet.transactions.section">
            <h2 className="mb-1 font-display text-sm font-semibold text-foreground">
              Transactions
            </h2>
            <TransactionList
              transactions={transactions.data ?? []}
              isLoading={transactions.isLoading}
            />
          </section>
        </div>

        <WithdrawDialog
          open={withdrawOpen}
          onOpenChange={setWithdrawOpen}
          balance={balance}
        />
      </Layout>
    </RequireAuth>
  );
}
