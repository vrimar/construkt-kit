import { gfmToMarkdown } from "mdast-util-gfm";
import { toMarkdown } from "mdast-util-to-markdown";

import { isElement, isEmptyExpression, literalAttribute } from "./mdast";
import { isExternalHref } from "./nav";
import type { MarkdownLowering, MdNode } from "./types";

interface LowerOptions {
  siteUrl: string;
  route: string;
  lowerings: Record<string, MarkdownLowering>;
  error(message: string): void;
}

const DROPPED = new Set(["mdxjsEsm", "yaml"]);

const absolute = (url: string, { siteUrl, route }: LowerOptions) => {
  if (isExternalHref(url)) return url;
  const site = siteUrl.replace(/\/+$/, "");
  if (url.startsWith("/")) return `${site}${url}`;
  return new URL(url, `${site}${route === "/" ? "" : route}/`).href;
};

const serialize = (children: MdNode[]) =>
  toMarkdown({ type: "root", children } as Parameters<typeof toMarkdown>[0], {
    extensions: [gfmToMarkdown()],
  }).trim();

const lower = (node: MdNode, options: LowerOptions): MdNode[] => {
  if (DROPPED.has(node.type) || isEmptyExpression(node)) return [];

  if (node.type === "mdxFlowExpression" || node.type === "mdxTextExpression") {
    options.error(`{${node.value ?? ""}} has no markdown form; write it as text or a component`);
    return [];
  }

  if (isElement(node)) {
    const name = node.name ?? "";
    const lowering = options.lowerings[name];
    if (!lowering) {
      options.error(`<${name}> has no markdown lowering in the docs config's \`markdown\``);
      return [];
    }

    const markdown = lowering(node, {
      children: () => serialize((node.children ?? []).flatMap((child) => lower(child, options))),
      attribute: (attributeName) => literalAttribute(node, attributeName),
    });
    return markdown ? [{ type: "html", value: markdown }] : [];
  }

  const copy: MdNode = { ...node };
  if (copy.url) copy.url = absolute(copy.url, options);
  if (node.children) copy.children = node.children.flatMap((child) => lower(child, options));
  return [copy];
};

/** The page body as plain markdown: MDX elements lowered, imports dropped, site links absolute. */
export const pageMarkdown = (tree: MdNode, options: LowerOptions) =>
  serialize((tree.children ?? []).flatMap((child) => lower(child, options)));
