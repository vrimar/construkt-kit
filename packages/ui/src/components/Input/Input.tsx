import { Field } from "@ark-ui/react/field";
import { styled } from "@construct-kit/styled-system/jsx";
import { input } from "@construct-kit/styled-system/recipes";
import type { ComponentProps } from "react";

export type InputProps = ComponentProps<typeof Input>;
export const Input = styled(Field.Input, input);
