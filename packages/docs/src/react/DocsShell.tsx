import { Button, Drawer } from "@construkt-kit/ui";
import { ArrowUpRight, Menu } from "lucide-react";
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { findActivePath, normalizeRoute } from "../core/nav";
import type { NavNode } from "../core/types";
import { NavTree } from "./NavTree";
import { docsNav, docsShell } from "./recipe";
import { DocsShellContext } from "./shellContext";
import type { DocsLinkComponent } from "./types";

/** A link off the docs, listed in the menu drawer below the nav. */
export interface DocsMenuLink {
  href: string;
  title: string;
}

export interface DocsShellProps {
  nav: NavNode[];
  currentRoute: string;
  LinkComponent: DocsLinkComponent;
  /** Accessible name of the sidebar navigation, and the menu button's label off a page. */
  label?: string;
  /**
   * Search shown at the top of the sidebar and, below the `lg` breakpoint, beside the menu
   * button. It renders once per place, so it must not rely on a unique id.
   */
  search?: ReactNode;
  /** The right-hand column from the `xl` breakpoint, usually `DocsToc`. */
  aside?: ReactNode;
  /** Links off the docs, such as the site's home, listed in the menu drawer below the nav. */
  menuLinks?: DocsMenuLink[];
  /** Id of the `<main>` holding the page, which `DocsSkipLink` targets. */
  contentId?: string;
  children: ReactNode;
}

export const DOCS_CONTENT_ID = "docs-content";

const menuLabel = (nav: NavNode[], currentRoute: string, fallback: string) => {
  const path = findActivePath(nav, currentRoute);
  return path.length
    ? path
        .slice(-2)
        .map((node) => node.title)
        .join(" › ")
    : fallback;
};

/**
 * The docs layout: a sticky sidebar holding `NavTree`, the page in `<main>`, and an optional
 * aside. Below `lg` the sidebar moves into a drawer behind a menu button. Sticky columns sit
 * below `--docs-sticky-top`, which a site with a sticky header sets to the header's height.
 * Following a link to another page moves focus to the page, as a full page load would.
 */
export const DocsShell = ({
  nav,
  currentRoute,
  LinkComponent,
  label = "Documentation",
  search,
  aside,
  menuLinks,
  contentId = DOCS_CONTENT_ID,
  children,
}: DocsShellProps) => {
  const classes = docsShell({ aside: aside !== undefined && aside !== null });
  const navClasses = docsNav();
  const [menuOpen, setMenuOpen] = useState(false);
  const content = useRef<HTMLElement>(null);
  const leftMenu = useRef(false);
  const route = normalizeRoute(currentRoute);
  const shownRoute = useRef(route);
  const shell = useMemo(() => ({ currentRoute: route, content: () => content.current }), [route]);

  const openMenu = () => {
    leftMenu.current = false;
    setMenuOpen(true);
  };
  const leaveMenu = useCallback(() => {
    leftMenu.current = true;
    setMenuOpen(false);
  }, []);

  useEffect(() => {
    if (shownRoute.current === route) return;
    shownRoute.current = route;
    content.current?.focus({ preventScroll: true });
  }, [route]);

  return (
    <DocsShellContext value={shell}>
      <div className={classes.root}>
        <div className={classes.toolbar}>
          {search && <div className={classes.toolbarSearch}>{search}</div>}
          <Button
            variant="outline"
            className={classes.menuButton}
            leftIcon={<Menu aria-hidden />}
            onClick={openMenu}
          >
            <span className={classes.menuLabel}>{menuLabel(nav, currentRoute, label)}</span>
          </Button>
        </div>

        <Drawer.Root
          aria-label={label}
          placement="start"
          size="xs"
          open={menuOpen}
          onOpenChange={(open) => setMenuOpen(open)}
          returnFocusTo={() => (leftMenu.current ? content.current : null)}
        >
          <Drawer.Content>
            <Drawer.CloseTrigger />
            <Drawer.Body className={classes.drawerBody}>
              <div className={classes.drawerInner}>
                <NavTree
                  nav={nav}
                  currentRoute={currentRoute}
                  LinkComponent={LinkComponent}
                  label={label}
                  onNavigate={leaveMenu}
                />
                {menuLinks && menuLinks.length > 0 && (
                  <ul className={classes.drawerLinks}>
                    {menuLinks.map((link) => (
                      <li
                        key={link.href}
                        className={navClasses.item}
                      >
                        <a
                          href={link.href}
                          className={navClasses.link}
                        >
                          {link.title}
                          <ArrowUpRight
                            aria-hidden
                            className={navClasses.leaving}
                          />
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Root>

        <aside
          className={classes.sidebar}
          aria-label={label}
        >
          {search && <div className={classes.sidebarSearch}>{search}</div>}
          <NavTree
            nav={nav}
            currentRoute={currentRoute}
            LinkComponent={LinkComponent}
            label={label}
          />
        </aside>

        <main
          ref={content}
          id={contentId}
          tabIndex={-1}
          className={classes.content}
        >
          {children}
        </main>

        {aside && <div className={classes.aside}>{aside}</div>}
      </div>
    </DocsShellContext>
  );
};

export interface DocsSkipLinkProps {
  /** The `contentId` given to `DocsShell`. */
  targetId?: string;
  label?: string;
}

/** "Skip to content": hidden until focused. Render it first in `<body>`, before the site header. */
export const DocsSkipLink = ({
  targetId = DOCS_CONTENT_ID,
  label = "Skip to content",
}: DocsSkipLinkProps) => {
  const classes = docsShell();

  return (
    <a
      href={`#${targetId}`}
      className={classes.skipLink}
      onClick={(event) => {
        const target = document.getElementById(targetId);
        if (!target) return;
        event.preventDefault();
        target.focus();
      }}
    >
      {label}
    </a>
  );
};
