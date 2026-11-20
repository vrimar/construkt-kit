import { ChevronRightIcon } from "lucide-react";
import type { ComponentProps } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { breadcrumb } from "#styled-system/recipes";

import { renderable } from "../../primitives/render";

const { withProvider, withContext } = createSlotRecipeContext(breadcrumb);

const Root = withProvider(renderable.nav, "root", { defaultProps: { "aria-label": "breadcrumb" } });
const List = withContext(renderable.ol, "list");
const Item = withContext(renderable.li, "item");
const Link = withContext(renderable.a, "link");
const Ellipsis = withContext(renderable.li, "ellipsis", {
  defaultProps: {
    role: "presentation",
    "aria-hidden": true,
    children: "...",
  },
});
const Separator = withContext(renderable.li, "separator", {
  defaultProps: {
    "aria-hidden": true,
    children: <ChevronRightIcon />,
  },
});

export type BreadcrumbRootProps = ComponentProps<typeof Root>;

export const Breadcrumb = {
  Root,
  List,
  Item,
  Link,
  Ellipsis,
  Separator,
};
