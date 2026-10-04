import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Types "../types/inbox";

module {
  public type Activity = Types.Activity;
  public type ActivityKind = Types.ActivityKind;

  public type InboxState = {
    activities : Map.Map<Principal, List.List<Activity>>;
    var nextActivityId : Nat;
  };

  public func record(
    state : InboxState,
    recipient : Principal,
    kind : ActivityKind,
    actorPrincipal : Principal,
    actorUsername : Text,
    actorDisplayName : Text,
    actorAvatarUrl : ?Text,
    reelId : ?Nat,
    commentId : ?Nat,
    preview : ?Text,
  ) : () {
    let id = state.nextActivityId;
    state.nextActivityId := id + 1;
    let activity : Activity = {
      id;
      kind;
      actorId = actorPrincipal;
      actorUsername;
      actorDisplayName;
      actorAvatarUrl;
      reelId;
      commentId;
      preview;
      createdAt = Time.now();
    };
    let list = switch (state.activities.get(recipient)) {
      case (?l) { l };
      case null {
        let l = List.empty<Activity>();
        state.activities.add(recipient, l);
        l;
      };
    };
    list.add(activity);
  };

  public func list(
    state : InboxState,
    caller : Principal,
    kind : ?ActivityKind,
  ) : [Activity] {
    let all = switch (state.activities.get(caller)) {
      case (?l) { l.toArray() };
      case null { [] };
    };
    let filtered = List.empty<Activity>();
    for (a in all.values()) {
      let keep = switch (kind) {
        case (?k) {
          switch (a.kind, k) {
            case (#like, #like) { true };
            case (#comment, #comment) { true };
            case (#follow, #follow) { true };
            case (#mention, #mention) { true };
            case _ { false };
          };
        };
        case null { true };
      };
      if (keep) { filtered.add(a) };
    };
    let arr = filtered.toArray();
    arr.sort(func(a, b) = if (a.createdAt > b.createdAt) { #less } else if (a.createdAt < b.createdAt) { #greater } else { #equal });
  };
};
