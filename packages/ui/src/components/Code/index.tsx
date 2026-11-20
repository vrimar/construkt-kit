import type { ComponentProps } from "react";

import { styled } from "#styled-system/jsx";
import { code } from "#styled-system/recipes";

import { renderable } from "../../primitives/render";

export type CodeProps = ComponentProps<typeof Code>;
export const Code = styled(renderable.code, code);
