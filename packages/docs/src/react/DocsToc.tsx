import { Collapsible } from "@construkt-kit/ui";
import { ChevronRight } from "lucide-react";
import { type RefObject, useEffect, useMemo, useRef, useState } from "react";

import type { DocsHeading } from "../core/types";
import { docsToc } from "./recipe";

export interface DocsTocProps {
  headings: DocsHeading[];
  label?: string;
  /** Deepest heading level listed. Default 3. */
  maxDepth?: number;
  /**
   * A closed list at the top of the page, below the `xl` breakpoint, where `DocsShell` shows
   * no aside. Pass it to `DocsArticle`'s `toc`. It doesn't mark the heading being read.
   */
  collapsible?: boolean;
}

const READING_LINE = 0.25;
const NO_HEADINGS: DocsHeading[] = [];

const stickyTop = (element: Element | null) =>
  element ? Number.parseFloat(getComputedStyle(element).top) || 0 : 0;

const hashId = () => {
  const hash = location.hash.slice(1);
  try {
    return decodeURIComponent(hash);
  } catch {
    return hash;
  }
};

const useActiveHeading = (headings: DocsHeading[], root: RefObject<HTMLElement | null>) => {
  const [activeId, setActiveId] = useState<string>();
  const pinnedId = useRef<string>(undefined);
  const pinSeen = useRef(false);

  useEffect(() => {
    if (!headings.length) return;

    const pinHash = () => {
      const hash = hashId();
      pinnedId.current = headings.some((heading) => heading.id === hash) ? hash : undefined;
      pinSeen.current = false;
    };
    pinHash();

    let offset = stickyTop(root.current?.parentElement ?? null);
    let frame = 0;

    const update = () => {
      frame = 0;
      if (pinnedId.current) {
        const rect = document.getElementById(pinnedId.current)?.getBoundingClientRect();
        const inView = rect !== undefined && rect.bottom > offset && rect.top < window.innerHeight;
        if (inView) pinSeen.current = true;
        else if (pinSeen.current) pinnedId.current = undefined;
      }
      if (pinnedId.current) {
        setActiveId(pinnedId.current);
        return;
      }

      const elements = headings
        .map((heading) => document.getElementById(heading.id))
        .filter((element): element is HTMLElement => element !== null);
      const atBottom =
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      const line = offset + (window.innerHeight - offset) * READING_LINE;
      const passed = elements.filter((element) => element.getBoundingClientRect().top <= line);
      const current = atBottom ? elements.at(-1) : passed.at(-1);

      setActiveId((current ?? elements[0])?.id);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const resize = () => {
      offset = stickyTop(root.current?.parentElement ?? null);
      schedule();
    };
    const unpin = () => {
      pinnedId.current = undefined;
    };
    const hashChange = () => {
      pinHash();
      schedule();
    };
    const inputs = ["wheel", "touchstart", "keydown"] as const;

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", resize);
    window.addEventListener("hashchange", hashChange);
    for (const input of inputs) window.addEventListener(input, unpin, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", resize);
      window.removeEventListener("hashchange", hashChange);
      for (const input of inputs) window.removeEventListener(input, unpin);
    };
  }, [headings, root]);

  const pin = (id: string) => {
    pinnedId.current = id;
    pinSeen.current = false;
    setActiveId(id);
  };

  return { activeId, pin };
};

/** "On this page": the page's headings, marking the one being read. */
export const DocsToc = ({
  headings,
  label = "On this page",
  maxDepth = 3,
  collapsible = false,
}: DocsTocProps) => {
  const classes = docsToc({ collapsible });
  const root = useRef<HTMLElement>(null);
  const listed = useMemo(
    () => headings.filter((heading) => heading.depth <= maxDepth),
    [headings, maxDepth],
  );
  const { activeId, pin } = useActiveHeading(collapsible ? NO_HEADINGS : listed, root);

  if (!listed.length) return null;

  const list = (
    <ul className={classes.list}>
      {listed.map((heading) => (
        <li
          key={heading.id}
          className={classes.item}
        >
          <a
            href={`#${heading.id}`}
            data-depth={heading.depth}
            className={classes.link}
            aria-current={activeId === heading.id ? "location" : undefined}
            onClick={collapsible ? undefined : () => pin(heading.id)}
          >
            {heading.text}
          </a>
        </li>
      ))}
    </ul>
  );

  if (collapsible)
    return (
      <nav
        aria-label={label}
        className={classes.root}
      >
        <Collapsible.Root>
          <Collapsible.Trigger className={classes.trigger}>
            {label}
            <ChevronRight
              aria-hidden
              className={classes.indicator}
            />
          </Collapsible.Trigger>
          <Collapsible.Content>
            <div className={classes.panel}>{list}</div>
          </Collapsible.Content>
        </Collapsible.Root>
      </nav>
    );

  return (
    <nav
      ref={root}
      aria-label={label}
      className={classes.root}
    >
      <div className={classes.label}>{label}</div>
      {list}
    </nav>
  );
};
