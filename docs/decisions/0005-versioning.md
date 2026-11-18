# 0005: Versioning and Build Numbers

- Status: accepted
- Date: 2026-11-13

## Context

Builds are about to go to testers. Every build needs a version that people can quote in bug reports and that can be traced back to the exact code, and Android refuses to install a build whose internal number is lower than the one already installed. The product definition already numbers its stages (v0.1 clickable prototype, Next, Later).

## Decision

Two numbers, both kept in `app.json`, which is the single source of truth (`package.json`'s `version` is kept equal):

| Number | Where | Rule |
|---|---|---|
| Version | `expo.version` | `MAJOR.MINOR.PATCH`, shown to users and testers |
| Build number | `android.versionCode` (integer) and `ios.buildNumber` (string), always the same value | Goes up by 1 for every build that leaves the developer's machine; never reused, never lowered |

Version meaning before public release:

- `0.1`: the clickable prototype in Google Stitch (outside this repo).
- `0.2.0`: first tester build, all tier 1 features.
- `0.2.x`: fixes within the same test round.
- `0.3.0`, `0.4.0`, …: the next test round with new features (for example tier 2).
- `1.0.0`: first public release on the Play Store or App Store.

Every distributed build:

1. Bumps the build number (and the version, if it changed) in `app.json` and `package.json`.
2. Adds an entry to `CHANGELOG.md` (what changed, what testers should try).
3. Is committed, then tagged `v<version>` (for example `v0.2.0`); a rebuild of the same version with a new build number is tagged `v<version>+<build>` (for example `v0.2.0+3`).
4. Is named `jajantenang-<version>-build<build>.apk` when shared.

The app shows "Versi <version> (<build>)" at the bottom of Profil, read from the app config at runtime.

The database schema is versioned separately by its migrations (`src/db/migrations/`).

## Consequences

- Easier: any tester report maps to a tag and a commit; Android always accepts an update over an older tester build.
- Harder: bumping is manual and easy to forget; the release steps in `README.md` list it first. If builds later move to EAS Build, its remote auto-increment can take over the build number (a new decision).
