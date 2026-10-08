import { Clipboard as ArkClipboard, ClipboardContext } from "@ark-ui/react/clipboard";
import { CheckIcon, CopyIcon } from "lucide-react";
import type { ComponentProps } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { clipboard } from "#styled-system/recipes";

const { withProvider, withContext } = createSlotRecipeContext(clipboard);

const Root = withProvider(ArkClipboard.Root, "root");
const RootProvider = withProvider(ArkClipboard.RootProvider, "root");
const Control = withContext(ArkClipboard.Control, "control");
const Input = withContext(ArkClipboard.Input, "input");
const Label = withContext(ArkClipboard.Label, "label");
const Trigger = withContext(ArkClipboard.Trigger, "trigger");
const Indicator = withContext(ArkClipboard.Indicator, "indicator", {
  defaultProps: { children: <CopyIcon />, copied: <CheckIcon /> },
});
const CopyText = withContext(ArkClipboard.Indicator, "indicator", {
  defaultProps: { children: "Copy", copied: "Copied" },
});

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
