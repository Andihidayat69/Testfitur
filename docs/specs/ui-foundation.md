# UI Foundation

- Status: implemented (2026-11-12)
- Tier: 1
- Product reference: `docs/product/product-definition.md` (Features table); visual rules in `docs/design/design-system.md`

## Goal

Give every feature the same building blocks (colors, type, components, mascot, navigation and money formatting) so screens follow the design system without each feature re-creating them.

## User Stories

- As a user, I want the app to look and feel the same on every screen, so that it feels calm and trustworthy.
- As a user, I want money amounts written the Indonesian way (`Rp400.000`), so that I can read them at a glance.
- As a developer, I want ready-made components and tokens, so that a new screen follows the design system by default.

## Behavior

### Theme

- Color tokens exactly as in the design system (`primary`, `secondary`, `accent`, `bg-1`, `bg-2`, `highlight`, `text`, `danger-soft`, `success`, plus white for cards), exported from one theme module. Screens never use hex values directly.
- Light mode only. The app ignores the phone's dark mode setting (`userInterfaceStyle: "light"`).
- Spacing on an 8 px scale, side margin 20, radius 16 for cards and buttons, pill radius for chips and progress bars, shadow Deep Navy 8% blur 16 y 4.

### Typography

- Plus Jakarta Sans, bundled in the app (no download at runtime), weights Regular, SemiBold, Bold and ExtraBold.
- Text styles from the design system: display number, heading, title, body, caption, button. Display numbers use tabular figures.
- Nothing smaller than 14. Text respects the phone's font size setting, capped so layouts do not break.

### Money Formatting

- Money is stored and passed around as an integer number of rupiah (no decimals, no floats).
- `formatRupiah(400000)` → `Rp400.000`; negative values → `−Rp25.000`.
- Money input accepts digits only, shows dot thousands separators while typing, and has an `Rp` prefix.

### Components

Built from the design system's Components section:

| Component | Notes |
|---|---|
| `Button` | primary and secondary; height 52, full width; label 19 px Bold (WCAG AA on Electric Blue); disabled state |
| `MoneyInput` | label above, `Rp` prefix, numeric keyboard, Baby Blue border, Electric Blue on focus, error text below |
| `ChipOption` | quiz answers and choices; height 48 min, full width; selected state |
| `Chip` | small pill for quick picks (for example budget amounts) |
| `ProgressBar` | Ice Blue track, Electric Blue fill, height 8; `danger-soft` variant |
| `Hero` | hero block with bottom radius 32, Electric Blue or Ice Blue, soft blobs behind |
| `Mascot` | shows one pose by name at a given height; enforces the minimum sizes (96, or 240 for `sapa`); idle float animation that respects the phone's reduce-motion setting |
| `StepHeader` | back button, step dots, label (used by multi-step flows) |
| `Screen` | safe area, Soft White background, bottom action area for the primary button |

### Mascot Images

- The 15 poses are copied into `assets/mascot/` as WebP (480 px tall), named by pose (`sapa.webp`, `juara.webp`, …).
- Higher-resolution originals replace them before release (design system note).

### Navigation Shell

- Expo Router. Two areas: **onboarding** (shown until onboarding is complete) and **main tabs**.
- Main tabs: **Beranda, Catat, Tabung, Misi**, with line icons. Until each feature is built, a tab shows a placeholder: the `fokus` mascot and "Segera hadir."
- When the app starts, it opens onboarding if onboarding is not complete, otherwise the Beranda tab.

## Edge Cases

- Very large money values (for example `Rp100.000.000`) still fit on one line in a display number; the font size steps down for long values.
- The font fails to load: the app shows the system font rather than a blank screen.
- Small screens (width 320): the side margin stays 20 and content scrolls rather than shrinking spacing.

## Out of Scope

- Dark mode.
- Profile and settings screens (the Home header entry point comes with the Home spec).
- Full character animation (Later version).
- Points chip, streak chip, premium badge and reminder pop-up: built with the features that use them.

## Definition of Done

- [x] `formatRupiah` and money input parsing covered by unit tests
- [x] Each component has a render test (including disabled and selected states where they exist)
- [x] Start routing (onboarding vs tabs) covered by a test
- [x] User-facing text is in Indonesian
- [x] Glossary updated if new domain terms appear
