import Common "common";

module {
  public type ReelId = Common.ReelId;
  public type UserId = Common.UserId;

  public type SearchFilter = {
    #all;
    #users;
    #reels;
    #sounds;
    #hashtags;
  };

  public type HashtagResult = {
    tag : Text;
    reelCount : Nat;
  };

  public type SoundResult = {
    soundLabel : Text;
    reelCount : Nat;
  };

  public type SearchResults = {
    users : [UserId];
    reels : [ReelId];
    sounds : [SoundResult];
    hashtags : [HashtagResult];
  };
};
