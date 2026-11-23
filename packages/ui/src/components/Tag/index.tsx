import { XIcon } from "lucide-react";
import { type ComponentProps, createContext, useContext, useId, useMemo } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { tag } from "#styled-system/recipes";

import {
  type ReportRendered,
  useRenderedParts,
  useReportRendered,
} from "../../hooks/useRenderedParts";
import { renderable } from "../../primitives/render";

const { withProvider, withContext } = createSlotRecipeContext(tag);

const StyledRoot = withProvider(renderable.span, "root");
const StyledLabel = withContext(renderable.span, "label");
const StartElement = withContext(renderable.span, "startElement");
const EndElement = withContext(renderable.span, "endElement");
const StyledCloseTrigger = withContext(renderable.button, "closeTrigger", {
  defaultProps: { children: <XIcon /> },
});

interface TagLabel {
  generatedId: string;
  /** The rendered label's id. */
  labelId: string | undefined;
  reportRendered: ReportRendered<"label">;
}

const TagLabelContext = createContext<TagLabel | undefined>(undefined);

function Root(props: ComponentProps<typeof StyledRoot>) {
  const generatedId = useId();
  const [rendered, reportRendered] = useRenderedParts<"label">();
  const label = useMemo(
    () => ({ generatedId, labelId: rendered.label, reportRendered }),
    [generatedId, rendered.label, reportRendered],
  );
  return (
    <TagLabelContext.Provider value={label}>
      <StyledRoot {...props} />
    </TagLabelContext.Provider>
  );
}

function Label({ id, ...props }: ComponentProps<typeof StyledLabel>) {
  const label = useContext(TagLabelContext);
  const labelId = useReportRendered(label?.reportRendered, "label", id ?? label?.generatedId);
  return (
    <StyledLabel
      id={labelId}
      {...props}
    />
  );
}

function CloseTrigger({ id, ...props }: ComponentProps<typeof StyledCloseTrigger>) {
  const labelId = useContext(TagLabelContext)?.labelId;
  const ownId = useId();
  const triggerId = id ?? ownId;
  const named = props["aria-label"] !== undefined || props["aria-labelledby"] !== undefined;

  return (
    <StyledCloseTrigger
      type={props.render ? undefined : "button"}
      id={triggerId}
      aria-label="Remove"
      aria-labelledby={named || !labelId ? undefined : `${triggerId} ${labelId}`}
      {...props}
    />
  );
}

export type TagRootProps = ComponentProps<typeof Root>;
export type TagCloseTriggerProps = ComponentProps<typeof CloseTrigger>;

export const Tag = {
  Root,
  Label,
  StartElement,
  EndElement,
  CloseTrigger,
};
