import type { Transaction, Wallet } from "@/backend";
import { TransactionKind, TransactionStatus } from "@/backend";
import { WalletPage } from "@/pages/WalletPage";
import { resetCoreMock, setSignedIn } from "@/test/coreMock";
import { createMockActor, renderWithProviders } from "@/test/harness";
import { testIdentity } from "@/test/identity";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@caffeineai/core-infrastructure", async () => {
  const { coreMockState: state } = await import("@/test/coreMock");
  return {
    useActor: () => ({ actor: state.actor, isFetching: state.isFetching }),
    useInternetIdentity: () => ({
      identity: state.identity,
      isAuthenticated: state.isAuthenticated,
      isInitializing: state.isInitializing,
      isLoggingIn: state.isLoggingIn,
      login: state.login,
      clear: state.clear,
    }),
  };
});

const WALLET: Wallet = {
  balance: 1_200n,
  reelEarnings: 900n,
  referralEarnings: 300n,
  referralCode: "ADIX-42",
};

function transaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: 1n,
    kind: TransactionKind.reelBonus,
    status: TransactionStatus.completed,
    amount: 250n,
    createdAt: 1_700_000_000_000_000_000n,
    ...overrides,
  };
}

beforeEach(() => {
  resetCoreMock();
});

describe("WalletPage", () => {
  it("shows the balance, earnings breakdown, and transaction history", async () => {
    const actor = createMockActor({
      getProfile: async () => null,
      getWallet: async () => WALLET,
      listTransactions: async () => [
        transaction({ id: 1n, kind: TransactionKind.reelBonus, amount: 250n }),
        transaction({
          id: 2n,
          kind: TransactionKind.withdrawal,
          status: TransactionStatus.pending,
          amount: 100n,
        }),
      ],
    });
    setSignedIn(actor, testIdentity("viewer"));

    const { render } = renderWithProviders({ component: WalletPage });
    render();

    expect(await screen.findByText("₹1,200")).toBeInTheDocument();
    expect(screen.getByText("₹900")).toBeInTheDocument();
    expect(screen.getByText("₹300")).toBeInTheDocument();
    expect(screen.getByText("ADIX-42")).toBeInTheDocument();

    expect(await screen.findByText("Reel Bonus")).toBeInTheDocument();
    expect(screen.getByText("Withdrawal")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("+₹250")).toBeInTheDocument();
    expect(screen.getByText("-₹100")).toBeInTheDocument();
  });

  it("records a pending withdrawal transaction after a successful request", async () => {
    let transactions: Transaction[] = [];
    const actor = createMockActor({
      getProfile: async () => null,
      getWallet: async () => WALLET,
      listTransactions: async () => transactions,
      requestWithdrawal: async (request: { upiId: string; amount: bigint }) => {
        transactions = [
          transaction({
            id: 9n,
            kind: TransactionKind.withdrawal,
            status: TransactionStatus.pending,
            amount: request.amount,
          }),
          ...transactions,
        ];
        return { __kind__: "ok", ok: undefined };
      },
    });
    setSignedIn(actor, testIdentity("viewer"));

    const { render } = renderWithProviders({ component: WalletPage });
    render();

    await screen.findByText("₹1,200");
    await userEvent.click(
      screen.getByRole("button", { name: "Withdraw to UPI" }),
    );

    await userEvent.type(await screen.findByLabelText("UPI ID"), "viewer@bank");
    await userEvent.type(screen.getByLabelText("Amount (₹)"), "100");
    await userEvent.click(
      screen.getByRole("button", { name: "Request withdrawal" }),
    );

    await waitFor(() => {
      expect(actor.requestWithdrawal).toHaveBeenCalledWith({
        upiId: "viewer@bank",
        amount: 100n,
      });
    });
    expect(await screen.findByText("Withdrawal requested")).toBeInTheDocument();

    // The mutation invalidates the transaction query, so the new pending row
    // appears in the history without a reload.
    await userEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(await screen.findByText("Withdrawal")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("surfaces a backend rejection instead of a false success", async () => {
    const actor = createMockActor({
      getProfile: async () => null,
      getWallet: async () => WALLET,
      listTransactions: async () => [],
      requestWithdrawal: async () => ({
        __kind__: "err",
        err: "insufficientBalance",
      }),
    });
    setSignedIn(actor, testIdentity("viewer"));

    const { render } = renderWithProviders({ component: WalletPage });
    render();

    await screen.findByText("₹1,200");
    await userEvent.click(
      screen.getByRole("button", { name: "Withdraw to UPI" }),
    );
    await userEvent.type(await screen.findByLabelText("UPI ID"), "viewer@bank");
    await userEvent.type(screen.getByLabelText("Amount (₹)"), "5000");
    await userEvent.click(
      screen.getByRole("button", { name: "Request withdrawal" }),
    );

    expect(
      await screen.findByText("Amount exceeds your available balance."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Withdrawal requested")).not.toBeInTheDocument();
  });
});
