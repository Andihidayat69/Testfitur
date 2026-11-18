import { expect, test } from "@jest/globals";

import pausesMigration from "../db/migrations/0002_pauses.sql";

// The SQLite store cannot run under Jest; this checks the generated migration instead.
test("a pause's expense link is cleared, not cascaded, when the expense is deleted", () => {
  expect(pausesMigration).toMatch(/FOREIGN KEY \(`entry_id`\) REFERENCES `entries`\(`id`\)[^,]*ON DELETE set null/);
});
