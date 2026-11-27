export type NavIcon = (props: { "aria-hidden"?: boolean }) => unknown;

export interface NavLink {
  kind: "link";
  id: string;
  title: string;
  href: string;
  /** Marks the link active for this route and every route below it, instead of `href`. */
  match?: string;
  /** Not a page of this nav's root: the pager skips it and the tree marks it as leaving. */
  external?: boolean;
}

export interface NavBranch {
  kind: "branch";
  id: string;
  title: string;
  children: NavNode[];
  /** Drawn before the title when the branch heads a sidebar section. */
  icon?: NavIcon;
}

export type NavNode = NavLink | NavBranch;

export interface DocsHeading {
  id: string;
  text: string;
  depth: number;
}

export interface DocsPageEntry {
  route: string;
  title: string;
  description?: string;
  frontmatter: Record<string, unknown>;
  headings: DocsHeading[];
  excerpt: string;
  /** Routes of the pages linking this one, in nav order. */
  backlinks: string[];
  /** ISO date of the last commit touching the page's source; absent when it is uncommitted. */
  lastModified?: string;
  /** URL path of the page's markdown copy. */
  markdown: string;
}

/** Every page, keyed by its route without a trailing slash. */
export type DocsManifest = Record<string, DocsPageEntry>;

export interface DocsSearchDoc {
  id: string;
  route: string;
  anchor?: string;
  /** Where the result leads, when that is not `route#anchor`. */
  href?: string;
  title: string;
  heading: string;
  /** Level of `heading`, 2 for an h2; absent on the page's own doc. */
  depth?: number;
  /** Title of the top-level nav branch holding the page, if it sits in one. */
  section?: string;
  text: string;
  /** Other words readers search for, from the page's `aliases` frontmatter; on the page's own doc. */
  aliases?: string[];
}

export interface MdAttribute {
  type: string;
  name?: string;
  value?: unknown;
}

export interface MdNode {
  type: string;
  depth?: number;
  url?: string;
  value?: string;
  name?: string | null;
  attributes?: MdAttribute[];
  children?: MdNode[];
  data?: Record<string, unknown>;
}

export interface MarkdownHelpers {
  /** The element's children as markdown. */
  children(): string;
  attribute(name: string): string | undefined;
}

/** Writes an MDX element as plain markdown for the `.md` copies and `llms-full.txt`. */
export type MarkdownLowering = (node: MdNode, helpers: MarkdownHelpers) => string;

export interface DocsSourcePage {
  route: string;
  file: string;
  title: string;
  frontmatter: Record<string, unknown>;
}

export interface DocsPluginContext {
  error(message: string): void;
  warn(message: string): void;
  /** Pages parsed so far; every page once `finish` runs. */
  pages: ReadonlyMap<string, DocsPageEntry>;
  dev: boolean;
  /** The directory holding the config file; relative paths resolve against it. */
  cwd: string;
}

export interface DocsPlugin {
  name: string;
  check?(page: DocsSourcePage, tree: MdNode, ctx: DocsPluginContext): void | Promise<void>;
  /** Search text for an MDX element the default text extraction would leave empty or wrong. */
  text?(node: MdNode): string | undefined;
  finish?(ctx: DocsPluginContext): void | Promise<void>;
}

export interface StandardSchemaIssue {
  message: string;
  path?: ReadonlyArray<PropertyKey | { key: PropertyKey }>;
}

export type StandardSchemaResult<Output> =
  | { value: Output; issues?: undefined }
  | { issues: ReadonlyArray<StandardSchemaIssue> };

export interface StandardSchemaV1<Output = unknown> {
  readonly "~standard": {
    readonly version: 1;
    readonly vendor: string;
    readonly validate: (
      value: unknown,
    ) => StandardSchemaResult<Output> | Promise<StandardSchemaResult<Output>>;
  };
}

export interface DocsRoot {
  /** Directory of the root's MDX pages. */
  contentDir: string;
  /** Route prefix of the root's pages: `"/docs"`, or `""` for pages at the site root. */
  base: string;
  /** Directory the generated route files go in, inside `routesRoot`. */
  routesDir: string;
  nav: NavNode[];
  /** Heading for the root's top-level pages in `llms.txt`. */
  title?: string;
}

export interface DocsConfig {
  roots: DocsRoot[];
  /** Import specifier the generated route files take `pageHead(route)` from. */
  headModule: string;
  manifestPath: string;
  /** URL path of the search index; the file is written under `publicDir`. */
  searchIndexPath: string;
  publicDir: string;
  /** Origin the `llms.txt` links and markdown copies point at. */
  siteUrl: string;
  /** TanStack Router's routes directory. Default `src/routes`. */
  routesRoot?: string;
  /**
   * Routes outside the docs that pages may link to. When given, every internal link must
   * resolve to a page, a hand-written route or one of these.
   */
  knownRoutes?: string[];
  frontmatter?: StandardSchemaV1<Record<string, unknown>>;
  plugins?: DocsPlugin[];
  /** Markdown for each MDX element a page uses; an element without one fails the build. */
  markdown?: Record<string, MarkdownLowering>;
  llms?: { title: string; description?: string };
  /** Extra files or directories `--dev` reloads the config on, such as the nav modules. */
  watch?: string[];
}
