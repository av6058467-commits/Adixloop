import OQL "mo:caffeineai-oql";

module {
  // OQL `_toRow` instance for `?Nat`: null renders as the 0 sentinel so the
  // column stays queryable and its schema type is stable.
  public func _toRow(self : ?Nat) : OQL.Value =
    switch self {
      case null { #nat(0) };
      case (?n) { #nat(n) };
    };
};
