# Design Brief

## Direction

Neon Nocturne — a cinematic, nightclub-energy reels feed where neon light cuts through a deep navy-black canvas.

## Tone

Bold, saturated maximalism held in a disciplined dark frame: high-contrast neon accents on near-black surfaces, never washed out, never timid.

## Differentiation

Full-bleed vertical video framed by a neon-pink/blue gradient rail and a glowing circular-ring avatar — the interface recedes so content glows, and neon is used as light, not paint.

## Color Palette

| Token      | OKLCH           | Role   |
| ---------- | --------------- | ------ |
| background | 0.13 0.018 285  | deep navy-black canvas |
| foreground | 0.96 0.008 300  | near-white text |
| card       | 0.17 0.022 285  | elevated surfaces, sheets, nav |
| primary    | 0.66 0.28 357   | neon pink #FF007F — CTAs, active states, likes |
| accent     | 0.8 0.14 220    | neon blue #00D2FF — links, secondary highlights |
| muted      | 0.21 0.024 285  | inactive rails, dividers, disabled |

## Typography

- Display: Space Grotesk — screen titles, usernames, balance figures, hero headings
- Body: DM Sans — captions, bios, labels, list rows
- Mono: JetBrains Mono — counts, timestamps, transaction amounts
- Scale: hero `text-4xl md:text-5xl font-bold tracking-tight`, h2 `text-2xl font-bold tracking-tight`, label `text-xs font-semibold tracking-widest uppercase`, body `text-sm md:text-base`

## Elevation & Depth

Layered surfaces climb from background → card → popover; soft dark shadows (`shadow-card-soft`, `shadow-elevated`) plus a bottom gradient rail over video create depth without glow-heavy neon.

## Structural Zones

| Zone       | Background                     | Border              | Notes |
| ---------- | ------------------------------ | ------------------- | ----- |
| Top nav    | `bg-card/80 backdrop-blur`     | `border-b border-border` | Following / For You tabs, search |
| Content    | `bg-background`                | —                   | Full-bleed reels; sheets use `bg-card` |
| Bottom nav | `bg-card/90 backdrop-blur`     | `border-t border-border` | Home, Discover, Create, Inbox, Profile |
| Wallet/Profile | `bg-background` + `bg-card` cards | `border-border` | Balance card uses gradient-subtle |

## Spacing & Rhythm

Mobile-first single column with `px-4` gutters; `gap-3` between feed cards and list rows; `py-6` section rhythm; action rail sits `right-3` with `gap-5` between icons.

## Component Patterns

- Buttons: pill-shaped (`rounded-full`), `bg-primary text-primary-foreground` primary, `border-border` outline secondary, `hover:opacity-90 transition-smooth`
- Cards: `rounded-2xl bg-card shadow-card-soft border border-border`; reels are full-bleed `rounded-none` within viewport
- Badges: pill `rounded-full bg-secondary text-secondary-foreground text-xs`; hashtags and counts use `text-accent`
- Avatars: circular with `ring-2 ring-primary` (active) or `ring-1 ring-border`; story ring uses `bg-gradient-primary` conic ring

## Motion

- Entrance: `animate-fade-in-up` on feed cards, sheets, and list items (0.4s ease-out)
- Hover/tap: `transition-smooth` opacity/scale; like button uses `animate-like-pop`
- Decorative: `animate-pulse-ring` on live/create affordances, `animate-shimmer` on upload progress

## Constraints

- Dark theme is the default; light mode is a secondary token set only
- Never use raw hex/rgb or arbitrary color classes — semantic tokens only
- No real video editing, OTP, social login, DM, UPI payout, or push/email UI
- Preserve all SEO/OG/Twitter meta tags in index.html

## Signature Detail

A neon gradient rail: the right-side action rail and bottom nav fade from transparent to near-black (`--gradient-rail`), so white icons float over video while the neon-pink active state reads as emitted light.
