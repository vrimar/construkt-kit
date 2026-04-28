import { ark } from "@ark-ui/react/factory";
import { styled } from "@construct-kit/styled-system/jsx";
import { code } from "@construct-kit/styled-system/recipes";
import type { ComponentProps } from "react";

export type CodeProps = ComponentProps<typeof Code>;
export const Code = styled(ark.code, code);
