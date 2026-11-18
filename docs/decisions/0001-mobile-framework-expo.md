# 0001: Mobile Framework: Expo (React Native) With TypeScript

- Status: accepted
- Date: 2026-11-12

## Context

The app must install and run on both Android and iOS from one codebase. The design system asks for a custom, branded UI (hero blocks, large money numbers, a mascot with float, bounce and confetti motion, full character animation later), local scheduled notifications for the Payday Reminder, and a custom font (Plus Jakarta Sans).

The code is written mostly with AI agents (agentic engineering, see `CLAUDE.md`), and the team already works in TypeScript and React on web projects.

Options considered:

- **Expo (React Native) with TypeScript.** One codebase, familiar language, a large ecosystem, and AI agents are strongest here. Notifications, fonts, SQLite and secure storage are first-party Expo modules. Cloud builds (EAS Build) can produce iOS builds without managing native toolchains by hand.
- **Flutter.** Excellent rendering and animation control, but Dart is a new language for the team, and no requirement in the design system needs something Expo cannot do.
- **Native (Kotlin and Swift).** Two codebases for a small team; ruled out.

## Decision

Build the app with **Expo (React Native) and TypeScript**, starting on the current stable Expo SDK (SDK 58 at the time of writing).

- Use **development builds**, not Expo Go, because native modules such as SQLCipher (see 0003) do not run in Expo Go.
- Motion: React Native Reanimated for the mascot's idle float, pop-up bounce and confetti. A Lottie or Rive player is added when full character animation is built (Later version).
- Local notifications through `expo-notifications`; fonts through `expo-font`.

## Consequences

- Easier: one TypeScript codebase for both platforms; the same language as the team's web work; first-party modules for most needs.
- Harder: Expo Go cannot be used for day-to-day testing, so a development build has to be installed on each test device.
- Harder: Expo SDK releases come out a few times a year; upgrades need to be planned so the app does not fall behind.
