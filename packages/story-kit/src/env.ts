/** The pinned browser's endpoint; `story-kit test` sets it when Docker could start the container. */
export function browserEndpoint(): string | undefined {
  return process.env.STORIES_BROWSER_WS || undefined;
}

/** Whether this run compares screenshots, which happens only in the pinned browser. */
export function isPixelRun(): boolean {
  return browserEndpoint() !== undefined;
}

/** Playwright arguments that would rewrite snapshots, which a story run refuses. */
export const UPDATE_FLAGS = /^(-u|--update-snapshots)(=.*)?$/;

export const UPDATE_REFUSED =
  "Snapshot updates are refused. Fix the code, or, for an intended change:\n" +
  "  screenshots: report the story ids to the owner; once they say accept, `pnpm stories:accept`\n" +
  "  accessibility snapshots: `pnpm stories:aria <story ids>`";
