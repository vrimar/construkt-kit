import { ark } from "@ark-ui/react/factory";
import type { ComponentProps } from "react";
import { styled } from "@b3/styled-system/jsx";

const ListRoot = styled(ark.ul);
const ListItem = styled(ark.li);

export type ListRootProps = ComponentProps<typeof ListRoot>;
export type ListItemProps = ComponentProps<typeof ListItem>;

export const List = {
  Root: ListRoot,
  Item: ListItem,
};
