import { Clipboard as ArkClipboard, ClipboardContext } from "@ark-ui/react/clipboard";
import { createStyleContext } from "@construkt-kit/styled-system/jsx";
import { clipboard } from "@construkt-kit/styled-system/recipes";
import { CheckIcon, CopyIcon } from "lucide-react";
import type { ComponentProps } from "react";

import type { WithRef } from "../../types";

const { withProvider, withContext } = createStyleContext(clipboard);

const Root = withProvider(ArkClipboard.Root, "root");
const RootProvider = withProvider(ArkClipboard.RootProvider, "root");
const Control = withContext(ArkClipboard.Control, "control");
const Input = withContext(ArkClipboard.Input, "input");
const Label = withContext(ArkClipboard.Label, "label");
const Trigger = withContext(ArkClipboard.Trigger, "trigger");

type IndicatorProps = ComponentProps<typeof StyledIndicator>;

const StyledIndicator = withContext(ArkClipboard.Indicator, "indicator");

function Indicator({ ref, ...props }: WithRef<IndicatorProps>) {
  return (
    <StyledIndicator
      ref={ref}
      copied={<CheckIcon />}
      {...props}
    >
      <CopyIcon />
    </StyledIndicator>
  );
}

function CopyText({ ref, ...props }: WithRef<IndicatorProps>) {
  return (
    <StyledIndicator
      ref={ref}
      copied="Copied"
      {...props}
    >
      Copy
    </StyledIndicator>
  );
}

export type ClipboardRootProps = ComponentProps<typeof Root>;

export const Clipboard = {
  Root,
  RootProvider,
  Control,
  Input,
  Label,
  Trigger,
  Indicator,
  CopyText,
  Context: ClipboardContext,
};
