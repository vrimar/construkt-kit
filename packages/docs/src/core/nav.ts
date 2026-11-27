import type { NavBranch, NavLink, NavNode } from "./types";

/** A route without its trailing slashes, query or hash; `/` for the site root. */
export const normalizeRoute = (route: string) =>
  route.replace(/[?#].*$/, "").replace(/\/+$/, "") || "/";

export const isExternalHref = (href: string) => /^([a-z][a-z\d+.-]*:|\/\/)/i.test(href);

export const flattenLinks = (nodes: readonly NavNode[]): NavLink[] =>
  nodes.flatMap((node) => (node.kind === "link" ? [node] : flattenLinks(node.children)));

export const isNodeActive = (node: NavNode, currentRoute: string) => {
  if (node.kind === "branch" || node.external || isExternalHref(node.href)) return false;

  const current = normalizeRoute(currentRoute);
  const target = normalizeRoute(node.match ?? node.href);

  return node.match ? current === target || current.startsWith(`${target}/`) : current === target;
};

const findPath = (nodes: readonly NavNode[], currentRoute: string): NavNode[] | undefined => {
  for (const node of nodes) {
    if (node.kind === "link") {
      if (isNodeActive(node, currentRoute)) return [node];
      continue;
    }

    const path = findPath(node.children, currentRoute);
    if (path) return [node, ...path];
  }

  return undefined;
};

/** The branches leading to the active link, then the link; empty when no link is active. */
export const findActivePath = (nodes: readonly NavNode[], currentRoute: string) =>
  findPath(nodes, currentRoute) ?? [];

/** The top-level section holding the active link, if it sits in one. */
export const findActiveSection = (
  nodes: readonly NavNode[],
  currentRoute: string,
): NavBranch | undefined => {
  const [first] = findActivePath(nodes, currentRoute);
  return first?.kind === "branch" ? first : undefined;
};

/** The pages before and after the current one in nav order, skipping links that leave the nav. */
export const findNeighbours = (nodes: readonly NavNode[], currentRoute: string) => {
  const pages = flattenLinks(nodes).filter((link) => !link.external && !isExternalHref(link.href));
  const index = pages.findIndex((link) =>
    isNodeActive({ ...link, match: undefined }, currentRoute),
  );

  return {
    previous: index > 0 ? pages[index - 1] : undefined,
    next: index >= 0 && index < pages.length - 1 ? pages[index + 1] : undefined,
  };
};
