import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Types "../types/reels";
import UserTypes "../types/users";

module {
  public type Reel = Types.Reel;
  public type ReelView = Types.ReelView;
  public type CreateReelInput = Types.CreateReelInput;
  public type ReelError = Types.ReelError;
  public type UserProfile = UserTypes.UserProfile;

  public type ReelState = {
    reels : Map.Map<Nat, Reel>;
    byCreator : Map.Map<Principal, List.List<Nat>>;
    var nextReelId : Nat;
  };

  public func createReel(
    state : ReelState,
    caller : Principal,
    input : CreateReelInput,
  ) : { #ok : Reel; #err : ReelError } {
    let id = state.nextReelId;
    state.nextReelId := id + 1;
    let reel : Reel = {
      id;
      creator = caller;
      mediaUrl = input.mediaUrl;
      thumbnailUrl = input.thumbnailUrl;
      caption = input.caption;
      hashtags = input.hashtags;
      soundLabel = input.soundLabel;
      location = input.location;
      audience = input.audience;
      allowComments = input.allowComments;
      allowDuet = input.allowDuet;
      createdAt = Time.now();
    };
    state.reels.add(id, reel);
    let list = switch (state.byCreator.get(caller)) {
      case (?l) { l };
      case null {
        let l = List.empty<Nat>();
        state.byCreator.add(caller, l);
        l;
      };
    };
    list.add(id);
    #ok(reel);
  };

  public func getReel(state : ReelState, id : Nat) : ?Reel {
    state.reels.get(id);
  };

  public func listByCreator(state : ReelState, creator : Principal) : [Reel] {
    let ids = switch (state.byCreator.get(creator)) {
      case (?l) { l.toArray() };
      case null { [] };
    };
    let reels = List.empty<Reel>();
    for (id in ids.values()) {
      switch (state.reels.get(id)) {
        case (?r) { reels.add(r) };
        case null {};
      };
    };
    let arr = reels.toArray();
    arr.sort(func(a, b) = if (a.createdAt > b.createdAt) { #less } else if (a.createdAt < b.createdAt) { #greater } else { #equal });
  };

  public func listForYou(state : ReelState) : [Reel] {
    let all = state.reels.values().toArray();
    all.sort(func(a, b) = if (a.createdAt > b.createdAt) { #less } else if (a.createdAt < b.createdAt) { #greater } else { #equal });
  };

  public func listFollowing(
    state : ReelState,
    following : [Principal],
  ) : [Reel] {
    let reels = List.empty<Reel>();
    for (creator in following.values()) {
      switch (state.byCreator.get(creator)) {
        case (?ids) {
          for (id in ids.toArray().values()) {
            switch (state.reels.get(id)) {
              case (?r) { reels.add(r) };
              case null {};
            };
          };
        };
        case null {};
      };
    };
    let arr = reels.toArray();
    arr.sort(func(a, b) = if (a.createdAt > b.createdAt) { #less } else if (a.createdAt < b.createdAt) { #greater } else { #equal });
  };

  public func toView(
    state : ReelState,
    viewer : ?Principal,
    reel : Reel,
    creator : ?UserProfile,
    likeCount : Nat,
    commentCount : Nat,
    isLiked : Bool,
  ) : ReelView {
    ignore (state, viewer);
    {
      id = reel.id;
      creator = reel.creator;
      creatorUsername = switch (creator) { case (?c) { c.username }; case null { "" } };
      creatorDisplayName = switch (creator) { case (?c) { c.displayName }; case null { "" } };
      creatorAvatarUrl = switch (creator) { case (?c) { c.avatarUrl }; case null { null } };
      mediaUrl = reel.mediaUrl;
      thumbnailUrl = reel.thumbnailUrl;
      caption = reel.caption;
      hashtags = reel.hashtags;
      soundLabel = reel.soundLabel;
      location = reel.location;
      audience = reel.audience;
      allowComments = reel.allowComments;
      allowDuet = reel.allowDuet;
      likeCount;
      commentCount;
      isLiked;
      createdAt = reel.createdAt;
    };
  };
};
