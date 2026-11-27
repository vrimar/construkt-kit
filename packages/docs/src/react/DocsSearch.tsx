import {
  Button,
  CommandPalette,
  Kbd,
  SearchHighlight,
  Spinner,
  formatShortcut,
  isEditableTarget,
  matchesShortcut,
  useLatestRef,
} from "@construkt-kit/ui";
import { ArrowUpRight, FileText, Hash, History, Search } from "lucide-react";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import type { DocsSearchDoc } from "../core/types";
import { docsSearch } from "./recipe";
import { type SearchGroup, type SearchIndex, createSearchIndex, searchDocs } from "./search";
import { DocsShellContext } from "./shellContext";

export interface DocsSearchProps {
  /** URL of the index `construkt-kit-docs` writes (`searchIndexPath`). */
  indexUrl: string;
  /** Follows a result: `href`, or `route#anchor`. */
  navigate: (href: string) => void;
  /** More documents to search beside the pages, loaded with the index; if it fails, search covers the pages alone. */
  extraDocs?: () => Promise<DocsSearchDoc[]>;
  /** Called once a query has rested for a second, for analytics. */
  onSearch?: (query: string) => void;
  label?: string;
  placeholder?: string;
  limit?: number;
  /** Opens the search on mount. */
  defaultOpen?: boolean;
  /** The search text it first opens with. */
  defaultQuery?: string;
}

const SHORTCUT = "Mod+K";
const MIN_QUERY = 2;
const REPORT_AFTER_MS = 1000;
const RECENT_LIMIT = 5;

const subscribeToNothing = () => () => undefined;
const isApplePlatform = () => /Mac|iPhone|iPad/.test(navigator.platform);
const onServer = () => false;

const isShown = (element: HTMLElement) =>
  typeof element.checkVisibility === "function"
    ? element.checkVisibility()
    : element.getClientRects().length > 0;

const recentKey = (indexUrl: string) => `construkt-kit-docs:recent:${indexUrl}`;

const readRecent = (indexUrl: string): string[] => {
  try {
    const stored: unknown = JSON.parse(window.localStorage.getItem(recentKey(indexUrl)) ?? "[]");
    return Array.isArray(stored)
      ? stored.filter((item): item is string => typeof item === "string").slice(0, RECENT_LIMIT)
      : [];
  } catch {
    return [];
  }
};

const saveRecent = (indexUrl: string, recent: string[]) => {
  try {
    window.localStorage.setItem(recentKey(indexUrl), JSON.stringify(recent));
  } catch {
    // Without storage, recent searches last until the page reloads.
  }
};

const withRecent = (recent: string[], query: string) =>
  [query, ...recent.filter((item) => item.toLowerCase() !== query.toLowerCase())].slice(
    0,
    RECENT_LIMIT,
  );

const rowCount = (groups: SearchGroup[]) =>
  groups.reduce((count, group) => count + group.sections.length + (group.page ? 1 : 0), 0);

/**
 * A button that opens search over the docs' static index in a palette. The index loads on first
 * open; results group by page, the page first and its matching sections below it in page order.
 * With nothing typed it lists recent searches, kept in `localStorage`. ⌘K / Ctrl K opens it; when
 * a layout mounts several copies, the one whose button is visible takes the shortcut.
 */
export const DocsSearch = ({
  indexUrl,
  navigate,
  extraDocs,
  onSearch,
  label = "Search the docs",
  placeholder = "Search the docs…",
  limit = 8,
  defaultOpen = false,
  defaultQuery = "",
}: DocsSearchProps) => {
  const classes = docsSearch();
  const shell = useContext(DocsShellContext);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const loading = useRef<{ url: string } | null>(null);
  const extraDocsRef = useLatestRef(extraDocs);
  const reported = useRef("");
  const picked = useRef(false);

  const [index, setIndex] = useState<SearchIndex | null>(null);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(defaultOpen);
  const [query, setQuery] = useState(defaultQuery);
  const [recent, setRecent] = useState(() => (defaultOpen ? readRecent(indexUrl) : []));
  const apple = useSyncExternalStore(subscribeToNothing, isApplePlatform, onServer);

  const load = useCallback(() => {
    if (loading.current?.url === indexUrl) return;
    const attempt = { url: indexUrl };
    loading.current = attempt;
    setIndex(null);
    setFailed(false);
    Promise.all([
      fetch(indexUrl).then((response) => {
        if (!response.ok) throw new Error(`${indexUrl} answered ${response.status}`);
        return response.json() as Promise<DocsSearchDoc[]>;
      }),
      Promise.resolve()
        .then(() => extraDocsRef.current?.() ?? [])
        .catch(() => []),
    ])
      .then(([pages, extra]) => {
        if (loading.current === attempt) setIndex(createSearchIndex([...pages, ...extra]));
      })
      .catch(() => {
        if (loading.current !== attempt) return;
        loading.current = null;
        setFailed(true);
      });
  }, [indexUrl, extraDocsRef]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const openSearch = useCallback(() => {
    picked.current = false;
    setRecent(readRecent(indexUrl));
    setOpen(true);
  }, [indexUrl]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const trigger = triggerRef.current;
      if (!trigger || event.defaultPrevented) return;
      if (!matchesShortcut(event, SHORTCUT, { mac: apple })) return;
      if (isEditableTarget(event.target)) return;
      if (!isShown(trigger)) return;

      event.preventDefault();
      openSearch();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [apple, openSearch]);

  const trimmed = query.trim();
  const hasQuery = trimmed.length >= MIN_QUERY;

  useEffect(() => {
    if (!onSearch || !hasQuery || trimmed === reported.current) return;
    const timer = setTimeout(() => {
      reported.current = trimmed;
      onSearch(trimmed);
    }, REPORT_AFTER_MS);
    return () => clearTimeout(timer);
  }, [onSearch, hasQuery, trimmed]);

  const results = useMemo(
    () => (index && hasQuery ? searchDocs(index, trimmed, limit) : null),
    [index, hasQuery, trimmed, limit],
  );
  const terms = results?.terms.join(" ") ?? "";
  const shown = results ? rowCount(results.groups) : 0;
  const showRecent = trimmed === "" && recent.length > 0;
  const hasRows = showRecent || (results?.groups.length ?? 0) > 0;

  const emptyText = !trimmed
    ? "Search titles, headings and text."
    : !hasQuery
      ? `Type at least ${MIN_QUERY} characters to search.`
      : results
        ? `No results for “${trimmed}”. Check the spelling, or search for fewer words.`
        : failed
          ? "Couldn’t load search."
          : "Loading the index…";

  const count = !results?.total
    ? null
    : results.total > shown
      ? `${shown} of ${results.total}`
      : `${results.total} ${results.total === 1 ? "result" : "results"}`;

  const follow = (href: string) => {
    picked.current = true;
    const next = withRecent(recent, trimmed);
    setRecent(next);
    saveRecent(indexUrl, next);
    navigate(href);
  };

  return (
    <>
      <Button
        ref={triggerRef}
        variant="outline"
        className={classes.trigger}
        leftIcon={<Search aria-hidden />}
        aria-haspopup="dialog"
        aria-keyshortcuts={apple ? "Meta+K" : "Control+K"}
        onClick={openSearch}
      >
        <span className={classes.triggerText}>{placeholder}</span>
        <Kbd
          size="sm"
          aria-hidden
          className={classes.shortcut}
        >
          {formatShortcut(SHORTCUT, { mac: apple })}
        </Kbd>
      </Button>
      <CommandPalette.Root
        label={label}
        open={open}
        onOpenChange={(next) => (next ? openSearch() : setOpen(false))}
        query={query}
        onQueryChange={setQuery}
        returnFocusTo={() => (picked.current ? (shell?.content() ?? null) : null)}
        onExitComplete={() => setQuery("")}
      >
        <CommandPalette.Input
          ref={inputRef}
          placeholder={placeholder}
          aria-expanded={hasRows}
        />
        {hasRows && (
          <CommandPalette.List>
            {showRecent && (
              <CommandPalette.Group label="Recent">
                {recent.map((item) => (
                  <CommandPalette.Item
                    key={item}
                    value={`recent:${item}`}
                    label={item}
                    icon={<History aria-hidden />}
                    closeOnSelect={false}
                    onSelect={() => setQuery(item)}
                  />
                ))}
              </CommandPalette.Group>
            )}
            {results?.groups.map((group) => (
              <CommandPalette.Group
                key={group.key}
                aria-label={group.title}
              >
                <CommandPalette.Item
                  value={group.page?.id ?? group.key}
                  label={group.title}
                  highlight={terms}
                  icon={
                    group.page?.external ? <ArrowUpRight aria-hidden /> : <FileText aria-hidden />
                  }
                  meta={group.route === shell?.currentRoute ? "This page" : group.section}
                  description={
                    group.page?.snippet ? (
                      <SearchHighlight
                        text={group.page.snippet}
                        query={terms}
                        wholeWords
                      />
                    ) : undefined
                  }
                  onSelect={() => follow(group.page?.href ?? group.route)}
                />
                {group.sections.map((hit) => (
                  <CommandPalette.Item
                    key={hit.id}
                    value={hit.id}
                    label={hit.label}
                    highlight={terms}
                    icon={<Hash aria-hidden />}
                    className={classes.section}
                    data-depth={hit.depth ?? 2}
                    description={
                      hit.snippet ? (
                        <SearchHighlight
                          text={hit.snippet}
                          query={terms}
                          wholeWords
                        />
                      ) : undefined
                    }
                    onSelect={() => follow(hit.href)}
                  />
                ))}
              </CommandPalette.Group>
            ))}
          </CommandPalette.List>
        )}
        <CommandPalette.Empty className={classes.status}>
          {hasQuery && !results && !failed && <Spinner size="sm" />}
          {emptyText}
        </CommandPalette.Empty>
        {hasQuery && !results && failed && (
          <div className={classes.retry}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                load();
                inputRef.current?.focus();
              }}
            >
              Try again
            </Button>
          </div>
        )}
        <div className={classes.footer}>
          <span
            className={classes.hint}
            aria-hidden
          >
            <Kbd
              size="sm"
              className={classes.shortcut}
            >
              ↵
            </Kbd>{" "}
            open
          </span>
          <span
            className={classes.hint}
            aria-hidden
          >
            <Kbd
              size="sm"
              className={classes.shortcut}
            >
              ↑
            </Kbd>
            <Kbd
              size="sm"
              className={classes.shortcut}
            >
              ↓
            </Kbd>{" "}
            move
          </span>
          <span
            className={classes.hint}
            aria-hidden
          >
            <Kbd
              size="sm"
              className={classes.shortcut}
            >
              Esc
            </Kbd>{" "}
            close
          </span>
          {count && <span className={classes.count}>{count}</span>}
        </div>
      </CommandPalette.Root>
    </>
  );
};
