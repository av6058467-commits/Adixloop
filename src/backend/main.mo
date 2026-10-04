import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import Expose "mo:caffeineai-oql/Expose";

import OqlEntities "lib/oql-entities";

import UserLib "lib/users";
import ReelLib "lib/reels";
import SocialLib "lib/social";
import SearchLib "lib/search";
import InboxLib "lib/inbox";
import WalletLib "lib/wallet";
import DraftLib "lib/drafts";

import UsersApi "mixins/users-api";
import ReelsApi "mixins/reels-api";
import SocialApi "mixins/social-api";
import SearchApi "mixins/search-api";
import InboxApi "mixins/inbox-api";
import WalletApi "mixins/wallet-api";
import DraftsApi "mixins/drafts-api";
import ApiDocMixin "mixins/api-doc";

actor {
  let accessControlState : AccessControl.AccessControlState;

  let userState : UserLib.UserState;
  let reelState : ReelLib.ReelState;
  let socialState : SocialLib.SocialState;
  let searchState : SearchLib.SearchState;
  let inboxState : InboxLib.InboxState;
  let walletState : WalletLib.WalletState;
  let draftState : DraftLib.DraftState;

  include MixinAuthorization(accessControlState, null);
  include Expose({
    entities = OqlEntities.build(userState, reelState, socialState, inboxState, walletState, draftState);
  });

  include UsersApi(userState, socialState);
  include ReelsApi(reelState, userState, socialState, searchState);
  include SocialApi(socialState, userState, reelState, inboxState);
  include SearchApi(searchState, userState, reelState);
  include InboxApi(inboxState);
  include WalletApi(walletState);
  include DraftsApi(draftState);
  include ApiDocMixin();
};
