import { Field } from "@ark-ui/react/field";
import { styled } from "@construkt-kit/styled-system/jsx";
import { input } from "@construkt-kit/styled-system/recipes";
import type { ComponentProps } from "react";

export type InputProps = ComponentProps<typeof Input>;
export const Input = styled(Field.Input, input);
