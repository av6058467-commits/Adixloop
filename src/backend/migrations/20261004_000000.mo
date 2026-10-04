import AccessControl "mo:caffeineai-authorization/access-control";
import Map "mo:core/Map";
import List "mo:core/List";
import Set "mo:core/Set";
import Principal "mo:core/Principal";

module {
  type OldActor = {};

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    userState : {
      profiles : Map.Map<Principal, {
        id : Principal;
        username : Text;
        displayName : Text;
        bio : Text;
        avatarUrl : ?Text;
        createdAt : Int;
      }>;
      usernames : Map.Map<Text, Principal>;
      var nextActivityId : Nat;
    };
    reelState : {
      reels : Map.Map<Nat, {
        id : Nat;
        creator : Principal;
        mediaUrl : Text;
        thumbnailUrl : ?Text;
        caption : Text;
        hashtags : [Text];
        soundLabel : ?Text;
        location : ?Text;
        audience : { #everyone; #followers };
        allowComments : Bool;
        allowDuet : Bool;
        createdAt : Int;
      }>;
      byCreator : Map.Map<Principal, List.List<Nat>>;
      var nextReelId : Nat;
    };
    socialState : {
      reelLikes : Map.Map<Nat, Set.Set<Principal>>;
      commentLikes : Map.Map<Nat, Set.Set<Principal>>;
      comments : Map.Map<Nat, {
        id : Nat;
        reelId : Nat;
        author : Principal;
        text : Text;
        createdAt : Int;
      }>;
      commentsByReel : Map.Map<Nat, List.List<Nat>>;
      followers : Map.Map<Principal, Set.Set<Principal>>;
      following : Map.Map<Principal, Set.Set<Principal>>;
      var nextCommentId : Nat;
    };
    searchState : {
      hashtags : Map.Map<Text, List.List<Nat>>;
      sounds : Map.Map<Text, List.List<Nat>>;
    };
    inboxState : {
      activities : Map.Map<Principal, List.List<{
        id : Nat;
        kind : { #like; #comment; #follow; #mention };
        actorId : Principal;
        actorUsername : Text;
        actorDisplayName : Text;
        actorAvatarUrl : ?Text;
        reelId : ?Nat;
        commentId : ?Nat;
        preview : ?Text;
        createdAt : Int;
      }>>;
      var nextActivityId : Nat;
    };
    walletState : {
      wallets : Map.Map<Principal, {
        balance : Nat;
        reelEarnings : Nat;
        referralEarnings : Nat;
        referralCode : Text;
      }>;
      transactions : Map.Map<Principal, List.List<{
        id : Nat;
        kind : { #reelBonus; #referralBonus; #withdrawal };
        amount : Nat;
        status : { #pending; #completed; #failed };
        createdAt : Int;
      }>>;
      var nextTransactionId : Nat;
    };
    draftState : {
      drafts : Map.Map<Nat, {
        id : Nat;
        owner : Principal;
        mediaUrl : ?Text;
        thumbnailUrl : ?Text;
        caption : Text;
        hashtags : [Text];
        soundLabel : ?Text;
        location : ?Text;
        audience : { #everyone; #followers };
        allowComments : Bool;
        allowDuet : Bool;
        createdAt : Int;
        updatedAt : Int;
      }>;
      byOwner : Map.Map<Principal, List.List<Nat>>;
      var nextDraftId : Nat;
    };
  };

  public func migration(_ : OldActor) : NewActor {
    {
      accessControlState = AccessControl.initState();
      userState = {
        profiles = Map.empty();
        usernames = Map.empty();
        var nextActivityId = 0;
      };
      reelState = {
        reels = Map.empty();
        byCreator = Map.empty();
        var nextReelId = 0;
      };
      socialState = {
        reelLikes = Map.empty();
        commentLikes = Map.empty();
        comments = Map.empty();
        commentsByReel = Map.empty();
        followers = Map.empty();
        following = Map.empty();
        var nextCommentId = 0;
      };
      searchState = {
        hashtags = Map.empty();
        sounds = Map.empty();
      };
      inboxState = {
        activities = Map.empty();
        var nextActivityId = 0;
      };
      walletState = {
        wallets = Map.empty();
        transactions = Map.empty();
        var nextTransactionId = 0;
      };
      draftState = {
        drafts = Map.empty();
        byOwner = Map.empty();
        var nextDraftId = 0;
      };
    };
  };
};
