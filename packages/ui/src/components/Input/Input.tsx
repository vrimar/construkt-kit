import { Field } from "@ark-ui/react/field";
import type { ComponentProps } from "react";
import { styled } from "@b3/styled-system/jsx";
import { input } from "@b3/styled-system/recipes";

export type InputProps = ComponentProps<typeof Input>;
export const Input = styled(Field.Input, input);
