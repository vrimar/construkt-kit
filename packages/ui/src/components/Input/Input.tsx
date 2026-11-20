import type { ComponentProps } from "react";

import { styled } from "#styled-system/jsx";
import { input } from "#styled-system/recipes";

import { useFieldInputProps } from "../../primitives/field";
import { renderable } from "../../primitives/render";

function FieldInput(props: ComponentProps<typeof renderable.input>) {
  return <renderable.input {...useFieldInputProps(props)} />;
}

export type InputProps = ComponentProps<typeof Input>;
export const Input = styled(FieldInput, input);
