import Map "mo:core/Map";
import List "mo:core/List";
import Set "mo:core/Set";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Types "../types/social";
import UserTypes "../types/users";

module {
  public type Comment = Types.Comment;
  public type CommentView = Types.CommentView;
  public type FollowState = Types.FollowState;
  public type SocialError = Types.SocialError;
  public type UserProfile = UserTypes.UserProfile;

  public type SocialState = {
    reelLikes : Map.Map<Nat, Set.Set<Principal>>;
    commentLikes : Map.Map<Nat, Set.Set<Principal>>;
    comments : Map.Map<Nat, Comment>;
    commentsByReel : Map.Map<Nat, List.List<Nat>>;
    followers : Map.Map<Principal, Set.Set<Principal>>;
    following : Map.Map<Principal, Set.Set<Principal>>;
    var nextCommentId : Nat;
  };

  func likeSet(state : SocialState, reelId : Nat) : Set.Set<Principal> {
    switch (state.reelLikes.get(reelId)) {
      case (?s) { s };
      case null {
        let s = Set.empty<Principal>();
        state.reelLikes.add(reelId, s);
        s;
      };
    };
  };

  func commentLikeSet(state : SocialState, commentId : Nat) : Set.Set<Principal> {
    switch (state.commentLikes.get(commentId)) {
      case (?s) { s };
      case null {
        let s = Set.empty<Principal>();
        state.commentLikes.add(commentId, s);
        s;
      };
    };
  };

  func followerSet(state : SocialState, user : Principal) : Set.Set<Principal> {
    switch (state.followers.get(user)) {
      case (?s) { s };
      case null {
        let s = Set.empty<Principal>();
        state.followers.add(user, s);
        s;
      };
    };
  };

  func followingSet(state : SocialState, user : Principal) : Set.Set<Principal> {
    switch (state.following.get(user)) {
      case (?s) { s };
      case null {
        let s = Set.empty<Principal>();
        state.following.add(user, s);
        s;
      };
    };
  };

  public func toggleReelLike(
    state : SocialState,
    caller : Principal,
    reelId : Nat,
  ) : { #ok : Bool; #err : SocialError } {
    let set = likeSet(state, reelId);
    if (set.contains(caller)) {
      set.remove(caller);
      #ok(false);
    } else {
      set.add(caller);
      #ok(true);
    };
  };

  public func reelLikeCount(state : SocialState, reelId : Nat) : Nat {
    switch (state.reelLikes.get(reelId)) {
      case (?s) { s.size() };
      case null { 0 };
    };
  };

  public func isReelLiked(state : SocialState, viewer : ?Principal, reelId : Nat) : Bool {
    switch (viewer) {
      case (?v) {
        switch (state.reelLikes.get(reelId)) {
          case (?s) { s.contains(v) };
          case null { false };
        };
      };
      case null { false };
    };
  };

  public func toggleCommentLike(
    state : SocialState,
    caller : Principal,
    commentId : Nat,
  ) : { #ok : Bool; #err : SocialError } {
    if (state.comments.get(commentId) == null) {
      return #err(#notFound);
    };
    let set = commentLikeSet(state, commentId);
    if (set.contains(caller)) {
      set.remove(caller);
      #ok(false);
    } else {
      set.add(caller);
      #ok(true);
    };
  };

  public func commentLikeCount(state : SocialState, commentId : Nat) : Nat {
    switch (state.commentLikes.get(commentId)) {
      case (?s) { s.size() };
      case null { 0 };
    };
  };

  public func isCommentLiked(state : SocialState, viewer : ?Principal, commentId : Nat) : Bool {
    switch (viewer) {
      case (?v) {
        switch (state.commentLikes.get(commentId)) {
          case (?s) { s.contains(v) };
          case null { false };
        };
      };
      case null { false };
    };
  };

  public func addComment(
    state : SocialState,
    caller : Principal,
    reelId : Nat,
    text : Text,
  ) : { #ok : Comment; #err : SocialError } {
    let id = state.nextCommentId;
    state.nextCommentId := id + 1;
    let comment : Comment = {
      id;
      reelId;
      author = caller;
      text;
      createdAt = Time.now();
    };
    state.comments.add(id, comment);
    let list = switch (state.commentsByReel.get(reelId)) {
      case (?l) { l };
      case null {
        let l = List.empty<Nat>();
        state.commentsByReel.add(reelId, l);
        l;
      };
    };
    list.add(id);
    #ok(comment);
  };

  public func listComments(state : SocialState, reelId : Nat) : [Comment] {
    let ids = switch (state.commentsByReel.get(reelId)) {
      case (?l) { l.toArray() };
      case null { [] };
    };
    let comments = List.empty<Comment>();
    for (id in ids.values()) {
      switch (state.comments.get(id)) {
        case (?c) { comments.add(c) };
        case null {};
      };
    };
    let arr = comments.toArray();
    arr.sort(func(a, b) = if (a.createdAt > b.createdAt) { #less } else if (a.createdAt < b.createdAt) { #greater } else { #equal });
  };

  public func commentCount(state : SocialState, reelId : Nat) : Nat {
    switch (state.commentsByReel.get(reelId)) {
      case (?l) { l.size() };
      case null { 0 };
    };
  };

  public func toCommentView(
    state : SocialState,
    viewer : ?Principal,
    comment : Comment,
    author : ?UserProfile,
  ) : CommentView {
    {
      id = comment.id;
      reelId = comment.reelId;
      author = comment.author;
      authorUsername = switch (author) { case (?a) { a.username }; case null { "" } };
      authorDisplayName = switch (author) { case (?a) { a.displayName }; case null { "" } };
      authorAvatarUrl = switch (author) { case (?a) { a.avatarUrl }; case null { null } };
      text = comment.text;
      likeCount = commentLikeCount(state, comment.id);
      isLiked = isCommentLiked(state, viewer, comment.id);
      createdAt = comment.createdAt;
    };
  };

  public func follow(
    state : SocialState,
    caller : Principal,
    target : Principal,
  ) : { #ok : FollowState; #err : SocialError } {
    if (caller == target) {
      return #err(#cannotFollowSelf);
    };
    followingSet(state, caller).add(target);
    followerSet(state, target).add(caller);
    #ok(followState(state, ?caller, target));
  };

  public func unfollow(
    state : SocialState,
    caller : Principal,
    target : Principal,
  ) : { #ok : FollowState; #err : SocialError } {
    if (caller == target) {
      return #err(#cannotFollowSelf);
    };
    followingSet(state, caller).remove(target);
    followerSet(state, target).remove(caller);
    #ok(followState(state, ?caller, target));
  };

  public func followState(
    state : SocialState,
    viewer : ?Principal,
    user : Principal,
  ) : FollowState {
    let followerCount = switch (state.followers.get(user)) {
      case (?s) { s.size() };
      case null { 0 };
    };
    let followingCount = switch (state.following.get(user)) {
      case (?s) { s.size() };
      case null { 0 };
    };
    let isFollowing = switch (viewer) {
      case (?v) {
        switch (state.following.get(v)) {
          case (?s) { s.contains(user) };
          case null { false };
        };
      };
      case null { false };
    };
    { followerCount; followingCount; isFollowing };
  };

  public func listFollowers(state : SocialState, user : Principal) : [Principal] {
    switch (state.followers.get(user)) {
      case (?s) { s.toArray() };
      case null { [] };
    };
  };

  public func listFollowing(state : SocialState, user : Principal) : [Principal] {
    switch (state.following.get(user)) {
      case (?s) { s.toArray() };
      case null { [] };
    };
  };

  public func followingOf(state : SocialState, user : Principal) : [Principal] {
    listFollowing(state, user);
  };
};
