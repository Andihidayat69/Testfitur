# 0004: Testing Tools: Jest, React Native Testing Library and Maestro

- Status: accepted
- Date: 2026-11-12

## Context

A feature is not done until its tests pass, and tests are written before or alongside the code (`CLAUDE.md`). The app needs fast tests for logic (budget left, money saved, points, streaks, payday dates), component tests for screens, and end-to-end tests for whole flows such as Pause Before Buying.

## Decision

- **Unit and component tests:** Jest (through `jest-expo`) with React Native Testing Library.
- **End-to-end tests:** Maestro, running flows on an Android emulator and an iOS simulator against a development build.
- Business logic (money math, dates, points, streaks) lives in plain TypeScript modules with no UI or storage imports, so it can be unit tested directly.
- Test data is always made up; never real user data (hard rules).

## Consequences

- Easier: logic tests run in seconds; flows are written as readable YAML that matches the specs' steps.
- Harder: Maestro needs a built app and a running emulator or simulator, so end-to-end tests are slower and run less often than unit tests.
