declare module "virtual:story-modules" {
  /** A loader for every story file in the story index, keyed by its path from the repo root. */
  export const storyModules: Record<string, () => Promise<Record<string, unknown>>>;
}
