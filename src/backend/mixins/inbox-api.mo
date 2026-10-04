import Principal "mo:core/Principal";
import Types "../types/inbox";
import InboxLib "../lib/inbox";

mixin (state : InboxLib.InboxState) {
  public query ({ caller }) func listActivity(
    kind : ?Types.ActivityKind,
  ) : async [Types.Activity] {
    InboxLib.list(state, caller, kind);
  };
};
