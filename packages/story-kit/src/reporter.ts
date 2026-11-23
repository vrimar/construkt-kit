import fs from "node:fs";
import path from "node:path";

import type { FullResult, Reporter, TestCase, TestResult } from "@playwright/test/reporter";
import { PNG } from "pngjs";

import { isPixelRun } from "./env.ts";
import { reportDir, repoRoot } from "./paths.ts";
import { renderHtml } from "./report-html.ts";
import { type FailureKind, KIND_ADVICE, type StoryFailure, type StoryReport } from "./report.ts";
import { stories } from "./story-ids.gen.ts";

const ANSI = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, "g");
const SEPARATOR = 6;
const PADDING = 24;

function classify(message: string): FailureKind {
  if (message.includes("A snapshot doesn't exist at")) return "missing-baseline";
  if (message.includes("Failed to take two consecutive stable screenshots")) return "unstable";
  if (message.includes("Expected an image") && message.includes("received")) return "dimension";
  if (message.includes("pixels (ratio")) return "visual";
  if (message.includes("Accessibility violations")) return "a11y";
  if (message.includes("toMatchAriaSnapshot")) return "aria";
  return "spec";
}

function readPng(file: string | undefined): PNG | null {
  if (!file || !fs.existsSync(file)) return null;
  return PNG.sync.read(fs.readFileSync(file));
}

function changedBox(
  expected: PNG,
  actual: PNG,
): { count: number; box: [number, number, number, number] } | null {
  if (expected.width !== actual.width || expected.height !== actual.height) return null;
  let count = 0;
  let [minX, minY, maxX, maxY] = [expected.width, expected.height, -1, -1];
  for (let y = 0; y < expected.height; y++) {
    for (let x = 0; x < expected.width; x++) {
      const offset = (y * expected.width + x) * 4;
      if (expected.data.readUInt32BE(offset) !== actual.data.readUInt32BE(offset)) {
        count++;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  return count === 0 ? null : { count, box: [minX, minY, maxX, maxY] };
}

function crop(image: PNG, [x0, y0, x1, y1]: [number, number, number, number], scale: number): PNG {
  const width = (x1 - x0 + 1) * scale;
  const height = (y1 - y0 + 1) * scale;
  const out = new PNG({ width, height });
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const source = ((y0 + Math.floor(y / scale)) * image.width + x0 + Math.floor(x / scale)) * 4;
      image.data.copy(out.data, (y * width + x) * 4, source, source + 4);
    }
  }
  return out;
}

function triptych(panels: PNG[]): PNG {
  const height = Math.max(...panels.map((panel) => panel.height));
  const width =
    panels.reduce((sum, panel) => sum + panel.width, 0) + SEPARATOR * (panels.length - 1);
  const out = new PNG({ width, height });
  out.data.fill(0);
  for (let index = 3; index < out.data.length; index += 4) out.data[index] = 255;
  let left = 0;
  for (const panel of panels) {
    PNG.bitblt(panel, out, 0, 0, panel.width, panel.height, left, 0);
    left += panel.width + SEPARATOR;
  }
  return out;
}

function attachment(result: TestResult, suffix: string) {
  return result.attachments.find((item) => item.path && item.name.endsWith(suffix))?.path;
}

function relative(file: string) {
  return path.relative(repoRoot, file);
}

export default class StoryReporter implements Reporter {
  private failures: StoryFailure[] = [];
  private passed = 0;
  private skipped = 0;

  onTestEnd(test: TestCase, result: TestResult) {
    if (result.status === "skipped") {
      this.skipped++;
      return;
    }
    if (result.status === "passed" || result.status === test.expectedStatus) {
      if (result.retry === 0 || result.status === "passed") this.passed++;
      return;
    }
    const project = test.parent.project()?.name ?? "unknown";
    const storyId =
      [...result.annotations, ...test.annotations].find((annotation) => annotation.type === "story")
        ?.description ?? null;
    const story = storyId ? stories[storyId as keyof typeof stories] : undefined;
    const messages = result.errors.map((error) =>
      (error.message ?? error.value ?? "").replace(ANSI, ""),
    );
    const kinds = [...new Set(messages.map(classify))];

    let pixels: number | null = null;
    let bbox: StoryFailure["bbox"] = null;
    let image: string | null = null;
    let actual: string | null = null;
    const expectedPng = readPng(attachment(result, "-expected.png"));
    const actualPath = attachment(result, "-actual.png");
    const actualPng = readPng(actualPath);
    const diffPng = readPng(attachment(result, "-diff.png"));
    if (storyId && actualPath && actualPng) {
      actual = path.join("actual", project, `${storyId}.png`);
      fs.mkdirSync(path.join(reportDir, "actual", project), { recursive: true });
      fs.copyFileSync(actualPath, path.join(reportDir, actual));
    }
    if (storyId && expectedPng && actualPng && diffPng) {
      const changed = changedBox(expectedPng, actualPng);
      if (changed) {
        pixels = changed.count;
        bbox = changed.box;
        const region: [number, number, number, number] = [
          Math.max(0, changed.box[0] - PADDING),
          Math.max(0, changed.box[1] - PADDING),
          Math.min(expectedPng.width - 1, changed.box[2] + PADDING),
          Math.min(expectedPng.height - 1, changed.box[3] + PADDING),
        ];
        const scale = Math.max(
          1,
          Math.min(
            4,
            Math.floor(480 / Math.max(region[2] - region[0] + 1, region[3] - region[1] + 1)),
          ),
        );
        image = path.join("images", project, `${storyId}.png`);
        fs.mkdirSync(path.join(reportDir, "images", project), { recursive: true });
        fs.writeFileSync(
          path.join(reportDir, image),
          PNG.sync.write(
            triptych([expectedPng, actualPng, diffPng].map((png) => crop(png, region, scale))),
          ),
        );
      }
    }

    this.failures.push({
      storyId,
      test: test.titlePath().slice(3).join(" › "),
      file: story?.file ?? relative(test.location.file),
      exportName: story?.exportName ?? null,
      project,
      kinds,
      messages: messages.map((message) => message.split("\n").slice(0, 40).join("\n")),
      pixels,
      bbox,
      image,
      actual,
      rerun: storyId
        ? `pnpm test:stories --project ${project} --grep "${storyId}"`
        : `pnpm test:stories --project ${project} ${relative(test.location.file)}:${test.location.line}`,
    });
  }

  onEnd(result: FullResult) {
    const report: StoryReport = {
      mode: isPixelRun() ? "pixels" : "functional",
      finishedAt: new Date().toISOString(),
      status: result.status,
      passed: this.passed,
      failed: this.failures.length,
      skipped: this.skipped,
      failures: this.failures,
    };
    fs.mkdirSync(reportDir, { recursive: true });
    fs.writeFileSync(path.join(reportDir, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
    fs.writeFileSync(path.join(reportDir, "report.md"), renderMarkdown(report));
    fs.writeFileSync(path.join(reportDir, "report.html"), renderHtml(report));
    if (this.failures.length > 0) {
      process.stdout.write(
        `\nStory report: ${relative(path.join(reportDir, "report.md"))}, or report.html beside it to review in a browser\n`,
      );
    }
  }

  printsToStdio() {
    return false;
  }
}

function renderMarkdown(report: StoryReport): string {
  const lines = [
    `# Story test report`,
    "",
    `Mode: ${report.mode === "pixels" ? "pixels compared in the pinned browser" : "functional only (no screenshots compared)"}`,
    `Passed ${report.passed}, failed ${report.failed}, skipped ${report.skipped}.`,
    "",
  ];
  for (const failure of report.failures) {
    lines.push(`## ${failure.storyId ?? failure.test} (${failure.project})`, "");
    lines.push(
      `- File: ${failure.file}${failure.exportName ? ` → \`${failure.exportName}\`` : ""}`,
    );
    lines.push(`- Kind: ${failure.kinds.join(", ")}`);
    if (failure.pixels != null && failure.bbox) {
      const [x0, y0, x1, y1] = failure.bbox;
      lines.push(`- Changed pixels: ${failure.pixels}, region x ${x0}–${x1}, y ${y0}–${y1}`);
    }
    if (failure.image) lines.push(`- Image: ${relative(path.join(reportDir, failure.image))}`);
    lines.push(`- Rerun: \`${failure.rerun}\``);
    for (const kind of failure.kinds) lines.push(`- ${KIND_ADVICE[kind]}`);
    lines.push(
      "",
      "```",
      ...failure.messages.flatMap((message) => message.split("\n")).slice(0, 60),
      "```",
      "",
    );
  }
  return `${lines.join("\n")}\n`;
}
