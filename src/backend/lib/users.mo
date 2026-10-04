import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Types "../types/users";

module {
  public type UserProfile = Types.UserProfile;
  public type UserSummary = Types.UserSummary;
  public type ProfileUpdate = Types.ProfileUpdate;
  public type UserError = Types.UserError;

  public type UserState = {
    profiles : Map.Map<Principal, UserProfile>;
    usernames : Map.Map<Text, Principal>;
    var nextActivityId : Nat;
  };

  func normalizeUsername(username : Text) : Text {
    username.trim(#char ' ').toLower();
  };

  func isValidUsername(username : Text) : Bool {
    let n = username.size();
    if (n < 3 or n > 30) { return false };
    var ok = true;
    for (c in username.toIter()) {
      let isLower = c >= 'a' and c <= 'z';
      let isUpper = c >= 'A' and c <= 'Z';
      let isDigit = c >= '0' and c <= '9';
      let isUnderscore = c == '_';
      let isDot = c == '.';
      if (not (isLower or isUpper or isDigit or isUnderscore or isDot)) {
        ok := false;
      };
    };
    ok;
  };

  public func createProfile(
    state : UserState,
    caller : Principal,
    username : Text,
    displayName : Text,
    bio : Text,
    avatarUrl : ?Text,
  ) : { #ok : UserProfile; #err : UserError } {
    if (state.profiles.get(caller) != null) {
      return #err(#usernameTaken);
    };
    let normalized = normalizeUsername(username);
    if (not isValidUsername(normalized)) {
      return #err(#invalidUsername);
    };
    if (state.usernames.get(normalized) != null) {
      return #err(#usernameTaken);
    };
    let profile : UserProfile = {
      id = caller;
      username = normalized;
      displayName;
      bio;
      avatarUrl;
      createdAt = Time.now();
    };
    state.profiles.add(caller, profile);
    state.usernames.add(normalized, caller);
    #ok(profile);
  };

  public func getProfile(state : UserState, user : Principal) : ?UserProfile {
    state.profiles.get(user);
  };

  public func getProfileByUsername(state : UserState, username : Text) : ?UserProfile {
    switch (state.usernames.get(normalizeUsername(username))) {
      case (?id) { state.profiles.get(id) };
      case null { null };
    };
  };

  public func updateProfile(
    state : UserState,
    caller : Principal,
    update : ProfileUpdate,
  ) : { #ok : UserProfile; #err : UserError } {
    let existing = switch (state.profiles.get(caller)) {
      case (?p) { p };
      case null { return #err(#notFound) };
    };
    let newUsername = switch (update.username) {
      case (?u) {
        let normalized = normalizeUsername(u);
        if (not isValidUsername(normalized)) {
          return #err(#invalidUsername);
        };
        if (normalized != existing.username) {
          switch (state.usernames.get(normalized)) {
            case (?owner) {
              if (owner != caller) { return #err(#usernameTaken) };
            };
            case null {};
          };
        };
        normalized;
      };
      case null { existing.username };
    };
    if (newUsername != existing.username) {
      state.usernames.remove(existing.username);
      state.usernames.add(newUsername, caller);
    };
    let updated : UserProfile = {
      id = existing.id;
      username = newUsername;
      displayName = update.displayName ?? existing.displayName;
      bio = update.bio ?? existing.bio;
      avatarUrl = switch (update.avatarUrl) {
        case (?a) { ?a };
        case null { existing.avatarUrl };
      };
      createdAt = existing.createdAt;
    };
    state.profiles.add(caller, updated);
    #ok(updated);
  };

  public func toSummary(
    state : UserState,
    viewer : ?Principal,
    user : UserProfile,
  ) : UserSummary {
    ignore (state, viewer);
    {
      id = user.id;
      username = user.username;
      displayName = user.displayName;
      avatarUrl = user.avatarUrl;
      followerCount = 0;
      followingCount = 0;
      isFollowing = false;
    };
  };
};
