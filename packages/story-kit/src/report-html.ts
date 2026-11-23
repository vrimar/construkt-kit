import fs from "node:fs";
import path from "node:path";

import { baselineFile, reportDir } from "./paths.ts";
import {
  ACCEPTABLE,
  type FailureKind,
  KIND_ADVICE,
  type StoryFailure,
  type StoryReport,
} from "./report.ts";

interface PageEntry {
  project: string;
  kinds: FailureKind[];
  acceptable: boolean;
  image: string | null;
  actual: string | null;
  baseline: string | null;
  pixels: number | null;
  messages: string[];
  rerun: string;
}

interface PageStory {
  key: string;
  storyId: string | null;
  group: string;
  name: string;
  file: string;
  exportName: string | null;
  entries: PageEntry[];
}

function asset(name: string) {
  return fs.readFileSync(new URL(`./${name}`, import.meta.url), "utf8");
}

function storyOf(failure: StoryFailure): Omit<PageStory, "entries"> {
  if (!failure.storyId) {
    return {
      key: `${failure.file} › ${failure.test}`,
      storyId: null,
      group: "specs",
      name: failure.test,
      file: failure.file,
      exportName: null,
    };
  }
  const [group, name = failure.storyId] = failure.storyId.split("--");
  return {
    key: failure.storyId,
    storyId: failure.storyId,
    group,
    name,
    file: failure.file,
    exportName: failure.exportName,
  };
}

/** A self-contained page for reviewing a run's failures in a browser, one story at a time. */
export function renderHtml(report: StoryReport) {
  const stories = new Map<string, PageStory>();
  for (const failure of report.failures) {
    const story = storyOf(failure);
    const baseline = failure.storyId ? baselineFile(failure.project, failure.storyId) : null;
    const entry: PageEntry = {
      project: failure.project,
      kinds: failure.kinds,
      acceptable: failure.storyId != null && failure.kinds.every((kind) => ACCEPTABLE.has(kind)),
      image: failure.image,
      actual: failure.actual,
      baseline: baseline && fs.existsSync(baseline) ? path.relative(reportDir, baseline) : null,
      pixels: failure.pixels,
      messages: failure.messages,
      rerun: failure.rerun,
    };
    const existing = stories.get(story.key);
    if (existing) existing.entries.push(entry);
    else stories.set(story.key, { ...story, entries: [entry] });
  }
  const data = {
    mode: report.mode,
    finishedAt: report.finishedAt,
    passed: report.passed,
    failed: report.failed,
    skipped: report.skipped,
    acceptableKinds: [...ACCEPTABLE],
    advice: KIND_ADVICE,
    stories: [...stories.values()]
      .map((story) => ({
        ...story,
        entries: story.entries.sort((a, b) => a.project.localeCompare(b.project)),
      }))
      .sort((a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name)),
  };
  const json = JSON.stringify(data).replaceAll("<", "\\u003c");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Story report</title>
<style>${asset("report-page.css")}</style>
</head>
<body>
<header class="bar">
  <strong>Story report</strong>
  <span id="summary" class="muted"></span>
  <div id="filters" class="filters" role="group" aria-label="Filter by kind"></div>
  <span id="progress" class="progress"></span>
  <button id="help-button" type="button">Keys <kbd>?</kbd></button>
</header>
<div class="layout">
  <aside class="side">
    <nav id="list" class="list" aria-label="Failed stories"></nav>
    <section class="accept" aria-label="Accept">
      <label for="reason">Reason for accepting</label>
      <input id="reason" type="text" placeholder="What changed and why" autocomplete="off">
      <div class="row">
        <button id="copy-accept" type="button">Copy accept command <kbd>c</kbd></button>
        <button id="copy-fix" type="button">Copy ids to fix</button>
      </div>
      <pre id="command"></pre>
    </section>
  </aside>
  <main id="view" class="view"></main>
</div>
<dialog id="help" aria-labelledby="help-title">
  <h2 id="help-title">Keys</h2>
  <dl id="help-keys"></dl>
  <form method="dialog"><button type="submit">Close <kbd>Esc</kbd></button></form>
</dialog>
<div id="toast" class="toast" role="status" aria-live="polite"></div>
<script type="application/json" id="report-data">${json}</script>
<script type="module">${asset("report-page.js")}</script>
</body>
</html>
`;
}
