import Types "../types/search";
import SearchLib "../lib/search";
import UserLib "../lib/users";
import ReelLib "../lib/reels";

mixin (state : SearchLib.SearchState, userState : UserLib.UserState, reelState : ReelLib.ReelState) {
  public query func search(
    filter : Types.SearchFilter,
    term : Text,
  ) : async Types.SearchResults {
    let users = userState.profiles.values().toArray();
    let reels = reelState.reels.values().toArray();
    SearchLib.search(state, filter, term, users, reels);
  };

  public query func trendingHashtags(limit : Nat) : async [Types.HashtagResult] {
    SearchLib.trendingHashtags(state, limit);
  };

  public query func reelsByHashtag(tag : Text) : async [Nat] {
    SearchLib.reelsByHashtag(state, tag);
  };

  public query func reelsBySound(soundLabel : Text) : async [Nat] {
    SearchLib.reelsBySound(state, soundLabel);
  };
};
