const data = JSON.parse(document.getElementById("report-data").textContent);
const storageKey = `story-report:${data.finishedAt}`;
const ACCEPTABLE_KINDS = new Set(data.acceptableKinds);

const $ = (id) => document.getElementById(id);
const list = $("list");
const view = $("view");
const reasonInput = $("reason");
const commandBox = $("command");
const help = $("help");
const toast = $("toast");

const present = (node) => node != null && node !== false;
const storyCount = (count) => `${count} ${count === 1 ? "story" : "stories"}`;

function element(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value == null || value === false) continue;
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
    else node.setAttribute(key, value === true ? "" : value);
  }
  node.append(...[children].flat().filter(present));
  return node;
}

function load() {
  try {
    return JSON.parse(localStorage.getItem(storageKey) ?? "null");
  } catch {
    return null;
  }
}

const saved = load();
const state = {
  decisions: saved?.decisions ?? {},
  current: saved?.current ?? null,
  reason: saved?.reason ?? "",
  filter: saved?.filter ?? null,
  fit: false,
};

function save() {
  try {
    const { decisions, current, reason, filter } = state;
    localStorage.setItem(storageKey, JSON.stringify({ decisions, current, reason, filter }));
  } catch {
    // Without storage, as in a private window, decisions last until the page closes.
  }
}

const kindsOf = (story) => [...new Set(story.entries.flatMap((entry) => entry.kinds))];
const acceptableProjects = (story) =>
  story.entries.filter((entry) => entry.acceptable).map((entry) => entry.project);
const canAccept = (story) => acceptableProjects(story).length > 0;

function visibleStories() {
  return state.filter
    ? data.stories.filter((story) => kindsOf(story).includes(state.filter))
    : data.stories;
}

function currentIndex(stories = visibleStories()) {
  const index = stories.findIndex((story) => story.key === state.current);
  return index === -1 ? 0 : index;
}

function currentStory() {
  const stories = visibleStories();
  return stories[currentIndex(stories)] ?? null;
}

let toastTimer = 0;
function notify(message) {
  toast.textContent = message;
  toast.classList.add("shown");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("shown"), 2200);
}

function shellQuote(text) {
  return `'${text.replaceAll("'", "'\\''")}'`;
}

function acceptCommands() {
  const groups = new Map();
  for (const story of data.stories) {
    if (state.decisions[story.key] !== "accept" || !story.storyId) continue;
    const projects = acceptableProjects(story);
    if (projects.length === 0) continue;
    const key = story.entries.every((entry) => entry.acceptable) ? "" : projects.join(" ");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(story.storyId);
  }
  const reason = shellQuote(state.reason.trim());
  return [...groups].map(([projects, ids]) =>
    [
      "pnpm stories:accept",
      ...projects
        .split(" ")
        .filter(Boolean)
        .map((project) => `--project ${project}`),
      `--reason ${reason}`,
      ...ids,
    ].join(" "),
  );
}

function fixList() {
  return data.stories
    .filter((story) => state.decisions[story.key] === "reject")
    .map(
      (story) =>
        `${story.storyId ?? story.key} (${story.entries
          .map((entry) => `${entry.project}: ${entry.kinds.join(", ")}`)
          .join("; ")})`,
    );
}

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const scratch = element("textarea", { class: "offscreen" });
    scratch.value = text;
    document.body.append(scratch);
    scratch.select();
    const copied = document.execCommand("copy");
    scratch.remove();
    return copied;
  }
}

async function copyAccept() {
  const commands = acceptCommands();
  if (commands.length === 0) return notify("Nothing accepted yet: press a on a story first");
  if (!state.reason.trim()) {
    document.body.classList.remove("no-side");
    reasonInput.focus();
    return notify("Write the reason first");
  }
  const ok = await copy(commands.join("\n"));
  const count = data.stories.filter((story) => state.decisions[story.key] === "accept").length;
  notify(
    ok ? `Copied the accept command for ${storyCount(count)}` : "Copy failed: select the command",
  );
}

async function copyFix() {
  const lines = fixList();
  if (lines.length === 0) return notify("Nothing marked to fix: press x on a story first");
  const ok = await copy(lines.join("\n"));
  notify(ok ? `Copied ${storyCount(lines.length)} to fix` : "Copy failed");
}

function renderSummary() {
  $("summary").textContent =
    `${data.mode === "pixels" ? "Pixels compared" : "Functional only, no pixels"} · ` +
    `${data.passed} passed, ${data.failed} failed · ${storyCount(data.stories.length)} to review`;
}

function renderFilters() {
  const counts = new Map();
  for (const story of data.stories) {
    for (const kind of kindsOf(story)) counts.set(kind, (counts.get(kind) ?? 0) + 1);
  }
  const chip = (kind, label, count) =>
    element("button", {
      type: "button",
      class: `chip${kind ? ` k-${kind}` : ""}`,
      "aria-pressed": String(state.filter === kind),
      text: `${label} ${count}`,
      onclick: () => setFilter(kind),
    });
  $("filters").replaceChildren(
    chip(null, "All", data.stories.length),
    ...[...counts].sort((a, b) => b[1] - a[1]).map(([kind, count]) => chip(kind, kind, count)),
  );
}

function setFilter(kind) {
  state.filter = state.filter === kind ? null : kind;
  renderFilters();
  renderList();
  select(currentStory()?.key ?? null);
}

function cycleFilter() {
  const kinds = [null, ...new Set(data.stories.flatMap(kindsOf))];
  const next = kinds[(kinds.indexOf(state.filter) + 1) % kinds.length];
  state.filter = null;
  setFilter(next);
  notify(`Showing ${next ?? "every kind"}`);
}

const MARKS = { accept: "✓", reject: "✗" };

function renderList() {
  const groups = new Map();
  for (const story of visibleStories()) {
    if (!groups.has(story.group)) groups.set(story.group, []);
    groups.get(story.group).push(story);
  }
  const sections = [...groups].map(([group, stories]) =>
    element("section", {}, [
      element("h3", { text: group }),
      ...stories.map((story) =>
        element(
          "button",
          {
            type: "button",
            class: "item",
            "data-key": story.key,
            onclick: (event) => {
              select(story.key);
              event.currentTarget.blur();
            },
          },
          [
            element("span", { class: "mark", "aria-hidden": "true" }),
            element("span", { class: "name", text: story.name }),
            element(
              "span",
              { class: "devices" },
              story.entries.map((entry) =>
                element("span", {
                  class: `device k-${entry.kinds.find((kind) => !ACCEPTABLE_KINDS.has(kind)) ?? entry.kinds[0]}`,
                  title: `${entry.project}: ${entry.kinds.join(", ")}`,
                  text: entry.project[0].toUpperCase(),
                }),
              ),
            ),
          ],
        ),
      ),
    ]),
  );
  list.replaceChildren(
    ...(sections.length ? sections : [element("p", { class: "muted", text: "Nothing to show." })]),
  );
  refreshMarks();
}

function refreshMarks() {
  for (const item of list.querySelectorAll(".item")) {
    const decision = state.decisions[item.dataset.key];
    item.dataset.decision = decision ?? "";
    item.querySelector(".mark").textContent = MARKS[decision] ?? "·";
    if (item.dataset.key === state.current) item.setAttribute("aria-current", "true");
    else item.removeAttribute("aria-current");
  }
  const decided = Object.values(state.decisions);
  const accepted = decided.filter((decision) => decision === "accept").length;
  const rejected = decided.filter((decision) => decision === "reject").length;
  const stories = visibleStories();
  $("progress").textContent =
    `${stories.length ? currentIndex(stories) + 1 : 0} / ${stories.length} · ` +
    `${accepted} accepted · ${rejected} to fix · ${data.stories.length - accepted - rejected} left`;
  const commands = acceptCommands();
  commandBox.textContent = commands.length
    ? commands.join("\n")
    : "Accept stories with a; the command to commit their baselines appears here.";
}

function figure(entry) {
  const shot = (src, alt, caption) =>
    element("figure", {}, [
      element("a", { href: src, target: "_blank", rel: "noopener" }, [
        element("img", { src, alt, loading: "eager" }),
      ]),
      element("figcaption", { class: "muted", text: caption }),
    ]);
  if (entry.image) {
    return shot(
      entry.image,
      `${entry.project} reference, actual and diff`,
      "reference | actual | diff",
    );
  }
  if (entry.actual) {
    const caption = entry.kinds.includes("missing-baseline")
      ? "actual · no baseline yet"
      : "actual";
    return shot(entry.actual, `${entry.project} actual`, caption);
  }
  return element("p", { class: "muted", text: "No screenshot for this failure." });
}

function entryPanel(entry) {
  const links = [
    entry.actual && element("a", { href: entry.actual, target: "_blank", text: "full actual" }),
    entry.baseline &&
      element("a", { href: entry.baseline, target: "_blank", text: "full baseline" }),
  ].filter(Boolean);
  const blocking = entry.kinds.filter((kind) => !ACCEPTABLE_KINDS.has(kind));
  return element("section", { class: `entry ${entry.project}${entry.image ? " wide" : ""}` }, [
    element("header", {}, [
      element("h3", { text: entry.project }),
      ...entry.kinds.map((kind) => element("span", { class: `badge k-${kind}`, text: kind })),
      entry.pixels != null &&
        element("span", { class: "muted", text: `${entry.pixels.toLocaleString()} px changed` }),
      links.length > 0 && element("span", { class: "links" }, links),
    ]),
    figure(entry),
    blocking.length > 0 &&
      element(
        "div",
        { class: "advice" },
        blocking.map((kind) => element("p", { text: data.advice[kind] })),
      ),
    element("details", { open: blocking.length > 0 }, [
      element("summary", { text: "Messages and rerun" }),
      element("pre", { text: `${entry.rerun}\n\n${entry.messages.join("\n\n")}` }),
    ]),
  ]);
}

function renderView() {
  const story = currentStory();
  if (!story) {
    view.replaceChildren(
      element("p", { class: "empty", text: "No failures. Every story passed." }),
    );
    return;
  }
  const decision = state.decisions[story.key];
  const projects = acceptableProjects(story);
  const partial = projects.length > 0 && projects.length < story.entries.length;
  view.classList.toggle("fit", state.fit);
  const nodes = [
    element("header", { class: "story" }, [
      element("div", {}, [
        element("h2", { text: story.storyId ?? story.name }),
        element("p", {
          class: "muted",
          text: `${story.file}${story.exportName ? ` → ${story.exportName}` : ""}`,
        }),
      ]),
      element("div", { class: "decide" }, [
        element("button", {
          type: "button",
          class: "accept-button",
          "aria-pressed": String(decision === "accept"),
          disabled: !canAccept(story),
          onclick: () => decide("accept"),
          text: "Accept",
        }),
        element("button", {
          type: "button",
          class: "reject-button",
          "aria-pressed": String(decision === "reject"),
          onclick: () => decide("reject"),
          text: "Needs fix",
        }),
      ]),
    ]),
    !canAccept(story) &&
      element("p", { class: "note", text: "Can't be accepted: fix the failures below first." }),
    partial &&
      element("p", {
        class: "note",
        text: `Accepting takes ${projects.join(" and ")} only; the other device has to be fixed first.`,
      }),
    element("div", { class: "entries" }, story.entries.map(entryPanel)),
  ];
  view.replaceChildren(...nodes.filter(present));
  prefetch(1);
}

function prefetch(step) {
  const stories = visibleStories();
  const next = stories[currentIndex(stories) + step];
  for (const entry of next?.entries ?? []) {
    const src = entry.image ?? entry.actual;
    if (src) new Image().src = src;
  }
}

function select(key) {
  state.current = key;
  save();
  refreshMarks();
  renderView();
  list.querySelector(`[aria-current="true"]`)?.scrollIntoView({ block: "nearest" });
  window.scrollTo({ top: 0 });
}

function move(step) {
  const stories = visibleStories();
  if (stories.length === 0) return;
  const index = Math.min(stories.length - 1, Math.max(0, currentIndex(stories) + step));
  select(stories[index].key);
}

function jump(index) {
  const stories = visibleStories();
  if (stories.length) select(stories.at(index).key);
}

function nextUndecided() {
  const stories = visibleStories();
  const start = currentIndex(stories);
  for (let offset = 1; offset <= stories.length; offset++) {
    const story = stories[(start + offset) % stories.length];
    if (!state.decisions[story.key]) return select(story.key);
  }
  notify("Every story here has a decision");
}

function decide(decision) {
  const story = currentStory();
  if (!story) return;
  if (decision === "accept" && !canAccept(story)) {
    return notify(`Can't accept ${story.storyId ?? story.name}: fix it first`);
  }
  state.decisions[story.key] = decision;
  save();
  move(1);
}

function clearDecision() {
  const story = currentStory();
  if (!story) return;
  delete state.decisions[story.key];
  save();
  refreshMarks();
  renderView();
}

function acceptRest() {
  const pending = visibleStories().filter(
    (story) => !state.decisions[story.key] && canAccept(story),
  );
  if (pending.length === 0) return notify("Nothing left here that can be accepted");
  if (
    !confirm(
      `Accept the ${storyCount(pending.length)} shown that are undecided and can be accepted?`,
    )
  )
    return;
  for (const story of pending) state.decisions[story.key] = "accept";
  save();
  refreshMarks();
  renderView();
  notify(`Accepted ${storyCount(pending.length)}`);
}

function toggleFit() {
  state.fit = !state.fit;
  view.classList.toggle("fit", state.fit);
  notify(state.fit ? "Screenshots fit the window" : "Screenshots at actual size");
}

function toggleList() {
  document.body.classList.toggle("no-side");
}

function toggleHelp() {
  if (help.open) help.close();
  else help.showModal();
}

const KEYS = [
  [["j", "ArrowDown", "ArrowRight"], "Next story", () => move(1)],
  [["k", "ArrowUp", "ArrowLeft"], "Previous story", () => move(-1)],
  [["n"], "Next story without a decision", nextUndecided],
  [["g", "G"], "First / last story", null],
  [["a"], "Accept and move on", () => decide("accept")],
  [["x"], "Needs fix and move on", () => decide("reject")],
  [["u"], "Clear the decision", clearDecision],
  [["A"], "Accept every undecided story shown", acceptRest],
  [["z"], "Fit to window / actual size", toggleFit],
  [["s"], "Hide / show the list", toggleList],
  [["f"], "Cycle the kind filter", cycleFilter],
  [["c"], "Copy the accept command", copyAccept],
  [["?"], "Show these keys", toggleHelp],
];

const actions = new Map(KEYS.flatMap(([keys, , action]) => keys.map((key) => [key, action])));
actions.set("g", () => jump(0));
actions.set("G", () => jump(-1));

document.addEventListener("keydown", (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  const target = event.target;
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
    if (event.key === "Escape" || event.key === "Enter") target.blur();
    return;
  }
  if (help.open) {
    if (event.key === "?") {
      event.preventDefault();
      help.close();
    }
    return;
  }
  const action = actions.get(event.key);
  if (!action) return;
  event.preventDefault();
  action();
});

$("help-keys").replaceChildren(
  ...KEYS.flatMap(([keys, label]) => [
    element(
      "dt",
      {},
      keys.map((key) =>
        element("kbd", {
          text: { ArrowDown: "↓", ArrowUp: "↑", ArrowLeft: "←", ArrowRight: "→" }[key] ?? key,
        }),
      ),
    ),
    element("dd", { text: label }),
  ]),
);
$("help-button").addEventListener("click", toggleHelp);
$("copy-accept").addEventListener("click", () => void copyAccept());
$("copy-fix").addEventListener("click", () => void copyFix());
reasonInput.value = state.reason;
reasonInput.addEventListener("input", () => {
  state.reason = reasonInput.value;
  save();
  refreshMarks();
});

renderSummary();
renderFilters();
renderList();
select(currentStory()?.key ?? null);
