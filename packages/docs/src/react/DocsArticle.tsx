import type { ReactNode } from "react";

import { docsArticle } from "./recipe";

export interface DocsArticleProps {
  title: string;
  description?: string;
  /** Short label shown above the title, such as the page's type: "How-to", "Concept". */
  badge?: ReactNode;
  /** Shown beside the badge, such as the section the page belongs to. */
  eyebrow?: ReactNode;
  /** ISO date of the page's last change. */
  lastModified?: string;
  formatUpdated?: (isoDate: string) => string;
  /** Rendered at the foot of the article, below the update date: feedback, pager. */
  footer?: ReactNode;
  /** Shown between the title block and the body, such as `<DocsToc collapsible />`. */
  toc?: ReactNode;
  children: ReactNode;
}

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const defaultFormatUpdated = (isoDate: string) =>
  `Updated ${DATE_FORMAT.format(new Date(isoDate))}`;

/**
 * A docs page: title block, the MDX body styled as prose, and the page footer. Prose styles
 * reach the markdown only: a component placed in a page keeps its own styles, and only the
 * body's top-level h2–h4 are styled as page headings.
 */
export const DocsArticle = ({
  title,
  description,
  badge,
  eyebrow,
  lastModified,
  formatUpdated = defaultFormatUpdated,
  footer,
  toc,
  children,
}: DocsArticleProps) => {
  const classes = docsArticle();

  return (
    <article className={classes.root}>
      <header className={classes.header}>
        {(badge || eyebrow) && (
          <div className={classes.eyebrow}>
            {eyebrow}
            {badge && <span className={classes.badge}>{badge}</span>}
          </div>
        )}
        <h1 className={classes.title}>{title}</h1>
        {description && <p className={classes.description}>{description}</p>}
      </header>
      {toc}
      <div
        className={classes.body}
        data-docs-prose=""
      >
        {children}
      </div>
      {(lastModified || footer) && (
        <footer className={classes.footer}>
          {lastModified && (
            <time
              dateTime={lastModified}
              className={classes.updated}
            >
              {formatUpdated(lastModified)}
            </time>
          )}
          {footer}
        </footer>
      )}
    </article>
  );
};
