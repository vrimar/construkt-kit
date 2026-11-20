import { XIcon } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { tag } from "#styled-system/recipes";

import { renderable } from "../../primitives/render";

const { withProvider, withContext } = createSlotRecipeContext(tag);

const StyledRoot = withProvider(renderable.span, "root");
const StyledLabel = withContext(renderable.span, "label");
const StartElement = withContext(renderable.span, "startElement");
const EndElement = withContext(renderable.span, "endElement");
const StyledCloseTrigger = withContext(renderable.button, "closeTrigger", {
  defaultProps: { type: "button", children: <XIcon /> },
});

interface LabelIds {
  generatedId: string;
  labelId: string;
  setOwnLabelId: (id: string | undefined) => void;
}

const LabelIdContext = createContext<LabelIds | undefined>(undefined);

function Root(props: ComponentProps<typeof StyledRoot>) {
  const generatedId = useId();
  const [ownLabelId, setOwnLabelId] = useState<string>();
  const labelIds = useMemo(
    () => ({ generatedId, labelId: ownLabelId ?? generatedId, setOwnLabelId }),
    [generatedId, ownLabelId],
  );
  return (
    <LabelIdContext.Provider value={labelIds}>
      <StyledRoot {...props} />
    </LabelIdContext.Provider>
  );
}

function Label({ id, ...props }: ComponentProps<typeof StyledLabel>) {
  const labelIds = useContext(LabelIdContext);
  const setOwnLabelId = labelIds?.setOwnLabelId;

  useEffect(() => {
    if (!setOwnLabelId || id === undefined) return;
    setOwnLabelId(id);
    return () => setOwnLabelId(undefined);
  }, [id, setOwnLabelId]);

  return (
    <StyledLabel
      id={id ?? labelIds?.generatedId}
      {...props}
    />
  );
}

function CloseTrigger({ id, ...props }: ComponentProps<typeof StyledCloseTrigger>) {
  const labelId = useContext(LabelIdContext)?.labelId;
  const ownId = useId();
  const triggerId = id ?? ownId;
  const named = props["aria-label"] !== undefined || props["aria-labelledby"] !== undefined;

  return (
    <StyledCloseTrigger
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
