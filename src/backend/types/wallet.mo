import Common "common";

module {
  public type UserId = Common.UserId;
  public type TransactionId = Common.TransactionId;
  public type Timestamp = Common.Timestamp;
  public type TransactionKind = Common.TransactionKind;
  public type TransactionStatus = Common.TransactionStatus;

  public type Wallet = {
    balance : Nat;
    reelEarnings : Nat;
    referralEarnings : Nat;
    referralCode : Text;
  };

  public type Transaction = {
    id : TransactionId;
    kind : TransactionKind;
    amount : Nat;
    status : TransactionStatus;
    createdAt : Timestamp;
  };

  public type WithdrawalRequest = {
    upiId : Text;
    amount : Nat;
  };

  public type WalletError = {
    #insufficientBalance;
    #invalidAmount;
    #invalidUpiId;
  };
};
