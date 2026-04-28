import { ark } from "@ark-ui/react/factory";
import { styled } from "@construct-kit/styled-system/jsx";
import { spinner } from "@construct-kit/styled-system/recipes";
import type { ComponentProps } from "react";

export type SpinnerProps = ComponentProps<typeof Spinner>;
export const Spinner = styled(ark.span, spinner);
