import { slug } from "github-slugger";
import { toString as mdastToString } from "mdast-util-to-string";

import type { MdNode } from "./types";

const EXPLICIT_ID = /\s*\[#([A-Za-z][\w-]*)\]\s*$/;

export interface HeadingIdData {
  id: string;
  explicit: boolean;
  hProperties?: Record<string, unknown>;
}

const takeExplicitId = (heading: MdNode) => {
  const last = heading.children?.at(-1);
  if (last?.type !== "text" || typeof last.value !== "string") return undefined;

  const match = EXPLICIT_ID.exec(last.value);
  if (!match) return undefined;

  last.value = last.value.slice(0, match.index).trimEnd();
  if (!last.value) heading.children?.pop();

  return match[1];
};

const walkHeadings = (node: MdNode, visit: (heading: MdNode) => void) => {
  if (node.type === "heading") visit(node);
  for (const child of node.children ?? []) walkHeadings(child, visit);
};

/**
 * Gives every heading an `id`: `## Text [#id]` keeps `id` and drops the suffix from the text;
 * any other heading gets its GitHub slug, `-1`, `-2`… on repeats. The CLI validates anchors
 * against these same ids, so the renderer must run this plugin too.
 */
export const remarkHeadingIds = () => (tree: MdNode) => {
  const used = new Set<string>();
  const unique = (base: string) => {
    let id = base;
    for (let n = 1; used.has(id); n++) id = `${base}-${n}`;
    return id;
  };

  walkHeadings(tree, (heading) => {
    const explicit = takeExplicitId(heading);
    const id = explicit ?? unique(slug(mdastToString(heading)) || "section");
    used.add(id);

    const data = (heading.data ??= {});
    const hProperties = (data.hProperties as Record<string, unknown> | undefined) ?? {};
    data.hProperties = { ...hProperties, id };
    data.headingId = { id, explicit: explicit !== undefined } satisfies HeadingIdData;
  });
};

export const headingIdOf = (heading: MdNode) =>
  (heading.data?.headingId as HeadingIdData | undefined)?.id;
