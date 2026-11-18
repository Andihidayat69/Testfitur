# 0003: On-Device Storage: Encrypted SQLite With Drizzle ORM

- Status: accepted
- Date: 2026-11-12

## Context

Local-first (0002) means the device holds all user data. The data is relational (a saving goal has many deposits, expenses belong to categories, each pause has a decision, habit days link to missions) and needs monthly summaries and totals, which are natural SQL queries. The schema will change as features are added, so it needs migrations. The data is sensitive, so it should be encrypted at rest.

Options considered:

- **SQLite (`expo-sqlite`) with Drizzle ORM.** Relational queries, typed schema in TypeScript, generated migrations. `expo-sqlite` supports SQLCipher encryption through its config plugin (`useSQLCipher`).
- **Key-value storage (AsyncStorage, MMKV).** Simple, but summaries and relations would have to be computed by hand; no migrations.
- **Realm or WatermelonDB.** Capable, but heavier and less aligned with first-party Expo modules.

## Decision

- Store all user data in **SQLite through `expo-sqlite`**, with **Drizzle ORM** for the typed schema, queries and migrations.
- **Encrypt the database with SQLCipher** (`useSQLCipher` in the `expo-sqlite` config plugin).
- Generate the encryption key on first launch and keep it in the platform secure store (`expo-secure-store`: Keychain on iOS, Keystore on Android). The key is never logged or written anywhere else.
- Small non-sensitive preferences (for example, whether onboarding is done) may live in the same database; no second storage system unless a later decision adds one.
- Entity and field names follow `docs/glossary.md` and are documented in `docs/architecture/data-model.md`.

## Consequences

- Easier: typed queries, schema history through migrations, and summaries in SQL.
- Easier: data on a lost or rooted device is not readable as plain files.
- Harder: SQLCipher requires a development build (see 0001).
- Harder: if the secure-store key is lost (for example, a restore to a new device where the key does not carry over), the database cannot be opened. The backup spec mentioned in 0002 must handle this.
- Harder: every schema change needs a migration that is tested against the previous version's data.
