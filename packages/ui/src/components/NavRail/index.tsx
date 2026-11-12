import { ark } from "@ark-ui/react/factory";
import { type ComponentProps, type ReactNode, useId } from "react";

import { Float, createSlotRecipeContext } from "#styled-system/jsx";
import { navRail } from "#styled-system/recipes";

import type { WithRef } from "../../types";
import { wrapAsChildContent } from "../asChildContent";
import { Badge } from "../Badge";
import { Tooltip } from "../Tooltip";

const { withProvider, withContext } = createSlotRecipeContext(navRail);

const Root = withProvider(ark.nav, "root");
const StyledItem = withContext(ark.button, "item");
const ItemIcon = withContext(ark.span, "itemIcon");
const ItemLabel = withContext(ark.span, "itemLabel");
const Footer = withContext(ark.div, "footer");

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
  asChild,
  children,
  ...rest
}: WithRef<NavRailItemProps, HTMLButtonElement>) {
  const generatedId = useId();
  const triggerId = id ?? generatedId;
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

  return (
    <Tooltip
      label={tooltip ?? label}
      disabled={tooltip == null}
      placement="right"
      ids={{ trigger: triggerId }}
    >
      <StyledItem
        ref={ref}
        id={triggerId}
        type={asChild ? undefined : "button"}
        aria-current={active ? "page" : undefined}
        data-tucked={tucked ? "" : undefined}
        asChild={asChild}
        {...rest}
      >
        {asChild ? wrapAsChildContent(children, () => content) : content}
      </StyledItem>
    </Tooltip>
  );
}

export const NavRail = {
  Root,
  Item,
  Footer,
};
