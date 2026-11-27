import type { DocsConfig } from "./core/types";

/** Types a `docs.config.ts` default export for `construkt-kit-docs`. */
export const defineDocsConfig = (config: DocsConfig): DocsConfig => config;

export {
  findElements,
  hasAttribute,
  integerAttribute,
  isElement,
  literalAttribute,
  objectAttribute,
  textOf,
} from "./core/mdast";
export { flattenLinks, isExternalHref, normalizeRoute } from "./core/nav";
export type {
  DocsConfig,
  DocsHeading,
  DocsManifest,
  DocsPageEntry,
  DocsPlugin,
  DocsPluginContext,
  DocsRoot,
  DocsSearchDoc,
  DocsSourcePage,
  MarkdownHelpers,
  MarkdownLowering,
  MdAttribute,
  MdNode,
  NavBranch,
  NavIcon,
  NavLink,
  NavNode,
  StandardSchemaV1,
} from "./core/types";
