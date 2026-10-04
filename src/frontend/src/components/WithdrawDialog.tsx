import { WalletError } from "@/backend";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRequestWithdrawal } from "@/hooks/useWallet";
import { formatRupees } from "@/lib/format";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";

interface WithdrawDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Current withdrawable balance in whole rupees. */
  balance: bigint;
}

const ERROR_COPY: Record<WalletError, string> = {
  [WalletError.insufficientBalance]: "Amount exceeds your available balance.",
  [WalletError.invalidUpiId]: "Enter a valid UPI ID, e.g. name@bank.",
  [WalletError.invalidAmount]: "Enter an amount greater than zero.",
};

/** Basic UPI ID shape: handle@provider. */
const UPI_PATTERN = /^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/;

/**
 * Withdrawal form. Collects a UPI ID and amount, validates locally, then calls
 * `requestWithdrawal`. On success it shows a confirmation and resets the draft.
 */
export function WithdrawDialog({
  open,
  onOpenChange,
  balance,
}: WithdrawDialogProps) {
  const [upiId, setUpiId] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);
  const withdrawal = useRequestWithdrawal();

  const parsedAmount = Number.parseInt(amount, 10);
  const amountValid = Number.isFinite(parsedAmount) && parsedAmount > 0;
  const upiValid = UPI_PATTERN.test(upiId.trim());
  const canSubmit = upiValid && amountValid && !withdrawal.isPending;

  function resetDraft() {
    setUpiId("");
    setAmount("");
    setError(null);
    setSucceeded(false);
  }

  function handleOpenChange(next: boolean) {
    if (!next) resetDraft();
    onOpenChange(next);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    const request = { upiId: upiId.trim(), amount: BigInt(parsedAmount) };
    setError(null);
    withdrawal.mutate(request, {
      onSuccess: (result) => {
        if (result.__kind__ === "ok") {
          setSucceeded(true);
          setUpiId("");
          setAmount("");
        } else {
          setError(ERROR_COPY[result.err]);
        }
      },
      onError: () => {
        setError("Something went wrong. Please try again.");
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        data-ocid="wallet.withdraw.dialog"
        className="rounded-2xl border-border bg-card sm:max-w-md"
      >
        {succeeded ? (
          <div
            data-ocid="wallet.withdraw.success_state"
            className="flex flex-col items-center gap-3 py-4 text-center"
          >
            <span className="flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
              <CheckCircle2 className="size-7" aria-hidden="true" />
            </span>
            <DialogTitle className="font-display text-lg font-semibold text-foreground">
              Withdrawal requested
            </DialogTitle>
            <DialogDescription className="max-w-[18rem] text-sm text-muted-foreground">
              Your request is pending. The amount will reach your UPI ID once
              it&apos;s processed.
            </DialogDescription>
            <Button
              type="button"
              data-ocid="wallet.withdraw.done_button"
              className="mt-2 rounded-full"
              onClick={() => handleOpenChange(false)}
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="font-display text-lg font-semibold text-foreground">
                Withdraw to UPI
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Available balance {formatRupees(balance)}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="withdraw-upi">UPI ID</Label>
                <Input
                  id="withdraw-upi"
                  data-ocid="wallet.withdraw.upi_input"
                  value={upiId}
                  onChange={(event) => setUpiId(event.target.value)}
                  placeholder="name@bank"
                  autoComplete="off"
                  spellCheck={false}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="withdraw-amount">Amount (₹)</Label>
                <Input
                  id="withdraw-amount"
                  data-ocid="wallet.withdraw.amount_input"
                  value={amount}
                  onChange={(event) =>
                    setAmount(event.target.value.replace(/[^0-9]/g, ""))
                  }
                  inputMode="numeric"
                  placeholder="0"
                  className="rounded-xl"
                />
              </div>

              {error ? (
                <p
                  data-ocid="wallet.withdraw.error_state"
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {error}
                </p>
              ) : null}
            </div>

            <DialogFooter className="mt-6 gap-2 sm:gap-2">
              <Button
                type="button"
                variant="ghost"
                data-ocid="wallet.withdraw.cancel_button"
                className="rounded-full"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                data-ocid="wallet.withdraw.submit_button"
                disabled={!canSubmit}
                className="rounded-full"
              >
                {withdrawal.isPending ? (
                  <>
                    <Loader2
                      className="size-4 animate-spin"
                      aria-hidden="true"
                    />
                    Requesting…
                  </>
                ) : (
                  "Request withdrawal"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
