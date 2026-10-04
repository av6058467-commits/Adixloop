import OQL "mo:caffeineai-oql";

module {
  // OQL `_toRow` instance for `?Text`: null renders as the empty-string
  // sentinel so the column stays queryable and its schema type is stable.
  public func _toRow(self : ?Text) : OQL.Value =
    switch self {
      case null { #text("") };
      case (?t) { #text(t) };
    };
};
