# 0002: Local-First, No Backend in the Next Version

- Status: accepted
- Date: 2026-11-12

## Context

Every tier 1 and tier 2 feature in the Next version works with one user's own data on one device: the habit check, expense records, saving goals, pauses, missions and habit history. Nothing needs to be shared between users (leaderboards and saving with friends are out of scope), and there is no bank or e-wallet connection.

User financial data is sensitive, and the hard rules forbid sending it to third-party services.

Options considered:

- **Local-first, no backend.** All data stays on the device. No accounts, no servers, no running costs, and the strongest privacy position.
- **Backend from the start.** Enables account recovery, sync across devices and automatic measurement of the success metrics, but adds accounts, a server to run and secure, a privacy policy for stored financial data, and running costs, before the product is validated.

## Decision

The Next version is **local-first with no backend**. All user data is stored on the device only (see 0003). The app makes no network calls with user data.

`docs/architecture/api.md` stays empty until a later decision adds a backend.

## Consequences

- Easier: no login, no server, no hosting cost; the app works offline; user financial data never leaves the device.
- Harder: data is lost when the user uninstalls the app or changes phones. Export and backup are not in the current scope; adding them needs a spec and approval. That spec must also decide whether OS-level backup (Android Auto Backup, iCloud backup) includes the database.
- Harder: the success metrics in `docs/product/product-definition.md` cannot be measured automatically. How they are measured for the Next version is an open question in the product definition.
- If a backend is added later, the on-device schema becomes the source for sync, so entity names and IDs should be chosen with that in mind (for example, IDs that are unique without a server).
