import Common "common";

module {
  public type UserId = Common.UserId;
  public type ReelId = Common.ReelId;
  public type CommentId = Common.CommentId;
  public type Timestamp = Common.Timestamp;
  public type ActivityKind = Common.ActivityKind;

  public type Activity = {
    id : Nat;
    kind : ActivityKind;
    actorId : UserId;
    actorUsername : Text;
    actorDisplayName : Text;
    actorAvatarUrl : ?Text;
    reelId : ?ReelId;
    commentId : ?CommentId;
    preview : ?Text;
    createdAt : Timestamp;
  };
};
