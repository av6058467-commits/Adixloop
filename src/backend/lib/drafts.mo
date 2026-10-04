import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Types "../types/drafts";

module {
  public type Draft = Types.Draft;
  public type DraftInput = Types.DraftInput;
  public type DraftError = Types.DraftError;

  public type DraftState = {
    drafts : Map.Map<Nat, Draft>;
    byOwner : Map.Map<Principal, List.List<Nat>>;
    var nextDraftId : Nat;
  };

  public func saveDraft(
    state : DraftState,
    caller : Principal,
    draftId : ?Nat,
    input : DraftInput,
  ) : { #ok : Draft; #err : DraftError } {
    let now = Time.now();
    switch (draftId) {
      case (?id) {
        let existing = switch (state.drafts.get(id)) {
          case (?d) { d };
          case null { return #err(#notFound) };
        };
        if (existing.owner != caller) {
          return #err(#notAuthorized);
        };
        let updated : Draft = {
          id = existing.id;
          owner = existing.owner;
          mediaUrl = input.mediaUrl;
          thumbnailUrl = input.thumbnailUrl;
          caption = input.caption;
          hashtags = input.hashtags;
          soundLabel = input.soundLabel;
          location = input.location;
          audience = input.audience;
          allowComments = input.allowComments;
          allowDuet = input.allowDuet;
          createdAt = existing.createdAt;
          updatedAt = now;
        };
        state.drafts.add(id, updated);
        #ok(updated);
      };
      case null {
        let id = state.nextDraftId;
        state.nextDraftId := id + 1;
        let draft : Draft = {
          id;
          owner = caller;
          mediaUrl = input.mediaUrl;
          thumbnailUrl = input.thumbnailUrl;
          caption = input.caption;
          hashtags = input.hashtags;
          soundLabel = input.soundLabel;
          location = input.location;
          audience = input.audience;
          allowComments = input.allowComments;
          allowDuet = input.allowDuet;
          createdAt = now;
          updatedAt = now;
        };
        state.drafts.add(id, draft);
        let list = switch (state.byOwner.get(caller)) {
          case (?l) { l };
          case null {
            let l = List.empty<Nat>();
            state.byOwner.add(caller, l);
            l;
          };
        };
        list.add(id);
        #ok(draft);
      };
    };
  };

  public func listDrafts(state : DraftState, caller : Principal) : [Draft] {
    let ids = switch (state.byOwner.get(caller)) {
      case (?l) { l.toArray() };
      case null { [] };
    };
    let drafts = List.empty<Draft>();
    for (id in ids.values()) {
      switch (state.drafts.get(id)) {
        case (?d) { drafts.add(d) };
        case null {};
      };
    };
    let arr = drafts.toArray();
    arr.sort(func(a, b) = if (a.updatedAt > b.updatedAt) { #less } else if (a.updatedAt < b.updatedAt) { #greater } else { #equal });
  };

  public func deleteDraft(
    state : DraftState,
    caller : Principal,
    draftId : Nat,
  ) : { #ok : (); #err : DraftError } {
    let existing = switch (state.drafts.get(draftId)) {
      case (?d) { d };
      case null { return #err(#notFound) };
    };
    if (existing.owner != caller) {
      return #err(#notAuthorized);
    };
    state.drafts.remove(draftId);
    switch (state.byOwner.get(caller)) {
      case (?l) {
        let remaining = List.empty<Nat>();
        for (id in l.toArray().values()) {
          if (id != draftId) { remaining.add(id) };
        };
        state.byOwner.add(caller, remaining);
      };
      case null {};
    };
    #ok(());
  };
};
