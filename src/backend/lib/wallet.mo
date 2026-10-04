import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Types "../types/wallet";

module {
  public type Wallet = Types.Wallet;
  public type Transaction = Types.Transaction;
  public type WithdrawalRequest = Types.WithdrawalRequest;
  public type WalletError = Types.WalletError;

  public type WalletState = {
    wallets : Map.Map<Principal, Wallet>;
    transactions : Map.Map<Principal, List.List<Transaction>>;
    var nextTransactionId : Nat;
  };

  func referralCodeFor(user : Principal) : Text {
    let t = user.toText();
    let n = t.size();
    let start = if (n > 8) { n - 8 } else { 0 };
    let chars = t.toArray();
    let tail = chars.sliceToArray(start.toInt(), n.toInt());
    "ADX" # Text.fromArray(tail);
  };

  func ensureWallet(state : WalletState, caller : Principal) : Wallet {
    switch (state.wallets.get(caller)) {
      case (?w) { w };
      case null {
        let w : Wallet = {
          balance = 0;
          reelEarnings = 0;
          referralEarnings = 0;
          referralCode = referralCodeFor(caller);
        };
        state.wallets.add(caller, w);
        w;
      };
    };
  };

  func transactionList(state : WalletState, caller : Principal) : List.List<Transaction> {
    switch (state.transactions.get(caller)) {
      case (?l) { l };
      case null {
        let l = List.empty<Transaction>();
        state.transactions.add(caller, l);
        l;
      };
    };
  };

  public func getWallet(state : WalletState, caller : Principal) : Wallet {
    ensureWallet(state, caller);
  };

  public func listTransactions(state : WalletState, caller : Principal) : [Transaction] {
    let list = transactionList(state, caller);
    let arr = list.toArray();
    arr.sort(func(a, b) = if (a.createdAt > b.createdAt) { #less } else if (a.createdAt < b.createdAt) { #greater } else { #equal });
  };

  public func requestWithdrawal(
    state : WalletState,
    caller : Principal,
    request : WithdrawalRequest,
  ) : { #ok : Transaction; #err : WalletError } {
    if (request.amount == 0) {
      return #err(#invalidAmount);
    };
    let upi = request.upiId.trim(#char ' ');
    if (upi.size() == 0 or not upi.contains(#char '@')) {
      return #err(#invalidUpiId);
    };
    let wallet = ensureWallet(state, caller);
    if (request.amount > wallet.balance) {
      return #err(#insufficientBalance);
    };
    let id = state.nextTransactionId;
    state.nextTransactionId := id + 1;
    let tx : Transaction = {
      id;
      kind = #withdrawal;
      amount = request.amount;
      status = #pending;
      createdAt = Time.now();
    };
    transactionList(state, caller).add(tx);
    state.wallets.add(caller, { wallet with balance = wallet.balance - request.amount });
    #ok(tx);
  };

  public func creditReelBonus(state : WalletState, user : Principal, amount : Nat) : () {
    let wallet = ensureWallet(state, user);
    let id = state.nextTransactionId;
    state.nextTransactionId := id + 1;
    let tx : Transaction = {
      id;
      kind = #reelBonus;
      amount;
      status = #completed;
      createdAt = Time.now();
    };
    transactionList(state, user).add(tx);
    state.wallets.add(user, {
      wallet with
      balance = wallet.balance + amount;
      reelEarnings = wallet.reelEarnings + amount;
    });
  };

  public func creditReferralBonus(state : WalletState, user : Principal, amount : Nat) : () {
    let wallet = ensureWallet(state, user);
    let id = state.nextTransactionId;
    state.nextTransactionId := id + 1;
    let tx : Transaction = {
      id;
      kind = #referralBonus;
      amount;
      status = #completed;
      createdAt = Time.now();
    };
    transactionList(state, user).add(tx);
    state.wallets.add(user, {
      wallet with
      balance = wallet.balance + amount;
      referralEarnings = wallet.referralEarnings + amount;
    });
  };
};
