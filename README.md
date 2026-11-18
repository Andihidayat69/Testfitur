# Jajan Tenang

Mobile personal finance app (Android and iOS) for Gen Z: control spending, reduce impulsive buying, build a saving habit.

Status: all tier 1 features implemented (see `docs/specs/`), Android tested on an emulator. Stack: Expo (React Native) + TypeScript, local-first with encrypted SQLite (see `docs/decisions/`).

## Structure

| File | What it is for | Update it when |
|---|---|---|
| `CLAUDE.md` | Context for AI agents, loaded in every session: rules, way of working, and a map of where to find everything else. Keep it short. | A rule, command or folder changes |
| `docs/product/product-definition.md` | Source of truth for what the product is, who it is for, and what each version includes | Product scope or priority changes |
| `docs/design/design-system.md` | How the app looks, moves and speaks: colors, typography, animated character, tone of voice | A visual or tone decision is made |
| `docs/architecture/architecture.md` | The current system: platforms, stack, how data moves | The stack or data flow changes |
| `docs/architecture/data-model.md` | The data the app stores: entities, fields, relations | A table, entity or field changes |
| `docs/architecture/api.md` | Endpoints between the app and a backend (only if there is one) | An endpoint changes |
| `docs/specs/<feature>.md` | One spec per feature: user stories, behavior, edge cases, definition of done. Written before the code. Start from `docs/specs/_template.md`. | Before building a feature, and whenever its behavior changes |
| `docs/decisions/NNNN-<title>.md` | Architecture decision records: why a choice was made and what it costs. Never edited after acceptance; superseded by a new record instead. Start from `docs/decisions/_template.md`. | An important technical choice is made |
| `CHANGELOG.md` | What changed in each shared build and what testers should try | Every shared build |
| `docs/glossary.md` | Domain terms, what they mean, and the one name to use in code | A new domain term appears |
| `.gitignore` | Files Git must not track, including `.env` secrets | A new tool creates files that should not be committed |

`architecture.md` describes how things are now; `docs/decisions/` explains how they got that way.

## Getting Started

Requirements: Node 22, Android SDK (for Android), Xcode (for local iOS builds).

```bash
npm install
npm test
npx expo run:android   # development build; Expo Go does not work with this app
```

All commands are listed in `CLAUDE.md`.

## Test APK for Android Phones

Every build that is shared follows `docs/decisions/0005-versioning.md`:

1. Bump `android.versionCode` and `ios.buildNumber` (always) and `version` (when it changes) in `app.json`; keep `package.json`'s `version` equal.
2. Add an entry to `CHANGELOG.md`.
3. Commit, build (below), check the APK on a device or emulator, then tag `v<version>` (or `v<version>+<build>` for a rebuild of the same version).
4. Share the file as `jajantenang-<version>-build<build>.apk`.

A release APK has the JavaScript bundled in, so it runs on a phone without the dev server:

```bash
npx expo prebuild --platform android --clean   # after changing app.json, icons or native packages
cd android && ./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a,armeabi-v7a
# → android/app/build/outputs/apk/release/app-release.apk
```

It is signed with the debug key from the Expo template: fine for sideloading to testers, not accepted by the Play Store (a release key is needed first). `android/` is generated and not committed, so copy the APK somewhere else before the next prebuild.

## App Icon and Splash

Brand sources are in `assets/brand/source/` (copied from the Jajan Tenang logo set). `tools/build_icons.py` derives the app icon, Android adaptive and themed (monochrome) icons, the notification icon and the splash logo (the mark only: Android 12+ crops splash icons to a circle) into `assets/brand/`:

```bash
python3 tools/build_icons.py   # needs Pillow
```
