import type { ComponentProps } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { fieldset } from "#styled-system/recipes";

import {
  type FieldsetContextValue,
  FieldsetContext,
  joinIds,
  useFieldMessage,
  useFieldsetContext,
  useFieldsetRoot,
} from "../../primitives/field";
import { dataAttr, renderable } from "../../primitives/render";

const { withProvider, withContext } = createSlotRecipeContext(fieldset);

const StyledRoot = withProvider(renderable.fieldset, "root");
const StyledLegend = withContext(renderable.legend, "legend");
const StyledHelperText = withContext(renderable.span, "helperText");
const StyledErrorText = withContext(renderable.span, "errorText");
const Content = withContext(renderable.div, "content");
const Control = withContext(renderable.div, "control");

function useFieldset(): FieldsetContextValue {
  const context = useFieldsetContext();
  if (!context) throw new Error("A Fieldset part must be placed inside <Fieldset.Root>.");
  return context;
}

export interface FieldsetRootProps extends ComponentProps<typeof StyledRoot> {
  /** Marks the fieldset invalid and shows its `ErrorText`. */
  invalid?: boolean | undefined;
}

function Root({
  id,
  disabled,
  invalid,
  "aria-describedby": describedBy,
  ...props
}: FieldsetRootProps) {
  const context = useFieldsetRoot({ id, disabled, invalid });
  return (
    <FieldsetContext value={context}>
      <StyledRoot
        id={id}
        disabled={context.disabled}
        data-disabled={dataAttr(context.disabled)}
        data-invalid={dataAttr(context.invalid)}
        aria-describedby={joinIds([describedBy, context.describedBy])}
        {...props}
      />
    </FieldsetContext>
  );
}

function Legend(props: ComponentProps<typeof StyledLegend>) {
  const context = useFieldset();
  return (
    <StyledLegend
      id={context.ids.legend}
      data-disabled={dataAttr(context.disabled)}
      data-invalid={dataAttr(context.invalid)}
      {...props}
    />
  );
}

function HelperText(props: ComponentProps<typeof StyledHelperText>) {
  const context = useFieldset();
  useFieldMessage(context.setMessageRendered, "helperText");
  return (
    <StyledHelperText
      id={context.ids.helperText}
      {...props}
    />
  );
}

function RenderedErrorText(props: ComponentProps<typeof StyledErrorText>) {
  const context = useFieldset();
  useFieldMessage(context.setMessageRendered, "errorText");
  return (
    <StyledErrorText
      id={context.ids.errorText}
      aria-live="polite"
      {...props}
    />
  );
}

/** Shown while the fieldset is `invalid`. */
function ErrorText(props: ComponentProps<typeof StyledErrorText>) {
  return useFieldset().invalid ? <RenderedErrorText {...props} /> : null;
}

export const Fieldset = {
  Root,
  Legend,
  HelperText,
  ErrorText,
  Content,
  Control,
};
