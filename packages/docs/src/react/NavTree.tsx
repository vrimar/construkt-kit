import { Collapsible } from "@construkt-kit/ui";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { type ComponentType, useState } from "react";

import { findActiveSection, isExternalHref, isNodeActive, normalizeRoute } from "../core/nav";
import type { NavBranch, NavLink, NavNode } from "../core/types";
import { docsNav } from "./recipe";
import type { DocsLinkComponent } from "./types";

export interface NavTreeProps {
  nav: NavNode[];
  currentRoute: string;
  LinkComponent: DocsLinkComponent;
  /** Accessible name of the navigation landmark. */
  label?: string;
  /** Called after a link is followed, e.g. to close the drawer holding the tree. */
  onNavigate?: () => void;
}

type Classes = ReturnType<typeof docsNav>;

interface NodeProps {
  currentRoute: string;
  LinkComponent: DocsLinkComponent;
  onNavigate?: () => void;
  classes: Classes;
}

type IconComponent = ComponentType<{ "aria-hidden"?: boolean }>;

const TreeLink = ({
  node,
  currentRoute,
  LinkComponent,
  onNavigate,
  classes,
}: NodeProps & { node: NavLink }) => {
  const leaving = node.external || isExternalHref(node.href);
  const content = (
    <>
      {node.title}
      {leaving && (
        <ArrowUpRight
          aria-hidden
          className={classes.leaving}
        />
      )}
    </>
  );

  return (
    <li className={classes.item}>
      {isExternalHref(node.href) ? (
        <a
          href={node.href}
          target="_blank"
          rel="noreferrer noopener"
          className={classes.link}
        >
          {content}
        </a>
      ) : (
        <LinkComponent
          href={node.href}
          className={classes.link}
          onClick={onNavigate}
          aria-current={isNodeActive(node, currentRoute) ? "page" : undefined}
        >
          {content}
        </LinkComponent>
      )}
    </li>
  );
};

const TreeNodes = ({ nodes, ...rest }: NodeProps & { nodes: NavNode[] }) =>
  nodes.map((node) =>
    node.kind === "link" ? (
      <TreeLink
        key={node.id}
        node={node}
        {...rest}
      />
    ) : (
      <li
        key={node.id}
        className={rest.classes.item}
      >
        <div className={rest.classes.groupLabel}>{node.title}</div>
        <ul className={rest.classes.list}>
          <TreeNodes
            nodes={node.children}
            {...rest}
          />
        </ul>
      </li>
    ),
  );

const TreeSection = ({
  node,
  open,
  onToggle,
  ...rest
}: NodeProps & { node: NavBranch; open: boolean; onToggle: () => void }) => {
  const Icon = node.icon as IconComponent | undefined;

  return (
    <li className={rest.classes.item}>
      <Collapsible.Root
        open={open}
        onOpenChange={onToggle}
        className={rest.classes.section}
      >
        <Collapsible.Trigger className={rest.classes.sectionTrigger}>
          {Icon && (
            <span className={rest.classes.sectionIcon}>
              <Icon aria-hidden />
            </span>
          )}
          {node.title}
          <ChevronRight
            aria-hidden
            className={rest.classes.sectionIndicator}
          />
        </Collapsible.Trigger>
        <Collapsible.Content>
          <ul className={rest.classes.sectionList}>
            <TreeNodes
              nodes={node.children}
              {...rest}
            />
          </ul>
        </Collapsible.Content>
      </Collapsible.Root>
    </li>
  );
};

const openFor = (nav: NavNode[], route: string) => {
  const section = findActiveSection(nav, route);
  return new Set(section ? [section.id] : []);
};

/**
 * The docs sidebar. Top-level branches are collapsible sections; only the section holding the
 * current page starts open, and following a link re-collapses every other section.
 */
export const NavTree = ({
  nav,
  currentRoute,
  LinkComponent,
  label = "Documentation",
  onNavigate,
}: NavTreeProps) => {
  const classes = docsNav();
  const route = normalizeRoute(currentRoute);
  const [state, setState] = useState(() => ({ route, open: openFor(nav, route) }));

  const current = state.route === route ? state : { route, open: openFor(nav, route) };
  if (current !== state) setState(current);

  const toggle = (id: string) =>
    setState((previous) => {
      const open = new Set(previous.open);
      if (!open.delete(id)) open.add(id);
      return { ...previous, open };
    });

  const shared = { currentRoute: route, LinkComponent, onNavigate, classes };

  return (
    <nav
      aria-label={label}
      className={classes.root}
    >
      <ul className={classes.list}>
        {nav.map((node) =>
          node.kind === "link" ? (
            <TreeLink
              key={node.id}
              node={node}
              {...shared}
            />
          ) : (
            <TreeSection
              key={node.id}
              node={node}
              open={current.open.has(node.id)}
              onToggle={() => toggle(node.id)}
              {...shared}
            />
          ),
        )}
      </ul>
    </nav>
  );
};
