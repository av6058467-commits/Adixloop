import Common "common";

module {
  public type ReelId = Common.ReelId;
  public type UserId = Common.UserId;
  public type Timestamp = Common.Timestamp;
  public type Audience = Common.Audience;

  public type Reel = {
    id : ReelId;
    creator : UserId;
    mediaUrl : Text;
    thumbnailUrl : ?Text;
    caption : Text;
    hashtags : [Text];
    soundLabel : ?Text;
    location : ?Text;
    audience : Audience;
    allowComments : Bool;
    allowDuet : Bool;
    createdAt : Timestamp;
  };

  public type ReelView = {
    id : ReelId;
    creator : UserId;
    creatorUsername : Text;
    creatorDisplayName : Text;
    creatorAvatarUrl : ?Text;
    mediaUrl : Text;
    thumbnailUrl : ?Text;
    caption : Text;
    hashtags : [Text];
    soundLabel : ?Text;
    location : ?Text;
    audience : Audience;
    allowComments : Bool;
    allowDuet : Bool;
    likeCount : Nat;
    commentCount : Nat;
    isLiked : Bool;
    createdAt : Timestamp;
  };

  public type CreateReelInput = {
    mediaUrl : Text;
    thumbnailUrl : ?Text;
    caption : Text;
    hashtags : [Text];
    soundLabel : ?Text;
    location : ?Text;
    audience : Audience;
    allowComments : Bool;
    allowDuet : Bool;
  };

  public type ReelError = {
    #notFound;
    #notAuthorized;
    #commentsDisabled;
  };
};
