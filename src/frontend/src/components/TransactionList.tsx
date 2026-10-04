import { TransactionKind, TransactionStatus } from "@/backend";
import type { Transaction } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatSignedRupees } from "@/lib/format";
import { ArrowDownLeft, Gift, Receipt, TrendingUp } from "lucide-react";
import type { ComponentType } from "react";

interface TransactionListProps {
  transactions: Array<Transaction>;
  isLoading?: boolean;
}

interface KindMeta {
  label: string;
  Icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  /** Positive amounts credit the wallet; withdrawals debit it. */
  credit: boolean;
}

const KIND_META: Record<TransactionKind, KindMeta> = {
  [TransactionKind.reelBonus]: {
    label: "Reel Bonus",
    Icon: TrendingUp,
    credit: true,
  },
  [TransactionKind.referralBonus]: {
    label: "Referral Bonus",
    Icon: Gift,
    credit: true,
  },
  [TransactionKind.withdrawal]: {
    label: "Withdrawal",
    Icon: ArrowDownLeft,
    credit: false,
  },
};

const STATUS_LABEL: Record<TransactionStatus, string> = {
  [TransactionStatus.pending]: "Pending",
  [TransactionStatus.completed]: "Completed",
  [TransactionStatus.failed]: "Failed",
};

function TransactionRow({
  transaction,
  index,
}: {
  transaction: Transaction;
  index: number;
}) {
  const meta = KIND_META[transaction.kind];
  const { Icon } = meta;
  const isCredit = meta.credit;
  const isPending = transaction.status === TransactionStatus.pending;

  return (
    <li
      data-ocid={`wallet.transaction.item.${index + 1}`}
      className="flex items-center gap-3 py-3"
    >
      <span
        className={
          isCredit
            ? "flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary"
            : "flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground"
        }
      >
        <Icon className="size-4" aria-hidden={true} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {meta.label}
        </p>
        <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatDate(transaction.createdAt)}</span>
          {isPending ? (
            <Badge
              variant="outline"
              className="rounded-full border-warning/40 px-1.5 py-0 text-[10px] font-medium text-warning"
            >
              {STATUS_LABEL[transaction.status]}
            </Badge>
          ) : null}
        </p>
      </div>

      <span
        className={
          isCredit
            ? "shrink-0 font-display text-sm font-semibold text-success"
            : "shrink-0 font-display text-sm font-semibold text-foreground"
        }
      >
        {formatSignedRupees(
          isCredit ? transaction.amount : -transaction.amount,
        )}
      </span>
    </li>
  );
}

/**
 * Transaction history. Renders a layout-matched skeleton while loading and a
 * helpful empty state when the wallet has no activity yet.
 */
export function TransactionList({
  transactions,
  isLoading = false,
}: TransactionListProps) {
  if (isLoading) {
    return (
      <div
        data-ocid="wallet.transactions.loading_state"
        className="space-y-3 py-2"
      >
        {Array.from({ length: 4 }, (_, i) => `tx-skeleton-${i}`).map((id) => (
          <div key={id} className="flex items-center gap-3">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-28 rounded-full" />
              <Skeleton className="h-3 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div
        data-ocid="wallet.transactions.empty_state"
        className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border px-6 py-10 text-center"
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <Receipt className="size-5" aria-hidden="true" />
        </span>
        <p className="font-display text-sm font-semibold text-foreground">
          No transactions yet
        </p>
        <p className="max-w-[16rem] text-xs text-muted-foreground">
          Reel bonuses, referral rewards, and withdrawals will appear here.
        </p>
      </div>
    );
  }

  return (
    <ul data-ocid="wallet.transactions.list" className="divide-y divide-border">
      {transactions.map((transaction, index) => (
        <TransactionRow
          key={transaction.id.toString()}
          transaction={transaction}
          index={index}
        />
      ))}
    </ul>
  );
}
