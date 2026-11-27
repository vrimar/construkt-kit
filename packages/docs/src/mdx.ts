import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import type { PluggableList } from "unified";

import { remarkHeadingIds } from "./core/headingIds";

/**
 * The remark plugins a site passes to `@mdx-js/rollup`. They give headings the ids
 * `construkt-kit-docs` validates anchors against, so a site must not add its own slugger.
 */
export const remarkPlugins: PluggableList = [
  [remarkFrontmatter, ["yaml"]],
  remarkGfm,
  remarkHeadingIds,
];

export const rehypePlugins: PluggableList = [];

export { remarkHeadingIds };
