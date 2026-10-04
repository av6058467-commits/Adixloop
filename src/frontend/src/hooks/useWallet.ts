import type { Transaction, Wallet, WithdrawalRequest } from "@/backend";
import { createActor } from "@/lib/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** Fetch the caller's wallet: balance, reel earnings, referral earnings, code. */
export function useWallet() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["wallet"],
    queryFn: async (): Promise<Wallet | null> => {
      if (!actor) return null;
      return actor.getWallet();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Fetch the caller's transaction history, newest first. */
export function useTransactions() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["transactions"],
    queryFn: async (): Promise<Array<Transaction>> => {
      if (!actor) return [];
      return actor.listTransactions();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Request a UPI withdrawal; records a pending withdrawal transaction. */
export function useRequestWithdrawal() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: WithdrawalRequest) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.requestWithdrawal(request);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["wallet"] });
      void queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
