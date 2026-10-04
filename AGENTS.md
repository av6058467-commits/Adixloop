# Project Guidance

## User Preferences

- Dark theme with neon-pink (#FF007F) primary accent and neon-blue (#00D2FF) secondary accent
- Mobile-first layout with a bottom navigation bar
- Rounded cards, circular avatars, and pill-shaped buttons
- Short-form vertical video (Reels) social experience

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- Motoko: 'actor' and 'label' are reserved keywords and cannot be used as parameter or record field names; rename to actorId/actorPrincipal/soundKey.
- Motoko has no triple-quoted multiline strings; use a single string with \n escapes.
- With Enhanced Migration check-limit=1, only one migration may be pending; fold an init migration's content into the latest pending file and remove the older one.
- OQL rejects an entity field declared as both a payload field and an edge with the same name; keep the payload field and give the edge a distinct name.
- Viewer-less backend queries (reelView(null, ...)) silently drop isLiked; feed queries must be caller-scoped (public query ({ caller })) so optimistic likes survive refetch.
- With Tailwind darkMode: ['class'], the dark class must be applied before first paint in main.tsx, not only in a settings toggle.
- TanStack Router dynamic routes require params on every Link; a bare /profile link does not match /profile/$userId.
- Biome useExhaustiveDependencies flags deps the effect body does not read; add a void reference to keep the dependency intentional.
