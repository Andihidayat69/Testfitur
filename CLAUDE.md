# CLAUDE.md

Application code for **Jajan Tenang**: a mobile financial habit companion for Android and iOS, built for Gen Z (ages 18–29, already earning an income). It helps users pause before impulsive buys, save first on payday, and stay consistent through missions and points, without taking away the joy of spending. A mascot keeps them company at key moments.

## Where Context Lives

This file is always loaded, so it stays short. Read the documents below only when the task needs them.

| Need | Read |
|---|---|
| What the product is, who it is for, what each version includes | `docs/product/product-definition.md` |
| How the app looks, moves and speaks (colors, character, tone) | `docs/design/design-system.md` |
| How a feature should behave | `docs/specs/<feature>.md` (new specs start from `docs/specs/_template.md`) |
| Current stack and data flow | `docs/architecture/architecture.md` |
| Stored data: entities, fields, relations | `docs/architecture/data-model.md` |
| Backend endpoints (only if there is a backend) | `docs/architecture/api.md` |
| Why the architecture is the way it is | `docs/decisions/` (new decisions start from `docs/decisions/_template.md`) |
| What a domain term means and how to name it in code | `docs/glossary.md` |

If a document is contradictory or unclear, ask first; do not guess.

## Way of Working: Agentic Engineering

- **Spec first, then code.** Every feature has an approved spec in `docs/specs/` before it is implemented.
- **Tests and evals are written before or alongside the code.** A feature is not done until its tests pass.
- **Keep the prototype vs production boundary explicit.** Experiments (for example, character animation) may be built quickly, but they are marked as prototypes and are not merged into core code without tests.
- **Humans own architecture and final judgment.** Architecture decisions are recorded in `docs/decisions/`, and every line that ships is reviewed.
- **Keep context current.** When code changes behavior, update the matching spec, glossary entry or decision in the same change.

## Language

- English: code, comments, commit messages, all of `docs/`, and this file.
- Indonesian: user-facing app text only (character greetings, notifications, education articles).

## Scope of This Repo

This repo builds the **Next** version: a working app with real data storage. (v0.1 is a clickable prototype made outside this repo.)

1. Tier 1: welcome and Financial Habit Check (ending with the jajan budget), Home, Pause Before Buying (the signature flow), Smart Saving, Payday Reminder, Expense Tracker.
2. Tier 2: Daily Habit Mission, Habit Tracker, Progress Report.

Out of scope: Saving Battle, leaderboards, saving with friends, Split Bill, bank or e-wallet connection, and the Later version (premium features, scan bill, full character animation). Full list and open questions are in `docs/product/product-definition.md`.

## Hard Rules

- User financial data is sensitive. Do not log it, send it to third-party services, or use real data as examples in code or tests. Use made-up data.
- Do not commit secrets, API keys, or `.env` files.
- Do not add features outside the scope above without approval.
- This repo is self-contained. Docs and code reference only files inside the repo, never paths or file names outside it. If outside material is needed, bring its content into `docs/` first.

## Stack

Expo (React Native) with TypeScript, using development builds (not Expo Go). Local-first: no backend, all data in an on-device SQLite database encrypted with SQLCipher, accessed through Drizzle ORM. Tests: Jest + React Native Testing Library, Maestro for end-to-end. Details in `docs/architecture/architecture.md`, reasons in `docs/decisions/0001`–`0004`.

The app sends no user data over the network. Adding any network call or backend needs a new decision.

Expo ships breaking changes every SDK release; do not rely on memory for Expo or React Native APIs. Check the `expo` major version in `package.json` and read the matching docs at `https://docs.expo.dev/versions/v<major>.0.0/` (index: `https://docs.expo.dev/llms.txt`).

## Folder Structure

| Path | Contents |
|---|---|
| `src/app/` | Expo Router routes only: every file is a screen, `_layout.tsx` defines navigators. No tests or helpers here. `(onboarding)/` and `(tabs)/` are route groups. |
| `src/components/` | Shared UI built from the design system (Button, MoneyInput, Mascot, …); import from `@/components` |
| `src/theme/` | Color, spacing and type tokens; screens never use hex values or raw font names |
| `src/features/<feature>/` | Feature logic (plain TypeScript, no UI or storage imports where possible) and feature-local state |
| `src/state/` | App-wide React state: profile, entries, `useToday()` (refreshes on focus and foreground), `useJajan()` |
| `src/lib/` | Small shared helpers: `money.ts` (integer rupiah), `dates.ts` (local `YYYY-MM-DD` dates and `YYYY-MM` months) |
| `src/db/` | Drizzle schema (`schema.ts`), generated migrations (`migrations/`), stores, and database opening (`open.ts`) |
| `src/__tests__/` | Tests. Whole-app tests render the real routes through `src/test-utils/app.tsx`, one scenario per file (expo-router keeps navigation state in module globals). |
| `src/types/` | Ambient type declarations (for example `*.sql` imports) |
| `src/test-utils/` | Test harness and mocks (an in-memory profile store replaces SQLite; `reanimated-mock.tsx` replaces Reanimated, whose own mock fails under Jest in 4.7) |
| `assets/` | `brand/` (app icon, adaptive and notification icons, splash and header logos; sources in `brand/source/`, derived by `tools/build_icons.py`) and `mascot/` (the 15 poses, WebP) |
| `tools/` | Asset scripts (`build_icons.py`) |

Code imports use the `@/` alias for `src/` (and `@/assets/` for `assets/`).

`ios/` and `android/` are generated (Continuous Native Generation) and not committed. Never edit them by hand; configure native behavior in `app.json` and config plugins.

## Commands

```bash
npx expo install <package>  # always use this to add packages (picks SDK-compatible versions)
npx expo run:android        # build and run a development build on Android
npx expo start              # start the dev server for an installed development build
npm test                    # Jest unit and component tests
npm run typecheck           # TypeScript
npm run lint                # ESLint
npm run db:generate         # generate a Drizzle migration after changing src/db/schema.ts
npx expo-doctor             # check dependency and config issues
python3 tools/build_icons.py  # rebuild icons after changing assets/brand/source (needs Pillow)
```

Versioning (decision 0005): every shared build bumps the build number in `app.json`, gets a `CHANGELOG.md` entry and a `v<version>` tag. Test APK for phones (release, JavaScript bundled): `npx expo prebuild --platform android --clean`, then `cd android && ./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a,armeabi-v7a`. Details in `README.md`.

Run `npm test`, `npm run typecheck` and `npm run lint` before calling a task done. Expo Go does not work (SQLCipher needs a development build).

## Not Yet Decided

- Android package name and iOS bundle identifier: —
- iOS builds: Xcode is not installed on the development Mac; local iOS builds or EAS Build: —

Update this section as soon as a decision is made (record it in `docs/decisions/`), then move the result into the appropriate section.
