import { Field } from "@ark-ui/react/field";
import { styled } from "@construkt-kit/styled-system/jsx";
import { textarea } from "@construkt-kit/styled-system/recipes";
import type { ComponentProps } from "react";

export type TextareaProps = ComponentProps<typeof Textarea>;
export const Textarea = styled(Field.Textarea, textarea);
