import { Field } from "@ark-ui/react/field";
import type { ComponentProps } from "react";
import { styled } from "@b3/styled-system/jsx";
import { textarea } from "@b3/styled-system/recipes";

export type TextareaProps = ComponentProps<typeof Textarea>;
export const Textarea = styled(Field.Textarea, textarea);
