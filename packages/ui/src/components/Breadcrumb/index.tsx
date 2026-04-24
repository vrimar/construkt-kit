import { ark } from "@ark-ui/react/factory";
import { ChevronRightIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { createStyleContext } from "@b3/styled-system/jsx";
import { breadcrumb } from "@b3/styled-system/recipes";

const { withProvider, withContext } = createStyleContext(breadcrumb);

const Root = withProvider(ark.nav, "root", { defaultProps: { "aria-label": "breadcrumb" } });
const List = withContext(ark.ol, "list");
const Item = withContext(ark.li, "item");
const Link = withContext(ark.a, "link");
const Ellipsis = withContext(ark.li, "ellipsis", {
  defaultProps: {
    role: "presentation",
    "aria-hidden": true,
    children: "...",
  },
});
const Separator = withContext(ark.li, "separator", {
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
