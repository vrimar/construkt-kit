import { readdir, readFile, rm } from "node:fs/promises";
import path from "node:path";

import { lastCommitDates } from "./git";
import { headingIdOf } from "./headingIds";
import { pageMarkdown } from "./markdown";
import { textOf } from "./mdast";
import { flattenLinks, isExternalHref, normalizeRoute } from "./nav";
import { parseMdx, readFrontmatter } from "./parse";
import {
  type RoutePage,
  clashesWith,
  handWrittenRoutes,
  routeFileFor,
  routeUrlOf,
  writeRouteFiles,
} from "./routes";
import type {
  DocsConfig,
  DocsHeading,
  DocsManifest,
  DocsPageEntry,
  DocsPluginContext,
  DocsSearchDoc,
  MdNode,
  NavLink,
  NavNode,
} from "./types";
import { writeIfChanged } from "./write";

export interface BuildOptions {
  /** The directory holding the config file. */
  cwd: string;
  dev: boolean;
}

export interface BuildResult {
  errors: string[];
  warnings: string[];
  pages: number;
  sections: number;
}

interface SourcePage {
  route: string;
  file: string;
  root: number;
  link: NavLink;
  routeFile: string;
}

interface ParsedPage {
  source: SourcePage;
  tree: MdNode;
  entry: DocsPageEntry;
  links: string[];
}

const EXCERPT_LENGTH = 180;
const FILE_EXTENSION = /\.[a-z\d]+$/i;

const toPosix = (value: string) => value.split(path.sep).join("/");

const truncate = (text: string, length: number) =>
  text.length <= length ? text : `${text.slice(0, length - 1).trimEnd()}…`;

const joinRoute = (base: string, slug: string) => normalizeRoute(`${base}/${slug}`);

/** The page's `aliases` frontmatter: undefined when absent, null when not a list of words. */
const aliasesOf = (value: unknown) => {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) return null;
  const words = value.map((word) => (typeof word === "string" ? word.trim() : ""));
  return words.every(Boolean) && words.length ? words : null;
};

const markdownPathOf = (route: string) => (route === "/" ? "/index.md" : `${route}.md`);

const listMdx = async (dir: string) => {
  try {
    const entries = await readdir(dir, { recursive: true, withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
      .map((entry) => path.join(entry.parentPath, entry.name))
      .sort();
  } catch {
    return undefined;
  }
};

const collectLinks = (node: MdNode, found: string[]) => {
  if ((node.type === "link" || node.type === "definition") && node.url) found.push(node.url);
  for (const child of node.children ?? []) collectLinks(child, found);
  return found;
};

const collectHeadingIds = (
  node: MdNode,
  found = { ids: new Set<string>(), repeated: new Set<string>() },
) => {
  const id = node.type === "heading" ? headingIdOf(node) : undefined;
  if (id) (found.ids.has(id) ? found.repeated : found.ids).add(id);
  for (const child of node.children ?? []) collectHeadingIds(child, found);
  return found;
};

const decoded = (value: string, decode: (value: string) => string) => {
  try {
    return decode(value);
  } catch {
    return value;
  }
};

const navOrder = (config: DocsConfig) =>
  new Map(
    config.roots
      .flatMap((root) => flattenLinks(root.nav))
      .map((link, index) => [normalizeRoute(link.href), index] as const),
  );

export const buildDocs = async (config: DocsConfig, { cwd, dev }: BuildOptions) => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const resolve = (value: string) => path.resolve(cwd, value);
  const relative = (file: string) => toPosix(path.relative(cwd, file));
  const routesRoot = resolve(config.routesRoot ?? "src/routes");
  const publicDir = resolve(config.publicDir);

  const sources: SourcePage[] = [];
  const byRoute = new Map<string, SourcePage>();

  for (const [rootIndex, root] of config.roots.entries()) {
    const contentDir = resolve(root.contentDir);
    const files = await listMdx(contentDir);
    if (!files) {
      errors.push(`${root.contentDir} does not exist`);
      continue;
    }

    const links = new Map(
      flattenLinks(root.nav)
        .filter((link) => !link.external && !isExternalHref(link.href))
        .map((link) => [normalizeRoute(link.href), link] as const),
    );

    for (const file of files) {
      const page = toPosix(path.relative(contentDir, file)).replace(/\.mdx$/, "");
      const route = joinRoute(root.base, page.replace(/(^|\/)index$/, ""));
      const link = links.get(route);

      if (!link) {
        errors.push(`${relative(file)} is not in the nav: add a link to ${route}/`);
        continue;
      }
      const taken = byRoute.get(route);
      if (taken) {
        errors.push(`${relative(file)} and ${relative(taken.file)} both serve ${route}/`);
        continue;
      }

      const routeFile = routeFileFor(resolve(root.routesDir), page);
      const served = routeUrlOf(routesRoot, routeFile);
      if (served !== route)
        errors.push(
          `${relative(file)}: its route file ${relative(routeFile)} would serve ${served === undefined ? "no URL of its own" : `${served}/`}, not ${route}/`,
        );

      const source = { route, file, root: rootIndex, link, routeFile };
      sources.push(source);
      byRoute.set(route, source);
    }
  }

  const handWritten = (
    await Promise.all(
      config.roots.map((root) => handWrittenRoutes(routesRoot, resolve(root.routesDir))),
    )
  ).flat();
  for (const source of sources) {
    for (const hand of handWritten) {
      if (hand.route === source.route && clashesWith(hand, routesRoot, source.routeFile))
        errors.push(
          `${relative(source.file)} serves ${source.route}/, which the hand-written ${relative(hand.file)} serves too`,
        );
    }
  }
  const known = new Set([
    ...handWritten.map((hand) => hand.route),
    ...(config.knownRoutes ?? []).map(normalizeRoute),
  ]);
  const bases = config.roots
    .map((root) => normalizeRoute(root.base))
    .filter((base) => base !== "/");
  const underBase = (route: string) =>
    bases.some((base) => route === base || route.startsWith(`${base}/`));

  const resolvesTo = (route: string) => byRoute.has(route) || known.has(route);

  for (const root of config.roots) {
    for (const link of flattenLinks(root.nav)) {
      if (isExternalHref(link.href)) continue;
      const route = normalizeRoute(link.href);
      if (!resolvesTo(route) && (link.external ? config.knownRoutes : true))
        errors.push(`the nav links ${link.href}, but no page or route serves it`);
    }
  }

  const pages = new Map<string, DocsPageEntry>();
  const anchors = new Map<string, Set<string>>();
  const ctx: DocsPluginContext = {
    error: (message) => errors.push(message),
    warn: (message) => warnings.push(message),
    pages,
    dev,
    cwd,
  };
  const elementText = (node: MdNode) => {
    for (const plugin of config.plugins ?? []) {
      const text = plugin.text?.(node);
      if (text !== undefined) return text;
    }
    return undefined;
  };

  const parsed: ParsedPage[] = [];
  const searchDocs: DocsSearchDoc[] = [];
  const rootDates = await Promise.all(
    config.roots.map((root, index) =>
      lastCommitDates(
        resolve(root.contentDir),
        sources.filter((source) => source.root === index).map((source) => source.file),
      ),
    ),
  );
  for (const [index, dates] of rootDates.entries()) {
    if (!dates)
      warnings.push(
        `${config.roots[index]?.contentDir} is in a shallow git clone, so its pages get no lastModified; check out the full history`,
      );
  }
  const commitDates = new Map(rootDates.flatMap((dates) => [...(dates ?? [])]));

  for (const source of sources) {
    const file = relative(source.file);
    const tree = await parseMdx(await readFile(source.file, "utf8")).catch((error: Error) => {
      errors.push(`${file}: ${error.message}`);
      return undefined;
    });
    if (!tree) continue;

    let frontmatter: Record<string, unknown>;
    try {
      frontmatter = readFrontmatter(tree) as Record<string, unknown>;
    } catch (error) {
      errors.push(`${file}: frontmatter: ${(error as Error).message}`);
      continue;
    }
    if (config.frontmatter) {
      const result = await config.frontmatter["~standard"].validate(frontmatter ?? {});
      if (result.issues) {
        for (const issue of result.issues) {
          const at = (issue.path ?? [])
            .map((segment) => String(typeof segment === "object" ? segment.key : segment))
            .join(".");
          errors.push(`${file}: frontmatter${at ? ` ${at}` : ""}: ${issue.message}`);
        }
      } else frontmatter = result.value;
    }
    frontmatter ??= {};

    const aliases = aliasesOf(frontmatter.aliases);
    if (aliases === null) errors.push(`${file}: frontmatter aliases: must be a list of words`);

    const title = source.link.title;
    const top = config.roots[source.root]?.nav.find(
      (node) => node.kind === "branch" && flattenLinks(node.children).includes(source.link),
    );
    const section = top?.kind === "branch" ? top.title : undefined;
    const headings: DocsHeading[] = [];
    const headingIds = collectHeadingIds(tree);
    for (const id of headingIds.repeated) errors.push(`${file}: two headings have the id #${id}`);
    let heading = "";
    let depth: number | undefined;
    let anchor = "";
    let buffer: string[] = [];
    let excerpt = "";

    const flush = () => {
      const text = buffer.join(" ").replace(/\s+/g, " ").trim();
      const pageAliases = anchor ? undefined : (aliases ?? undefined);
      buffer = [];
      if (!text && !heading && !pageAliases) return;
      searchDocs.push({
        id: anchor ? `${source.route}#${anchor}` : source.route,
        route: source.route,
        anchor: anchor || undefined,
        title,
        heading,
        ...(depth === undefined ? {} : { depth }),
        ...(section ? { section } : {}),
        text,
        ...(pageAliases ? { aliases: pageAliases } : {}),
      });
    };

    for (const node of tree.children ?? []) {
      if (node.type === "heading") {
        if (node.depth === 1) {
          errors.push(`${file}: the page body has an h1; the title comes from the nav`);
          continue;
        }

        flush();
        heading = textOf(node, elementText).trim();
        depth = node.depth ?? 2;
        anchor = headingIdOf(node) ?? "";
        headings.push({ id: anchor, text: heading, depth });
        continue;
      }

      const text = textOf(node, elementText).replace(/\s+/g, " ").trim();
      if (text) buffer.push(text);
      if (!excerpt && node.type === "paragraph" && text) excerpt = truncate(text, EXCERPT_LENGTH);
    }
    flush();

    const description =
      typeof frontmatter.description === "string" ? frontmatter.description : undefined;
    const entry: DocsPageEntry = {
      route: source.route,
      title,
      ...(description ? { description } : {}),
      frontmatter,
      headings,
      excerpt,
      backlinks: [],
      ...(() => {
        const lastModified = commitDates.get(source.file);
        return lastModified ? { lastModified } : {};
      })(),
      markdown: markdownPathOf(source.route),
    };
    pages.set(source.route, entry);
    anchors.set(source.route, headingIds.ids);
    parsed.push({ source, tree, entry, links: collectLinks(tree, []) });

    for (const plugin of config.plugins ?? [])
      await plugin.check?.(
        { route: source.route, file: source.file, title, frontmatter },
        tree,
        ctx,
      );
  }

  const linkers = new Map<string, Set<string>>();
  const checkLink = (from: ParsedPage, link: string) => {
    if (isExternalHref(link)) return;

    const base = from.source.route === "/" ? "/" : `${from.source.route}/`;
    const [target = "", fragment] = new URL(link, `https://docs.invalid${base}`).href
      .replace("https://docs.invalid", "")
      .split("#");
    const route = normalizeRoute(decoded(target, decodeURI));
    const page = pages.get(route);
    const file = relative(from.source.file);

    if (page) {
      if (fragment && !anchors.get(route)?.has(decoded(fragment, decodeURIComponent)))
        errors.push(`${file}: ${link} has no heading #${fragment} on ${route}/`);
      if (route !== from.source.route)
        linkers.set(route, (linkers.get(route) ?? new Set()).add(from.source.route));
      return;
    }

    if (byRoute.has(route) || FILE_EXTENSION.test(route) || known.has(route)) return;
    if (underBase(route) || config.knownRoutes)
      errors.push(`${file}: ${link} does not resolve to a page or a known route`);
  };

  for (const page of parsed) for (const link of page.links) checkLink(page, link);

  const order = navOrder(config);
  const byNavOrder = (a: string, b: string) => (order.get(a) ?? 0) - (order.get(b) ?? 0);
  for (const [route, entry] of pages)
    entry.backlinks = [...(linkers.get(route) ?? [])].sort(byNavOrder);

  const markdown = new Map<string, string>();
  for (const page of parsed) {
    const file = relative(page.source.file);
    const body = pageMarkdown(page.tree, {
      siteUrl: config.siteUrl,
      route: page.source.route,
      lowerings: config.markdown ?? {},
      error: (message) => errors.push(`${file}: ${message}`),
    });
    const { title, description } = page.entry;
    markdown.set(
      page.entry.markdown,
      [`# ${title}`, description ? `> ${description}` : "", body].filter(Boolean).join("\n\n") +
        "\n",
    );
  }

  for (const plugin of config.plugins ?? []) await plugin.finish?.(ctx);

  const routePages = sources.filter((source) => pages.has(source.route)) satisfies RoutePage[];

  if (errors.length) return { errors, warnings, pages: pages.size, sections: searchDocs.length };

  const manifest: DocsManifest = Object.fromEntries(
    [...pages].sort(([a], [b]) => byNavOrder(a, b)),
  );
  const siteUrl = config.siteUrl.replace(/\/+$/, "");
  const manifestFile = resolve(config.manifestPath);

  const previous = await readFile(manifestFile, "utf8")
    .then((text) => Object.values(JSON.parse(text) as DocsManifest).map((page) => page.markdown))
    .catch(() => [] as string[]);
  for (const stale of previous.filter((file) => !markdown.has(file)))
    await rm(path.join(publicDir, stale), { force: true });

  await writeIfChanged(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);
  await writeIfChanged(path.join(publicDir, config.searchIndexPath), JSON.stringify(searchDocs));
  for (const [file, content] of markdown) await writeIfChanged(path.join(publicDir, file), content);

  const pageLine = (route: string) => {
    const page = pages.get(route);
    if (!page) return undefined;
    const summary = page.description ?? page.excerpt;
    return `- [${page.title}](${siteUrl}${page.markdown})${summary ? `: ${summary}` : ""}`;
  };

  const sections = config.roots.flatMap((root) => {
    const listOf = (nodes: NavNode[]) =>
      flattenLinks(nodes)
        .filter((link) => !link.external && !isExternalHref(link.href))
        .map((link) => pageLine(normalizeRoute(link.href)))
        .filter((line): line is string => line !== undefined);
    const topLinks = listOf(root.nav.filter((node) => node.kind === "link"));
    const branches = root.nav.filter((node) => node.kind === "branch");

    return [
      ...(topLinks.length ? [`## ${root.title ?? "Pages"}\n\n${topLinks.join("\n")}`] : []),
      ...branches
        .map((branch) => ({ title: branch.title, lines: listOf(branch.children) }))
        .filter((branch) => branch.lines.length)
        .map((branch) => `## ${branch.title}\n\n${branch.lines.join("\n")}`),
    ];
  });

  const llmsTitle = config.llms?.title ?? "Documentation";
  const llmsHeader = [
    `# ${llmsTitle}`,
    config.llms?.description ? `> ${config.llms.description}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  await writeIfChanged(
    path.join(publicDir, "llms.txt"),
    `${[llmsHeader, ...sections].join("\n\n")}\n`,
  );
  const fullPages = Object.values(manifest).map(
    (page) => markdown.get(page.markdown)?.trim() ?? "",
  );
  await writeIfChanged(
    path.join(publicDir, "llms-full.txt"),
    `${[llmsHeader, ...fullPages].join("\n\n---\n\n")}\n`,
  );

  await writeRouteFiles({
    routesRoot,
    routesDirs: [...new Set(config.roots.map((root) => resolve(root.routesDir)))],
    headModule: config.headModule,
    pages: routePages,
  });

  return { errors, warnings, pages: pages.size, sections: searchDocs.length };
};
