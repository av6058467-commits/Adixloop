import Map "mo:core/Map";
import List "mo:core/List";
import Types "../types/search";
import ReelTypes "../types/reels";
import UserTypes "../types/users";

module {
  public type SearchFilter = Types.SearchFilter;
  public type HashtagResult = Types.HashtagResult;
  public type SoundResult = Types.SoundResult;
  public type SearchResults = Types.SearchResults;
  public type Reel = ReelTypes.Reel;
  public type UserProfile = UserTypes.UserProfile;

  public type SearchState = {
    hashtags : Map.Map<Text, List.List<Nat>>;
    sounds : Map.Map<Text, List.List<Nat>>;
  };

  func indexInto(
    index : Map.Map<Text, List.List<Nat>>,
    key : Text,
    reelId : Nat,
  ) : () {
    let list = switch (index.get(key)) {
      case (?l) { l };
      case null {
        let l = List.empty<Nat>();
        index.add(key, l);
        l;
      };
    };
    list.add(reelId);
  };

  public func indexReel(state : SearchState, reel : Reel) : () {
    for (tag in reel.hashtags.values()) {
      indexInto(state.hashtags, tag.toLower(), reel.id);
    };
    switch (reel.soundLabel) {
      case (?s) { indexInto(state.sounds, s.toLower(), reel.id) };
      case null {};
    };
  };

  public func search(
    state : SearchState,
    filter : SearchFilter,
    term : Text,
    users : [UserProfile],
    reels : [Reel],
  ) : SearchResults {
    let q = term.trim(#char ' ').toLower();
    let wantUsers = switch (filter) { case (#all) { true }; case (#users) { true }; case _ { false } };
    let wantReels = switch (filter) { case (#all) { true }; case (#reels) { true }; case _ { false } };
    let wantSounds = switch (filter) { case (#all) { true }; case (#sounds) { true }; case _ { false } };
    let wantHashtags = switch (filter) { case (#all) { true }; case (#hashtags) { true }; case _ { false } };

    let matchedUsers = List.empty<Principal>();
    if (wantUsers) {
      for (u in users.values()) {
        if (u.username.toLower().contains(#text q) or u.displayName.toLower().contains(#text q)) {
          matchedUsers.add(u.id);
        };
      };
    };

    let matchedReels = List.empty<Nat>();
    if (wantReels) {
      for (r in reels.values()) {
        var matches = r.caption.toLower().contains(#text q);
        if (not matches) {
          for (tag in r.hashtags.values()) {
            if (tag.toLower().contains(#text q)) { matches := true };
          };
        };
        if (not matches) {
          switch (r.soundLabel) {
            case (?s) { if (s.toLower().contains(#text q)) { matches := true } };
            case null {};
          };
        };
        if (matches) { matchedReels.add(r.id) };
      };
    };

    let matchedSounds = List.empty<SoundResult>();
    if (wantSounds) {
      for ((soundKey, ids) in state.sounds.entries()) {
        if (soundKey.contains(#text q)) {
          matchedSounds.add({ soundLabel = soundKey; reelCount = ids.size() });
        };
      };
    };

    let matchedHashtags = List.empty<HashtagResult>();
    if (wantHashtags) {
      for ((tag, ids) in state.hashtags.entries()) {
        if (tag.contains(#text q)) {
          matchedHashtags.add({ tag; reelCount = ids.size() });
        };
      };
    };

    {
      users = matchedUsers.toArray();
      reels = matchedReels.toArray();
      sounds = matchedSounds.toArray();
      hashtags = matchedHashtags.toArray();
    };
  };

  public func trendingHashtags(state : SearchState, limit : Nat) : [HashtagResult] {
    let all = List.empty<HashtagResult>();
    for ((tag, ids) in state.hashtags.entries()) {
      all.add({ tag; reelCount = ids.size() });
    };
    let arr = all.toArray();
    let sorted = arr.sort(func(a, b) =
      if (a.reelCount > b.reelCount) { #less }
      else if (a.reelCount < b.reelCount) { #greater }
      else { #equal }
    );
    if (sorted.size() <= limit) { sorted } else { sorted.sliceToArray(0, limit.toInt()) };
  };

  public func reelsByHashtag(state : SearchState, tag : Text) : [Nat] {
    switch (state.hashtags.get(tag.toLower())) {
      case (?l) { l.toArray() };
      case null { [] };
    };
  };

  public func reelsBySound(state : SearchState, soundLabel : Text) : [Nat] {
    switch (state.sounds.get(soundLabel.toLower())) {
      case (?l) { l.toArray() };
      case null { [] };
    };
  };
};
