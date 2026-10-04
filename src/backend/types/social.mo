import Common "common";

module {
  public type ReelId = Common.ReelId;
  public type CommentId = Common.CommentId;
  public type UserId = Common.UserId;
  public type Timestamp = Common.Timestamp;

  public type Comment = {
    id : CommentId;
    reelId : ReelId;
    author : UserId;
    text : Text;
    createdAt : Timestamp;
  };

  public type CommentView = {
    id : CommentId;
    reelId : ReelId;
    author : UserId;
    authorUsername : Text;
    authorDisplayName : Text;
    authorAvatarUrl : ?Text;
    text : Text;
    likeCount : Nat;
    isLiked : Bool;
    createdAt : Timestamp;
  };

  public type FollowState = {
    followerCount : Nat;
    followingCount : Nat;
    isFollowing : Bool;
  };

  public type SocialError = {
    #notFound;
    #notAuthorized;
    #cannotFollowSelf;
  };
};
