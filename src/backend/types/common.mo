module {
  public type UserId = Principal;
  public type Timestamp = Int;
  public type ReelId = Nat;
  public type CommentId = Nat;
  public type TransactionId = Nat;
  public type DraftId = Nat;

  public type Audience = {
    #everyone;
    #followers;
  };

  public type TransactionKind = {
    #reelBonus;
    #referralBonus;
    #withdrawal;
  };

  public type TransactionStatus = {
    #pending;
    #completed;
    #failed;
  };

  public type ActivityKind = {
    #like;
    #comment;
    #follow;
    #mention;
  };
};
