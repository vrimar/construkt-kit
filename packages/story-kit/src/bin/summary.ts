import path from "node:path";

import { reportDir, repoRoot } from "../paths.ts";
import { readReport } from "../report.ts";

export function reportSummary(since?: number): string | null {
  const report = readReport();
  if (!report) return null;
  if (since !== undefined && Date.parse(report.finishedAt) < since) return null;
  const kinds = new Map<string, number>();
  for (const failure of report.failures) {
    for (const kind of failure.kinds) kinds.set(kind, (kinds.get(kind) ?? 0) + 1);
  }
  const counts = [...kinds].map(([kind, count]) => `${count} ${kind}`).join(", ");
  const html = path.relative(repoRoot, path.join(reportDir, "report.html"));
  return `${report.failed} story failures (${counts}): review ${html}, accept the intended ones and fix the rest.`;
}
