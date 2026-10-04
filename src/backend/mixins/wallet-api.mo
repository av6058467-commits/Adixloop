import Principal "mo:core/Principal";
import Types "../types/wallet";
import WalletLib "../lib/wallet";

mixin (state : WalletLib.WalletState) {
  public query ({ caller }) func getWallet() : async Types.Wallet {
    WalletLib.getWallet(state, caller);
  };

  public query ({ caller }) func listTransactions() : async [Types.Transaction] {
    WalletLib.listTransactions(state, caller);
  };

  public shared ({ caller }) func requestWithdrawal(
    request : Types.WithdrawalRequest,
  ) : async { #ok : Types.Transaction; #err : Types.WalletError } {
    WalletLib.requestWithdrawal(state, caller, request);
  };
};
