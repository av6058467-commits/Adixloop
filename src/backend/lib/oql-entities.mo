import List "mo:core/List";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

import OQL "mo:caffeineai-oql";
import Entity "mo:caffeineai-oql/Entity";
import MapEntity "mo:caffeineai-oql/MapEntity";
import RecordValue "mo:caffeineai-oql/RecordValue";
import NatValue "mo:caffeineai-oql/NatValue";
import TextValue "mo:caffeineai-oql/TextValue";
import PrincipalValue "mo:caffeineai-oql/PrincipalValue";
import IntValue "mo:caffeineai-oql/IntValue";
import BoolValue "mo:caffeineai-oql/BoolValue";
import OptTextValue "opt-text-value";
import OptNatValue "opt-nat-value";

import UserLib "users";
import ReelLib "reels";
import SocialLib "social";
import InboxLib "inbox";
import WalletLib "wallet";
import DraftLib "drafts";

module {
  // Builds the OQL entity declarations for every persisted, queryable
  // collection. Public social data (users, reels, comments, likes, follows)
  // is world-readable; per-user data (inbox activity, wallet transactions,
  // drafts) is scoped to its owner, with controllers able to read all rows.
  public func build(
    userState : UserLib.UserState,
    reelState : ReelLib.ReelState,
    socialState : SocialLib.SocialState,
    inboxState : InboxLib.InboxState,
    walletState : WalletLib.WalletState,
    draftState : DraftLib.DraftState,
  ) : [Entity.Decl] {
    let anyP = Principal.fromText("aaaaa-aa");

    // Flatten `Map<Nat, Set<Principal>>` into one row per (target, liker).
    func likeRows(index : Map.Map<Nat, Set.Set<Principal>>) : Iter.Iter<(Nat, Principal)> {
      let out = List.empty<(Nat, Principal)>();
      for ((targetId, likers) in index.entries()) {
        for (liker in likers.values()) {
          out.add((targetId, liker));
        };
      };
      out.values();
    };

    // Flatten `Map<Principal, Set<Principal>>` into one row per (follower, followee).
    func followRows() : Iter.Iter<(Principal, Principal)> {
      let out = List.empty<(Principal, Principal)>();
      for ((follower, followees) in socialState.following.entries()) {
        for (followee in followees.values()) {
          out.add((follower, followee));
        };
      };
      out.values();
    };

    // Flatten `Map<Principal, List<Activity>>` into one row per (recipient, activity).
    func activityRows() : Iter.Iter<(Principal, InboxLib.Activity)> {
      let out = List.empty<(Principal, InboxLib.Activity)>();
      for ((recipient, list) in inboxState.activities.entries()) {
        for (a in list.values()) {
          out.add((recipient, a));
        };
      };
      out.values();
    };

    // Flatten `Map<Principal, List<Transaction>>` into one row per (owner, transaction).
    func transactionRows() : Iter.Iter<(Principal, WalletLib.Transaction)> {
      let out = List.empty<(Principal, WalletLib.Transaction)>();
      for ((owner, list) in walletState.transactions.entries()) {
        for (t in list.values()) {
          out.add((owner, t));
        };
      };
      out.values();
    };

    [
      // users — public profiles.
      userState.profiles.toEntity("user", "User", "id")
        .sample({ id = anyP; username = ""; displayName = ""; bio = ""; avatarUrl = null; createdAt = 0 })
        .public_()
        .build(),

      // reels — public short-form videos.
      OQL.Entity.manual<ReelLib.Reel>("reel", func () = reelState.reels.values(), "Reel", "id")
        .sample({
          id = 0;
          creator = anyP;
          mediaUrl = "";
          thumbnailUrl = null;
          caption = "";
          hashtags = [];
          soundLabel = null;
          location = null;
          audience = #everyone;
          allowComments = true;
          allowDuet = true;
          createdAt = 0;
        })
        .payload("id", func r = r.id)
        .payload("creator", func r = r.creator)
        .payload("mediaUrl", func r = r.mediaUrl)
        .payload("thumbnailUrl", func r = r.thumbnailUrl)
        .payload("caption", func r = r.caption)
        .payload("hashtags", func r = r.hashtags.values().join(","))
        .payload("soundLabel", func r = r.soundLabel)
        .payload("location", func r = r.location)
        .payload("audience", func r = switch (r.audience) { case (#everyone) "everyone"; case (#followers) "followers" })
        .payload("allowComments", func r = r.allowComments)
        .payload("allowDuet", func r = r.allowDuet)
        .payload("createdAt", func r = r.createdAt)
        .edge("creator", "user")
        .public_()
        .build(),

      // comments — public comments on reels.
      socialState.comments.toEntity("comment", "Comment", "id")
        .sample({ id = 0; reelId = 0; author = anyP; text = ""; createdAt = 0 })
        .edge("reelId", "reel")
        .edge("author", "user")
        .public_()
        .build(),

      // reel likes — one row per (reel, liker).
      OQL.Entity.manual<(Nat, Principal)>("reelLike", func () = likeRows(socialState.reelLikes), "ReelLike", "id")
        .sample((0, anyP))
        .payload("id", func ((reelId, liker)) = reelId.toText() # ":" # liker.toText())
        .payload("reelId", func ((reelId, _)) = reelId)
        .payload("liker", func ((_, liker)) = liker)
        .edge("reelId", "reel")
        .edge("liker", "user")
        .public_()
        .build(),

      // comment likes — one row per (comment, liker).
      OQL.Entity.manual<(Nat, Principal)>("commentLike", func () = likeRows(socialState.commentLikes), "CommentLike", "id")
        .sample((0, anyP))
        .payload("id", func ((commentId, liker)) = commentId.toText() # ":" # liker.toText())
        .payload("commentId", func ((commentId, _)) = commentId)
        .payload("liker", func ((_, liker)) = liker)
        .edge("commentId", "comment")
        .edge("liker", "user")
        .public_()
        .build(),

      // follows — one row per (follower, followee).
      OQL.Entity.manual("follow", followRows, "Follow", "id")
        .sample((anyP, anyP))
        .payload("id", func ((follower, followee)) = follower.toText() # ":" # followee.toText())
        .payload("follower", func ((follower, _)) = follower)
        .payload("followee", func ((_, followee)) = followee)
        .edge("follower", "user")
        .edge("followee", "user")
        .public_()
        .build(),

      // inbox activity — private to each recipient.
      OQL.Entity.manual<(Principal, InboxLib.Activity)>("activity", activityRows, "Activity", "id")
        .sample((anyP, {
          id = 0;
          kind = #like;
          actorId = anyP;
          actorUsername = "";
          actorDisplayName = "";
          actorAvatarUrl = null;
          reelId = null;
          commentId = null;
          preview = null;
          createdAt = 0;
        }))
        .payload("id", func ((recipient, a)) = recipient.toText() # ":" # a.id.toText())
        .payload("recipient", func ((recipient, _)) = recipient)
        .payload("kind", func ((_, a)) = switch (a.kind) { case (#like) "like"; case (#comment) "comment"; case (#follow) "follow"; case (#mention) "mention" })
        .payload("actorId", func ((_, a)) = a.actorId)
        .payload("actorUsername", func ((_, a)) = a.actorUsername)
        .payload("actorDisplayName", func ((_, a)) = a.actorDisplayName)
        .payload("actorAvatarUrl", func ((_, a)) = a.actorAvatarUrl)
        .payload("reelId", func ((_, a)) = a.reelId)
        .payload("commentId", func ((_, a)) = a.commentId)
        .payload("preview", func ((_, a)) = a.preview)
        .payload("createdAt", func ((_, a)) = a.createdAt)
        .edge("actorId", "user")
        .ownedBy("recipient")
        .controllerOrScoped()
        .build(),

      // wallet transactions — private to each owner.
      OQL.Entity.manual<(Principal, WalletLib.Transaction)>("transaction", transactionRows, "Transaction", "id")
        .sample((anyP, { id = 0; kind = #reelBonus; amount = 0; status = #completed; createdAt = 0 }))
        .payload("id", func ((owner, t)) = owner.toText() # ":" # t.id.toText())
        .payload("owner", func ((owner, _)) = owner)
        .payload("kind", func ((_, t)) = switch (t.kind) { case (#reelBonus) "reelBonus"; case (#referralBonus) "referralBonus"; case (#withdrawal) "withdrawal" })
        .payload("amount", func ((_, t)) = t.amount)
        .payload("status", func ((_, t)) = switch (t.status) { case (#pending) "pending"; case (#completed) "completed"; case (#failed) "failed" })
        .payload("createdAt", func ((_, t)) = t.createdAt)
        .edge("ownerUser", "user")
        .ownedBy("owner")
        .controllerOrScoped()
        .build(),

      // drafts — private to each owner.
      OQL.Entity.manual<DraftLib.Draft>("draft", func () = draftState.drafts.values(), "Draft", "id")
        .sample({
          id = 0;
          owner = anyP;
          mediaUrl = null;
          thumbnailUrl = null;
          caption = "";
          hashtags = [];
          soundLabel = null;
          location = null;
          audience = #everyone;
          allowComments = true;
          allowDuet = true;
          createdAt = 0;
          updatedAt = 0;
        })
        .payload("id", func d = d.id)
        .payload("owner", func d = d.owner)
        .payload("mediaUrl", func d = d.mediaUrl)
        .payload("thumbnailUrl", func d = d.thumbnailUrl)
        .payload("caption", func d = d.caption)
        .payload("hashtags", func d = d.hashtags.values().join(","))
        .payload("soundLabel", func d = d.soundLabel)
        .payload("location", func d = d.location)
        .payload("audience", func d = switch (d.audience) { case (#everyone) "everyone"; case (#followers) "followers" })
        .payload("allowComments", func d = d.allowComments)
        .payload("allowDuet", func d = d.allowDuet)
        .payload("createdAt", func d = d.createdAt)
        .payload("updatedAt", func d = d.updatedAt)
        .edge("ownerUser", "user")
        .ownedBy("owner")
        .controllerOrScoped()
        .build(),
    ];
  };
};
