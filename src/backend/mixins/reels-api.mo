import Principal "mo:core/Principal";
import Types "../types/reels";
import ReelLib "../lib/reels";
import UserLib "../lib/users";
import SocialLib "../lib/social";
import SearchLib "../lib/search";

mixin (
  state : ReelLib.ReelState,
  userState : UserLib.UserState,
  socialState : SocialLib.SocialState,
  searchState : SearchLib.SearchState,
) {
  func reelView(viewer : ?Principal, reel : Types.Reel) : Types.ReelView {
    let creator = UserLib.getProfile(userState, reel.creator);
    ReelLib.toView(
      state,
      viewer,
      reel,
      creator,
      SocialLib.reelLikeCount(socialState, reel.id),
      SocialLib.commentCount(socialState, reel.id),
      SocialLib.isReelLiked(socialState, viewer, reel.id),
    );
  };

  public shared ({ caller }) func createReel(
    input : Types.CreateReelInput,
  ) : async { #ok : Types.Reel; #err : Types.ReelError } {
    switch (ReelLib.createReel(state, caller, input)) {
      case (#ok(reel)) {
        SearchLib.indexReel(searchState, reel);
        #ok(reel);
      };
      case (#err(e)) { #err(e) };
    };
  };

  public query func getReel(id : Nat) : async ?Types.ReelView {
    switch (ReelLib.getReel(state, id)) {
      case (?reel) { ?reelView(null, reel) };
      case null { null };
    };
  };

  public query ({ caller }) func getReelForCaller(id : Nat) : async ?Types.ReelView {
    switch (ReelLib.getReel(state, id)) {
      case (?reel) { ?reelView(?caller, reel) };
      case null { null };
    };
  };

  public query ({ caller }) func listReelsByUser(user : Principal) : async [Types.ReelView] {
    ReelLib.listByCreator(state, user).map(func(r) = reelView(?caller, r));
  };

  public query ({ caller }) func listForYouFeed() : async [Types.ReelView] {
    ReelLib.listForYou(state).map(func(r) = reelView(?caller, r));
  };

  public query ({ caller }) func listFollowingFeed() : async [Types.ReelView] {
    let following = SocialLib.followingOf(socialState, caller);
    ReelLib.listFollowing(state, following).map(func(r) = reelView(?caller, r));
  };
};
