import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Activity {
    id: bigint;
    commentId?: CommentId;
    preview?: string;
    actorAvatarUrl?: string;
    kind: ActivityKind;
    createdAt: Timestamp;
    actorId: UserId;
    actorUsername: string;
    actorDisplayName: string;
    reelId?: ReelId;
}
export interface Cell {
    value: Value;
    name: string;
}
export type CommentId = bigint;
export interface CommentView {
    id: CommentId;
    isLiked: boolean;
    authorUsername: string;
    likeCount: bigint;
    createdAt: Timestamp;
    text: string;
    author: UserId;
    authorAvatarUrl?: string;
    authorDisplayName: string;
    reelId: ReelId;
}
export interface CreateReelInput {
    thumbnailUrl?: string;
    hashtags: Array<string>;
    audience: Audience;
    mediaUrl: string;
    allowComments: boolean;
    caption: string;
    allowDuet: boolean;
    soundLabel?: string;
    location?: string;
}
export interface Draft {
    id: DraftId;
    thumbnailUrl?: string;
    hashtags: Array<string>;
    owner: UserId;
    createdAt: Timestamp;
    audience: Audience;
    mediaUrl?: string;
    updatedAt: Timestamp;
    allowComments: boolean;
    caption: string;
    allowDuet: boolean;
    soundLabel?: string;
    location?: string;
}
export type DraftId = bigint;
export interface DraftInput {
    thumbnailUrl?: string;
    hashtags: Array<string>;
    audience: Audience;
    mediaUrl?: string;
    allowComments: boolean;
    caption: string;
    allowDuet: boolean;
    soundLabel?: string;
    location?: string;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface FollowState {
    isFollowing: boolean;
    followerCount: bigint;
    followingCount: bigint;
}
export interface HashtagResult {
    tag: string;
    reelCount: bigint;
}
export interface ProfileUpdate {
    bio?: string;
    username?: string;
    displayName?: string;
    avatarUrl?: string;
}
export interface Reel {
    id: ReelId;
    creator: UserId;
    thumbnailUrl?: string;
    hashtags: Array<string>;
    createdAt: Timestamp;
    audience: Audience;
    mediaUrl: string;
    allowComments: boolean;
    caption: string;
    allowDuet: boolean;
    soundLabel?: string;
    location?: string;
}
export type ReelId = bigint;
export interface ReelView {
    id: ReelId;
    creator: UserId;
    isLiked: boolean;
    likeCount: bigint;
    creatorAvatarUrl?: string;
    thumbnailUrl?: string;
    hashtags: Array<string>;
    creatorDisplayName: string;
    createdAt: Timestamp;
    audience: Audience;
    creatorUsername: string;
    mediaUrl: string;
    allowComments: boolean;
    caption: string;
    commentCount: bigint;
    allowDuet: boolean;
    soundLabel?: string;
    location?: string;
}
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export interface SearchResults {
    hashtags: Array<HashtagResult>;
    sounds: Array<SoundResult>;
    users: Array<UserId>;
    reels: Array<ReelId>;
}
export interface SoundResult {
    soundLabel: string;
    reelCount: bigint;
}
export type Timestamp = bigint;
export interface Transaction {
    id: TransactionId;
    status: TransactionStatus;
    kind: TransactionKind;
    createdAt: Timestamp;
    amount: bigint;
}
export type TransactionId = bigint;
export type UserId = Principal;
export interface UserProfile {
    id: UserId;
    bio: string;
    username: string;
    displayName: string;
    createdAt: Timestamp;
    avatarUrl?: string;
}
export interface UserSummary {
    id: UserId;
    username: string;
    displayName: string;
    avatarUrl?: string;
    isFollowing: boolean;
    followerCount: bigint;
    followingCount: bigint;
}
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export interface Wallet {
    referralCode: string;
    balance: bigint;
    reelEarnings: bigint;
    referralEarnings: bigint;
}
export interface WithdrawalRequest {
    upiId: string;
    amount: bigint;
}
export enum ActivityKind {
    like = "like",
    comment = "comment",
    mention = "mention",
    follow = "follow"
}
export enum Audience {
    everyone = "everyone",
    followers = "followers"
}
export enum DraftError {
    notAuthorized = "notAuthorized",
    notFound = "notFound"
}
export enum ReelError {
    notAuthorized = "notAuthorized",
    notFound = "notFound",
    commentsDisabled = "commentsDisabled"
}
export enum SearchFilter {
    all = "all",
    hashtags = "hashtags",
    sounds = "sounds",
    users = "users",
    reels = "reels"
}
export enum SocialError {
    notAuthorized = "notAuthorized",
    notFound = "notFound",
    cannotFollowSelf = "cannotFollowSelf"
}
export enum TransactionKind {
    reelBonus = "reelBonus",
    withdrawal = "withdrawal",
    referralBonus = "referralBonus"
}
export enum TransactionStatus {
    pending = "pending",
    completed = "completed",
    failed = "failed"
}
export enum UserError {
    notAuthorized = "notAuthorized",
    invalidUsername = "invalidUsername",
    notFound = "notFound",
    usernameTaken = "usernameTaken"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum WalletError {
    insufficientBalance = "insufficientBalance",
    invalidUpiId = "invalidUpiId",
    invalidAmount = "invalidAmount"
}
export interface backendInterface {
    addComment(reelId: bigint, text: string): Promise<{
        __kind__: "ok";
        ok: CommentView;
    } | {
        __kind__: "err";
        err: SocialError;
    }>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createProfile(username: string, displayName: string, bio: string, avatarUrl: string | null): Promise<{
        __kind__: "ok";
        ok: UserProfile;
    } | {
        __kind__: "err";
        err: UserError;
    }>;
    createReel(input: CreateReelInput): Promise<{
        __kind__: "ok";
        ok: Reel;
    } | {
        __kind__: "err";
        err: ReelError;
    }>;
    deleteDraft(draftId: bigint): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: DraftError;
    }>;
    execute(qJson: string): Promise<Result>;
    follow(user: Principal): Promise<{
        __kind__: "ok";
        ok: FollowState;
    } | {
        __kind__: "err";
        err: SocialError;
    }>;
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    getFollowState(user: Principal): Promise<FollowState>;
    getProfile(user: Principal): Promise<UserProfile | null>;
    getProfileByUsername(username: string): Promise<UserProfile | null>;
    getReel(id: bigint): Promise<ReelView | null>;
    getReelForCaller(id: bigint): Promise<ReelView | null>;
    getReelLikeState(reelId: bigint): Promise<{
        isLiked: boolean;
        likeCount: bigint;
    }>;
    getUserSummary(user: Principal): Promise<UserSummary | null>;
    getWallet(): Promise<Wallet>;
    isCallerAdmin(): Promise<boolean>;
    listActivity(kind: ActivityKind | null): Promise<Array<Activity>>;
    listComments(reelId: bigint): Promise<Array<CommentView>>;
    listDrafts(): Promise<Array<Draft>>;
    listFollowers(user: Principal): Promise<Array<Principal>>;
    listFollowing(user: Principal): Promise<Array<Principal>>;
    listFollowingFeed(): Promise<Array<ReelView>>;
    listForYouFeed(): Promise<Array<ReelView>>;
    listReelsByUser(user: Principal): Promise<Array<ReelView>>;
    listTransactions(): Promise<Array<Transaction>>;
    reelsByHashtag(tag: string): Promise<Array<bigint>>;
    reelsBySound(soundLabel: string): Promise<Array<bigint>>;
    requestWithdrawal(request: WithdrawalRequest): Promise<{
        __kind__: "ok";
        ok: Transaction;
    } | {
        __kind__: "err";
        err: WalletError;
    }>;
    saveDraft(draftId: bigint | null, input: DraftInput): Promise<{
        __kind__: "ok";
        ok: Draft;
    } | {
        __kind__: "err";
        err: DraftError;
    }>;
    schema(): Promise<string>;
    search(filter: SearchFilter, term: string): Promise<SearchResults>;
    toggleCommentLike(commentId: bigint): Promise<{
        __kind__: "ok";
        ok: boolean;
    } | {
        __kind__: "err";
        err: SocialError;
    }>;
    toggleReelLike(reelId: bigint): Promise<{
        __kind__: "ok";
        ok: boolean;
    } | {
        __kind__: "err";
        err: SocialError;
    }>;
    trendingHashtags(limit: bigint): Promise<Array<HashtagResult>>;
    unfollow(user: Principal): Promise<{
        __kind__: "ok";
        ok: FollowState;
    } | {
        __kind__: "err";
        err: SocialError;
    }>;
    updateProfile(update: ProfileUpdate): Promise<{
        __kind__: "ok";
        ok: UserProfile;
    } | {
        __kind__: "err";
        err: UserError;
    }>;
}
