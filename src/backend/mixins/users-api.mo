import Principal "mo:core/Principal";
import Types "../types/users";
import UserLib "../lib/users";
import SocialLib "../lib/social";

mixin (state : UserLib.UserState, socialState : SocialLib.SocialState) {
  public shared ({ caller }) func createProfile(
    username : Text,
    displayName : Text,
    bio : Text,
    avatarUrl : ?Text,
  ) : async { #ok : Types.UserProfile; #err : Types.UserError } {
    UserLib.createProfile(state, caller, username, displayName, bio, avatarUrl);
  };

  public query func getProfile(user : Principal) : async ?Types.UserProfile {
    UserLib.getProfile(state, user);
  };

  public query func getProfileByUsername(username : Text) : async ?Types.UserProfile {
    UserLib.getProfileByUsername(state, username);
  };

  public shared ({ caller }) func updateProfile(
    update : Types.ProfileUpdate,
  ) : async { #ok : Types.UserProfile; #err : Types.UserError } {
    UserLib.updateProfile(state, caller, update);
  };

  public query ({ caller }) func getUserSummary(user : Principal) : async ?Types.UserSummary {
    switch (UserLib.getProfile(state, user)) {
      case (?profile) {
        let fs = SocialLib.followState(socialState, ?caller, user);
        ?{
          id = profile.id;
          username = profile.username;
          displayName = profile.displayName;
          avatarUrl = profile.avatarUrl;
          followerCount = fs.followerCount;
          followingCount = fs.followingCount;
          isFollowing = fs.isFollowing;
        };
      };
      case null { null };
    };
  };
};
