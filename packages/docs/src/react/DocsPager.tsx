import { findNeighbours } from "../core/nav";
import type { NavNode } from "../core/types";
import { docsPager } from "./recipe";
import type { DocsLinkComponent } from "./types";

export interface DocsPagerProps {
  nav: NavNode[];
  currentRoute: string;
  LinkComponent: DocsLinkComponent;
  labels?: { previous: string; next: string; landmark: string };
}

const DEFAULT_LABELS = { previous: "Previous", next: "Next", landmark: "Previous and next page" };

/** Links to the pages before and after this one in nav order. */
export const DocsPager = ({
  nav,
  currentRoute,
  LinkComponent,
  labels = DEFAULT_LABELS,
}: DocsPagerProps) => {
  const classes = docsPager();
  const { previous, next } = findNeighbours(nav, currentRoute);
  if (!previous && !next) return null;

  return (
    <nav
      aria-label={labels.landmark}
      className={classes.root}
    >
      {previous && (
        <LinkComponent
          href={previous.href}
          className={classes.link}
          data-direction="previous"
        >
          <span className={classes.direction}>{labels.previous}</span>
          <span className={classes.title}>{previous.title}</span>
        </LinkComponent>
      )}
      {next && (
        <LinkComponent
          href={next.href}
          className={classes.link}
          data-direction="next"
        >
          <span className={classes.direction}>{labels.next}</span>
          <span className={classes.title}>{next.title}</span>
        </LinkComponent>
      )}
    </nav>
  );
};
