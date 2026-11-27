import type { ComponentType, MouseEventHandler, ReactNode } from "react";

export interface DocsLinkProps {
  href: string;
  className?: string;
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  "aria-current"?: "page" | "location";
  "data-direction"?: string;
}

/** The site's router link: renders an anchor for `href` and navigates client-side. */
export type DocsLinkComponent = ComponentType<DocsLinkProps>;
