import { ark } from "@ark-ui/react/factory";
import { styled } from "@construkt-kit/styled-system/jsx";
import type { ComponentProps } from "react";

const ListRoot = styled(ark.ul);
const ListItem = styled(ark.li);

export type ListRootProps = ComponentProps<typeof ListRoot>;
export type ListItemProps = ComponentProps<typeof ListItem>;

export const List = {
  Root: ListRoot,
  Item: ListItem,
};
