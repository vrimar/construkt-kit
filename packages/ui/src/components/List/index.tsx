import { ChevronRightIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { createSlotRecipeContext, styled } from "#styled-system/jsx";
import { list } from "#styled-system/recipes";

import { renderable } from "../../primitives/render";
import type { WithRef } from "../../types";
import { isRenderable } from "../itemSlots";
import { wrapRenderContent } from "../renderContent";

const { withProvider, withContext } = createSlotRecipeContext(list);

const ListRoot = styled(renderable.ul);
const ListItem = styled(renderable.li);

const ActionRoot = withProvider(renderable.button, "action");
const ActionIcon = withContext(renderable.span, "actionIcon");
const ActionContent = withContext(renderable.span, "actionContent");
const ActionTitle = withContext(renderable.span, "actionTitle");
const ActionDescription = withContext(renderable.span, "actionDescription");
const ActionValue = withContext(renderable.span, "actionValue");
const ActionChevron = withContext(renderable.span, "actionChevron");

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
 * value, and a chevron. Renders a button; pass a link as `render` to navigate instead.
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
      {isRenderable(icon) && <ActionIcon>{icon}</ActionIcon>}
      <ActionContent>
        <ActionTitle>{title}</ActionTitle>
        {isRenderable(description) && <ActionDescription>{description}</ActionDescription>}
      </ActionContent>
      {isRenderable(value) && <ActionValue>{value}</ActionValue>}
      {chevron && (
        <ActionChevron>
          <ChevronRightIcon />
        </ActionChevron>
      )}
    </>
  );

  const rendered = wrapRenderContent(rest.render, children, content);
  return (
    <ActionRoot
      ref={ref}
      type={rest.render ? undefined : "button"}
      {...rest}
      render={rendered.render}
    >
      {rendered.children}
    </ActionRoot>
  );
}

export const List = {
  Root: ListRoot,
  Item: ListItem,
  Action: ListAction,
};
