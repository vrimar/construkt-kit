import { expect, it } from "vitest";

import { operations } from "./gen/operations";

it("marks writes by method, with x-read-only turning a POST into a read", () => {
  const read = Object.fromEntries(operations.map((op) => [`${op.method} ${op.path}`, op.read]));
  expect(read).toMatchObject({
    "GET /api/projects": true,
    "POST /api/projects": false,
    "POST /api/projects/search": true,
    "DELETE /api/projects/{id}": false,
  });
});
