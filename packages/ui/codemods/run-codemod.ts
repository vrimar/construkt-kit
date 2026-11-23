import jscodeshift, { type API, type FileInfo } from "jscodeshift";
import { vi } from "vitest";

const j = jscodeshift.withParser("tsx");

export function runCodemod(
  transform: (file: FileInfo, api: API) => string,
  source: string,
  imports: string,
) {
  const report = vi.fn();
  const output = transform(
    { path: "app.tsx", source: `${imports}\n${source}` },
    { j, jscodeshift: j, stats: vi.fn(), report },
  )
    .slice(imports.length + 1)
    .replace(/\s+/g, " ");
  return { output, reported: report.mock.calls.length };
}
