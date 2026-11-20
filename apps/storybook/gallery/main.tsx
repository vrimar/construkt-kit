import { type StoryId, stories } from "@construkt-kit/story-kit/story-ids";

interface ComposedStory {
  parameters: {
    layout?: string;
    a11y?: { config?: { rules?: { id: string; enabled?: boolean }[] } };
  };
  args: Record<string, unknown>;
  globals: Record<string, unknown> & { a11y?: Record<string, unknown> };
}

interface FactoryStory {
  composed: ComposedStory;
  run(context?: Record<string, unknown>): Promise<void>;
}

interface GalleryApi {
  id?: string;
  error?: string;
  a11yRules?: string[];
  calls(arg: string): unknown[][];
}

declare global {
  interface Window {
    __gallery?: GalleryApi;
  }
}

const modules = import.meta.glob<Record<string, FactoryStory | undefined>>([
  "../../../packages/{ui,pages,data-grid}/src/**/*.stories.tsx",
  "../stories/**/*.stories.tsx",
]);

function toJson(value: unknown, seen = new WeakSet<object>()): unknown {
  if (typeof value === "function") return "[function]";
  if (value instanceof Node) return `[${value.nodeName.toLowerCase()}]`;
  if (value instanceof Window) return "[window]";
  if (value instanceof Event) return { type: value.type };
  if (typeof value === "object" && value !== null && "nativeEvent" in value && "type" in value) {
    return { type: value.type };
  }
  if (value instanceof Date) return value.toISOString();
  if (value === null || typeof value !== "object") return value;
  if (seen.has(value)) return "[circular]";
  seen.add(value);
  if (Array.isArray(value)) return value.map((item) => toJson(item, seen));
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, toJson(item, seen)]));
}

function nextFrames(count: number): Promise<void> {
  return new Promise((resolve) => {
    const step = (left: number) =>
      left === 0 ? resolve() : requestAnimationFrame(() => step(left - 1));
    step(count);
  });
}

function recordedCalls(args: Record<string, unknown>, name: string): unknown[][] {
  const spy = args[name] as { mock?: { calls: unknown[][] } } | undefined;
  if (!spy?.mock) throw new Error(`Story arg "${name}" is not a fn() spy.`);
  return toJson(spy.mock.calls) as unknown[][];
}

async function render(root: HTMLElement) {
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  if (id == null || !(id in stories)) throw new Error(`Unknown story id "${id}".`);

  const entry = stories[id as StoryId];
  const modulePath = entry.file.startsWith("apps/storybook/")
    ? `../${entry.file.slice("apps/storybook/".length)}`
    : `../../../${entry.file}`;
  const load = modules[modulePath];
  if (!load) throw new Error(`The gallery cannot load ${entry.file}.`);
  const story = (await load())[entry.exportName];
  if (!story?.composed) throw new Error(`${entry.file} has no story export ${entry.exportName}.`);

  const { parameters, args, globals } = story.composed;
  document.body.classList.add(`sb-main-${parameters.layout ?? "padded"}`);
  await document.fonts.load('16px "Inter Variable"');
  const theme = params.get("theme");
  await story.run({
    canvasElement: root,
    globals: {
      ...globals,
      ...(theme ? { theme } : {}),
      // The harness runs axe itself; the addon's own scan would double it.
      a11y: { ...globals.a11y, manual: true },
    },
  });
  await document.fonts.ready;
  await nextFrames(2);

  window.__gallery = {
    id,
    a11yRules: (parameters.a11y?.config?.rules ?? [])
      .filter((rule) => rule.enabled === false)
      .map((rule) => rule.id),
    calls: (name) => recordedCalls(args, name),
  };
}

const root = document.getElementById("storybook-root");
if (!root) throw new Error("The gallery page has no #storybook-root.");

render(root).then(
  () => {
    document.documentElement.dataset.gallery = "ready";
  },
  (error: unknown) => {
    window.__gallery = {
      error: error instanceof Error ? (error.stack ?? error.message) : String(error),
      calls: () => [],
    };
    document.documentElement.dataset.gallery = "error";
  },
);
