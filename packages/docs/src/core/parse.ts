import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { parse as parseYaml } from "yaml";

import { remarkHeadingIds } from "./headingIds";
import type { MdNode } from "./types";

const processor = unified()
  .use(remarkParse)
  .use(remarkMdx)
  .use(remarkFrontmatter, ["yaml"])
  .use(remarkGfm)
  .use(remarkHeadingIds);

/** The page's syntax tree with heading ids applied, as the site's MDX build will see it. */
export const parseMdx = async (source: string) =>
  (await processor.run(processor.parse(source))) as unknown as MdNode;

export const readFrontmatter = (tree: MdNode): unknown => {
  const yaml = tree.children?.find((node) => node.type === "yaml");
  return yaml?.value ? parseYaml(yaml.value) : {};
};
