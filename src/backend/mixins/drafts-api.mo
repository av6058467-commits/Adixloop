import Principal "mo:core/Principal";
import Types "../types/drafts";
import DraftLib "../lib/drafts";

mixin (state : DraftLib.DraftState) {
  public shared ({ caller }) func saveDraft(
    draftId : ?Nat,
    input : Types.DraftInput,
  ) : async { #ok : Types.Draft; #err : Types.DraftError } {
    DraftLib.saveDraft(state, caller, draftId, input);
  };

  public query ({ caller }) func listDrafts() : async [Types.Draft] {
    DraftLib.listDrafts(state, caller);
  };

  public shared ({ caller }) func deleteDraft(
    draftId : Nat,
  ) : async { #ok : (); #err : Types.DraftError } {
    DraftLib.deleteDraft(state, caller, draftId);
  };
};
