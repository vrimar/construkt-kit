import { ark } from "@ark-ui/react/factory";
import type { ComponentProps } from "react";
import { styled } from "@b3/styled-system/jsx";
import { badge } from "@b3/styled-system/recipes";

export type BadgeProps = ComponentProps<typeof Badge>;
export const Badge = styled(ark.div, badge);
