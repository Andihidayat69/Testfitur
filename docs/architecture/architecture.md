# Architecture

The current state of the system: what it is built with and how data moves. Why each choice was made is recorded in `docs/decisions/`.

## Platforms

Android and iOS. The app must install and run on both.

## Stack

| Layer | Choice | Decision |
|---|---|---|
| Mobile framework | Expo (React Native), TypeScript, development builds (not Expo Go) | 0001 |
| Motion | React Native Reanimated; Lottie or Rive later for full character animation | 0001 |
| Notifications | `expo-notifications` (local, scheduled on the device) | 0001 |
| Backend | None in the Next version (local-first) | 0002 |
| Data storage | SQLite (`expo-sqlite`) encrypted with SQLCipher, Drizzle ORM | 0003 |
| Encryption key | `expo-secure-store` (Keychain / Keystore) | 0003 |
| Tests | Jest + React Native Testing Library; Maestro for end-to-end | 0004 |

## Data Flow

Everything happens on the device; the app sends no user data over the network.

1. On start, the root layout (`src/app/_layout.tsx`) loads the fonts, reads the database key from the secure store (creating it on first launch), opens the encrypted database, runs pending migrations and loads the profile. The splash screen stays up until this is done; if the database cannot be opened, a friendly error screen shows instead.
2. With no profile, only the onboarding routes are reachable; with a profile, only the main tabs (`Stack.Protected`).
3. Screens call feature logic (plain TypeScript, no UI imports) and stores (`src/db/`), which read and write the database through Drizzle. Stores sit behind small interfaces (for example `ProfileStore`) so tests can use in-memory versions.
4. Reminders (such as the Payday Reminder) are scheduled as local notifications on the device.

## Configuration

- Expo SDK 58 (React Native 0.88), Expo Router, TypeScript strict.
- `app.json`: `expo-sqlite` plugin with `useSQLCipher: true`; `expo-secure-store` and `expo-notifications` plugins.
- App icon, Android adaptive icon (Ice Blue background, with a monochrome layer for themed icons), splash (logo mark on Soft White, sized for the Android 12+ circular crop) and the notification small icon come from `assets/brand/`; `expo-notifications` is configured with the notification icon and Electric Blue accent.
- `babel.config.js` and `metro.config.js` bundle Drizzle's `.sql` migration files into the app; `drizzle.config.ts` points Drizzle Kit at `src/db/`.

Folder structure and commands are listed in `CLAUDE.md`.
