import type { ComponentProps } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { fieldset } from "#styled-system/recipes";

import { useReportRendered } from "../../hooks/useRenderedParts";
import {
  type FieldsetContextValue,
  FieldsetContext,
  joinIds,
  useFieldMessageProps,
  useFieldsetContext,
  useFieldsetRoot,
} from "../../primitives/field";
import { fieldStateAttributes, renderable } from "../../primitives/render";

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
        {...fieldStateAttributes(context)}
        aria-describedby={joinIds([describedBy, context.describedBy])}
        {...props}
      />
    </FieldsetContext>
  );
}

function Legend({ id, ...props }: ComponentProps<typeof StyledLegend>) {
  const context = useFieldset();
  const legendId = useReportRendered(context.reportRendered, "legend", id ?? context.ids.legend);
  return (
    <StyledLegend
      id={legendId}
      {...fieldStateAttributes(context)}
      {...props}
    />
  );
}

function HelperText({ id, ...props }: ComponentProps<typeof StyledHelperText>) {
  return (
    <StyledHelperText
      {...useFieldMessageProps(useFieldset(), "helperText", id)}
      {...props}
    />
  );
}

function RenderedErrorText({ id, ...props }: ComponentProps<typeof StyledErrorText>) {
  return (
    <StyledErrorText
      {...useFieldMessageProps(useFieldset(), "errorText", id)}
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
