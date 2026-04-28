import { ark } from "@ark-ui/react/factory";
import { styled } from "@construct-kit/styled-system/jsx";
import { group } from "@construct-kit/styled-system/recipes";
import type { ComponentProps } from "react";

export type GroupProps = ComponentProps<typeof Group>;
export const Group = styled(ark.div, group);
