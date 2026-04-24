import { ark } from "@ark-ui/react/factory";
import type { ComponentProps } from "react";
import { styled } from "@b3/styled-system/jsx";
import { code } from "@b3/styled-system/recipes";

export type CodeProps = ComponentProps<typeof Code>;
export const Code = styled(ark.code, code);
