import { ark } from "@ark-ui/react/factory";
import { ChevronRightIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { createSlotRecipeContext, styled } from "#styled-system/jsx";
import { list } from "#styled-system/recipes";

import type { WithRef } from "../../types";
import { wrapAsChildContent } from "../asChildContent";

const { withProvider, withContext } = createSlotRecipeContext(list);

const ListRoot = styled(ark.ul);
const ListItem = styled(ark.li);

const ActionRoot = withProvider(ark.button, "action");
const ActionIcon = withContext(ark.span, "actionIcon");
const ActionContent = withContext(ark.span, "actionContent");
const ActionTitle = withContext(ark.span, "actionTitle");
const ActionDescription = withContext(ark.span, "actionDescription");
const ActionValue = withContext(ark.span, "actionValue");
const ActionChevron = withContext(ark.span, "actionChevron");

export type ListRootProps = ComponentProps<typeof ListRoot>;
export type ListItemProps = ComponentProps<typeof ListItem>;

export interface ListActionProps extends Omit<ComponentProps<typeof ActionRoot>, "value"> {
  /** Leading icon, or any short marker such as a `Badge`. */
  icon?: ReactNode;
  /** Muted line under the title. */
  description?: ReactNode;
  /** Muted text at the end of the row, before the chevron, such as a count or the current setting. */
  value?: ReactNode;
  /** Shows the trailing chevron. Defaults to `true`. */
  chevron?: boolean;
}

/**
 * Full-width row that drills into a detail: icon, title (the children), optional description and
 * value, and a chevron. Renders a button; pass `asChild` with a link to navigate instead.
 */
function ListAction({
  ref,
  icon,
  description,
  value,
  chevron = true,
  children,
  ...rest
}: WithRef<ListActionProps, HTMLButtonElement>) {
  const content = (title: ReactNode) => (
    <>
      {icon && <ActionIcon>{icon}</ActionIcon>}
      <ActionContent>
        <ActionTitle>{title}</ActionTitle>
        {description && <ActionDescription>{description}</ActionDescription>}
      </ActionContent>
      {value !== undefined && value !== null && <ActionValue>{value}</ActionValue>}
      {chevron && (
        <ActionChevron>
          <ChevronRightIcon />
        </ActionChevron>
      )}
    </>
  );

  return (
    <ActionRoot
      ref={ref}
      type={rest.asChild ? undefined : "button"}
      {...rest}
    >
      {rest.asChild ? wrapAsChildContent(children, content) : content(children)}
    </ActionRoot>
  );
}

export const List = {
  Root: ListRoot,
  Item: ListItem,
  Action: ListAction,
};
