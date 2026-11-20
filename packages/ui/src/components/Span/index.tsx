import type { ComponentProps } from "react";

import { styled } from "#styled-system/jsx";

import { renderable } from "../../primitives/render";

export type SpanProps = ComponentProps<typeof Span>;
export const Span = styled(renderable.span);
