import type { ComponentProps, ReactNode } from "react";

import { Float, createSlotRecipeContext } from "#styled-system/jsx";
import { navRail } from "#styled-system/recipes";

import { renderable } from "../../primitives/render";
import type { WithRef } from "../../types";
import { Badge } from "../Badge";
import { wrapRenderContent } from "../renderContent";
import { Tooltip } from "../Tooltip";

const { withProvider, withContext } = createSlotRecipeContext(navRail);

const Root = withProvider(renderable.nav, "root");
const StyledItem = withContext(renderable.button, "item");
const ItemIcon = withContext(renderable.span, "itemIcon");
const ItemLabel = withContext(renderable.span, "itemLabel");
const Footer = withContext(renderable.div, "footer");

export type NavRailRootProps = ComponentProps<typeof Root>;
export type NavRailFooterProps = ComponentProps<typeof Footer>;

export interface NavRailItemProps extends ComponentProps<typeof StyledItem> {
  icon: ReactNode;
  label: ReactNode;
  /** The current page: sets `aria-current="page"` and joins the item to the pane beside the rail. */
  active?: boolean | undefined;
  /** The active item's pane is hidden: a ring and a dot replace the join. Say why in `tooltip`. */
  tucked?: boolean | undefined;
  /** A status dot on the icon. It is decorative, so say what it means in `tooltip` or `aria-label`. */
  dot?: boolean | undefined;
  tooltip?: ReactNode;
}

function Item({
  ref,
  icon,
  label,
  active,
  tucked,
  dot,
  tooltip,
  id,
  render,
  ...rest
}: WithRef<NavRailItemProps, HTMLButtonElement>) {
  const content = (
    <>
      <ItemIcon>
        {icon}
        {(dot || tucked) && (
          <Float
            as="span"
            placement="top-end"
          >
            <Badge
              as="span"
              size="dot"
              variant="solid"
            />
          </Float>
        )}
      </ItemIcon>
      <ItemLabel>{label}</ItemLabel>
    </>
  );
  const rendered = wrapRenderContent(render, undefined, () => content);

  return (
    <Tooltip
      label={tooltip ?? label}
      disabled={tooltip == null}
      placement="right"
    >
      <StyledItem
        ref={ref}
        id={id}
        type={render ? undefined : "button"}
        aria-current={active ? "page" : undefined}
        data-tucked={tucked ? "" : undefined}
        render={rendered.render}
        {...rest}
      >
        {rendered.children}
      </StyledItem>
    </Tooltip>
  );
}

export const NavRail = {
  Root,
  Item,
  Footer,
};
