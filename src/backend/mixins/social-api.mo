import Principal "mo:core/Principal";
import Types "../types/social";
import SocialLib "../lib/social";
import UserLib "../lib/users";
import ReelLib "../lib/reels";
import InboxLib "../lib/inbox";

mixin (
  state : SocialLib.SocialState,
  userState : UserLib.UserState,
  reelState : ReelLib.ReelState,
  inboxState : InboxLib.InboxState,
) {
  func commentView(viewer : ?Principal, comment : Types.Comment) : Types.CommentView {
    SocialLib.toCommentView(state, viewer, comment, UserLib.getProfile(userState, comment.author));
  };

  func actorInfo(subject : Principal) : (Text, Text, ?Text) {
    switch (UserLib.getProfile(userState, subject)) {
      case (?p) { (p.username, p.displayName, p.avatarUrl) };
      case null { ("", "", null) };
    };
  };

  public shared ({ caller }) func toggleReelLike(
    reelId : Nat,
  ) : async { #ok : Bool; #err : Types.SocialError } {
    switch (ReelLib.getReel(reelState, reelId)) {
      case null { #err(#notFound) };
      case (?reel) {
        let result = SocialLib.toggleReelLike(state, caller, reelId);
        switch (result) {
          case (#ok(true)) {
            if (reel.creator != caller) {
              let (u, d, a) = actorInfo(caller);
              InboxLib.record(inboxState, reel.creator, #like, caller, u, d, a, ?reelId, null, null);
            };
          };
          case _ {};
        };
        result;
      };
    };
  };

  public query ({ caller }) func getReelLikeState(
    reelId : Nat,
  ) : async { likeCount : Nat; isLiked : Bool } {
    {
      likeCount = SocialLib.reelLikeCount(state, reelId);
      isLiked = SocialLib.isReelLiked(state, ?caller, reelId);
    };
  };

  public shared ({ caller }) func toggleCommentLike(
    commentId : Nat,
  ) : async { #ok : Bool; #err : Types.SocialError } {
    SocialLib.toggleCommentLike(state, caller, commentId);
  };

  public shared ({ caller }) func addComment(
    reelId : Nat,
    text : Text,
  ) : async { #ok : Types.CommentView; #err : Types.SocialError } {
    switch (ReelLib.getReel(reelState, reelId)) {
      case null { #err(#notFound) };
      case (?reel) {
        if (not reel.allowComments) {
          return #err(#notAuthorized);
        };
        switch (SocialLib.addComment(state, caller, reelId, text)) {
          case (#ok(comment)) {
            if (reel.creator != caller) {
              let (u, d, a) = actorInfo(caller);
              InboxLib.record(inboxState, reel.creator, #comment, caller, u, d, a, ?reelId, ?comment.id, ?text);
            };
            #ok(commentView(?caller, comment));
          };
          case (#err(e)) { #err(e) };
        };
      };
    };
  };

  public query ({ caller }) func listComments(reelId : Nat) : async [Types.CommentView] {
    SocialLib.listComments(state, reelId).map(func(c) = commentView(?caller, c));
  };

  public shared ({ caller }) func follow(
    user : Principal,
  ) : async { #ok : Types.FollowState; #err : Types.SocialError } {
    switch (SocialLib.follow(state, caller, user)) {
      case (#ok(fs)) {
        let (u, d, a) = actorInfo(caller);
        InboxLib.record(inboxState, user, #follow, caller, u, d, a, null, null, null);
        #ok(fs);
      };
      case (#err(e)) { #err(e) };
    };
  };

  public shared ({ caller }) func unfollow(
    user : Principal,
  ) : async { #ok : Types.FollowState; #err : Types.SocialError } {
    SocialLib.unfollow(state, caller, user);
  };

  public query ({ caller }) func getFollowState(user : Principal) : async Types.FollowState {
    SocialLib.followState(state, ?caller, user);
  };

  public query func listFollowers(user : Principal) : async [Principal] {
    SocialLib.listFollowers(state, user);
  };

  public query func listFollowing(user : Principal) : async [Principal] {
    SocialLib.listFollowing(state, user);
  };
};
