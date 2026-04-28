import { Field } from "@ark-ui/react/field";
import type { ComponentProps } from "react";
import { styled } from "@construct-kit/styled-system/jsx";
import { input } from "@construct-kit/styled-system/recipes";

export type InputProps = ComponentProps<typeof Input>;
export const Input = styled(Field.Input, input);
