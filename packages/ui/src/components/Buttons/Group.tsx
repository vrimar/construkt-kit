import { ark } from "@ark-ui/react/factory";
import type { ComponentProps } from "react";
import { styled } from "@b3/styled-system/jsx";
import { group } from "@b3/styled-system/recipes";

export type GroupProps = ComponentProps<typeof Group>;
export const Group = styled(ark.div, group);
