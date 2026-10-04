import Common "common";

module {
  public type DraftId = Common.DraftId;
  public type UserId = Common.UserId;
  public type Timestamp = Common.Timestamp;
  public type Audience = Common.Audience;

  public type Draft = {
    id : DraftId;
    owner : UserId;
    mediaUrl : ?Text;
    thumbnailUrl : ?Text;
    caption : Text;
    hashtags : [Text];
    soundLabel : ?Text;
    location : ?Text;
    audience : Audience;
    allowComments : Bool;
    allowDuet : Bool;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  public type DraftInput = {
    mediaUrl : ?Text;
    thumbnailUrl : ?Text;
    caption : Text;
    hashtags : [Text];
    soundLabel : ?Text;
    location : ?Text;
    audience : Audience;
    allowComments : Bool;
    allowDuet : Bool;
  };

  public type DraftError = {
    #notFound;
    #notAuthorized;
  };
};
