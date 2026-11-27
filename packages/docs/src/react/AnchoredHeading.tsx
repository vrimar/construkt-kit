import { type ComponentProps, useEffect, useState } from "react";

import { docsAnchor } from "./recipe";

const COPIED_MS = 1500;

const HeadingAnchor = ({ id }: { id: string }) => {
  const classes = docsAnchor();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), COPIED_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = () => {
    const url = `${location.origin}${location.pathname}#${id}`;
    void navigator.clipboard?.writeText(url).then(
      () => setCopied(true),
      () => undefined,
    );
  };

  return (
    <a
      href={`#${id}`}
      className={classes.anchor}
      data-copied={copied || undefined}
      aria-label="Copy link to this section"
      onClick={copy}
    >
      #
      <span
        className={classes.status}
        aria-live="polite"
      >
        {copied ? "Link copied" : ""}
      </span>
    </a>
  );
};

const anchored =
  (Heading: "h2" | "h3") =>
  ({ id, children, className, ...props }: ComponentProps<"h2">) => {
    const classes = docsAnchor();
    if (!id)
      return (
        <Heading
          className={className}
          {...props}
        >
          {children}
        </Heading>
      );

    return (
      <Heading
        id={id}
        aria-labelledby={`${id}--text`}
        className={className ? `${classes.heading} ${className}` : classes.heading}
        {...props}
      >
        <span id={`${id}--text`}>{children}</span>
        <HeadingAnchor id={id} />
      </Heading>
    );
  };

/** An h2 that shows a copy-link anchor on hover and focus. */
export const AnchoredH2 = anchored("h2");

/** An h3 that shows a copy-link anchor on hover and focus. */
export const AnchoredH3 = anchored("h3");

/** The MDX components every docs page needs; spread a site's own over it. */
export const mdxComponents = { h2: AnchoredH2, h3: AnchoredH3 };
