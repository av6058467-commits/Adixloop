import Common "common";

module {
  public type UserId = Common.UserId;
  public type Timestamp = Common.Timestamp;

  public type UserProfile = {
    id : UserId;
    username : Text;
    displayName : Text;
    bio : Text;
    avatarUrl : ?Text;
    createdAt : Timestamp;
  };

  public type UserSummary = {
    id : UserId;
    username : Text;
    displayName : Text;
    avatarUrl : ?Text;
    followerCount : Nat;
    followingCount : Nat;
    isFollowing : Bool;
  };

  public type ProfileUpdate = {
    displayName : ?Text;
    username : ?Text;
    bio : ?Text;
    avatarUrl : ?Text;
  };

  public type UserError = {
    #usernameTaken;
    #notFound;
    #notAuthorized;
    #invalidUsername;
  };
};
