import MiniSearch, { type SearchResult } from "minisearch";

import { isExternalHref } from "../core/nav";
import type { DocsSearchDoc } from "../core/types";

export interface SearchHit {
  id: string;
  href: string;
  label: string;
  /** Heading level of a section hit; absent on a page's own doc. */
  depth: number | undefined;
  snippet: string;
  external: boolean;
}

export interface SearchGroup {
  key: string;
  route: string;
  title: string;
  section: string | undefined;
  /** The page's own doc, when it matched. */
  page: SearchHit | undefined;
  /** The page's matching sections, in the order they appear on the page. */
  sections: SearchHit[];
}

export interface SearchResults {
  groups: SearchGroup[];
  /** Every match, before the limit. */
  total: number;
  /** The indexed words the query matched, to mark in the results. */
  terms: string[];
}

export interface SearchIndex {
  miniSearch: MiniSearch<DocsSearchDoc>;
  order: ReadonlyMap<string, number>;
}

const FUZZY_FROM = 5;
const SNIPPET_LENGTH = 160;
const SNIPPET_LEAD = 50;
const WORD_CHAR = "[\\p{L}\\p{M}\\p{N}]";

export const createSearchIndex = (docs: DocsSearchDoc[]): SearchIndex => {
  const miniSearch = new MiniSearch<DocsSearchDoc>({
    fields: ["title", "heading", "aliases", "text"],
    storeFields: ["route", "anchor", "href", "title", "heading", "depth", "section", "text"],
    extractField: (doc, field) =>
      field === "aliases" ? doc.aliases?.join(" ") : doc[field as keyof DocsSearchDoc],
    searchOptions: {
      boost: { title: 3, heading: 2, aliases: 3 },
      combineWith: "AND",
      prefix: (_term, position, terms) => position === terms.length - 1,
      fuzzy: (term) => (term.length >= FUZZY_FROM ? 0.2 : false),
    },
  });
  miniSearch.addAll(docs);
  return { miniSearch, order: new Map(docs.map((doc, position) => [doc.id, position])) };
};

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const matcherFor = (terms: string[]) =>
  terms.length
    ? new RegExp(
        `(?<!${WORD_CHAR})(?:${[...terms]
          .sort((a, b) => b.length - a.length)
          .map(escapeRegExp)
          .join("|")})(?!${WORD_CHAR})`,
        "iu",
      )
    : undefined;

const snippetStart = (text: string, at: number) => {
  if (at <= SNIPPET_LEAD) return 0;
  const from = at - SNIPPET_LEAD;
  const sentence = [...text.slice(from, at).matchAll(/[.!?:]\s+/g)].at(-1);
  if (sentence) return from + sentence.index + sentence[0].length;
  const space = text.indexOf(" ", from);
  return space >= 0 && space < at ? space + 1 : from;
};

/** Up to `SNIPPET_LENGTH` characters around the first match, cut between words. */
export const snippetOf = (text: string, matcher: RegExp | undefined) => {
  if (text.length <= SNIPPET_LENGTH) return text;
  const at = matcher ? Math.max(0, text.search(matcher)) : 0;
  const start = snippetStart(text, at);
  let end = start + SNIPPET_LENGTH;
  if (end >= text.length) end = text.length;
  else {
    const space = text.lastIndexOf(" ", end);
    if (space > at) end = space;
  }
  return `${start > 0 ? "…" : ""}${text.slice(start, end).trim()}${end < text.length ? "…" : ""}`;
};

const hrefOf = (doc: DocsSearchDoc) =>
  doc.href ?? (doc.anchor ? `${doc.route}#${doc.anchor}` : doc.route);

/**
 * The best `limit` matches for `query`, grouped by page in the order of each page's best match,
 * with each page's sections in page order.
 */
export const searchDocs = (
  { miniSearch, order }: SearchIndex,
  query: string,
  limit: number,
): SearchResults => {
  const results = miniSearch.search(query);
  const groups = new Map<string, SearchGroup>();
  const terms = new Set<string>();

  for (const result of results.slice(0, limit)) {
    const doc = result as SearchResult & DocsSearchDoc;
    for (const term of result.terms) terms.add(term);
    const key = `${doc.route}\n${doc.title}`;
    const group = groups.get(key) ?? {
      key,
      route: doc.route,
      title: doc.title,
      section: doc.section,
      page: undefined,
      sections: [],
    };
    groups.set(key, group);
    const href = hrefOf(doc);
    const hit: SearchHit = {
      id: String(result.id),
      href,
      label: doc.heading || doc.title,
      depth: doc.heading ? doc.depth : undefined,
      snippet: snippetOf(doc.text, matcherFor(result.terms)),
      external: isExternalHref(href),
    };
    if (doc.heading) group.sections.push(hit);
    else group.page = hit;
  }

  const position = (hit: SearchHit) => order.get(hit.id) ?? 0;
  for (const group of groups.values()) group.sections.sort((a, b) => position(a) - position(b));

  return { groups: [...groups.values()], total: results.length, terms: [...terms] };
};
