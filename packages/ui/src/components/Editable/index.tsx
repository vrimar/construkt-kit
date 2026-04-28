import { Editable as ArkEditable, EditableContext } from "@ark-ui/react/editable";
import type { ComponentProps } from "react";
import { createStyleContext } from "@construct-kit/styled-system/jsx";
import { editable } from "@construct-kit/styled-system/recipes";

const { withProvider, withContext } = createStyleContext(editable);

const Root = withProvider(ArkEditable.Root, "root");
const RootProvider = withProvider(ArkEditable.RootProvider, "root");
const Area = withContext(ArkEditable.Area, "area");
const CancelTrigger = withContext(ArkEditable.CancelTrigger, "cancelTrigger");
const Control = withContext(ArkEditable.Control, "control");
const EditTrigger = withContext(ArkEditable.EditTrigger, "editTrigger");
const Input = withContext(ArkEditable.Input, "input");
const Label = withContext(ArkEditable.Label, "label");
const Preview = withContext(ArkEditable.Preview, "preview");
const SubmitTrigger = withContext(ArkEditable.SubmitTrigger, "submitTrigger");

export type EditableRootProps = ComponentProps<typeof Root>;

export const Editable = {
  Root,
  RootProvider,
  Area,
  CancelTrigger,
  Control,
  EditTrigger,
  Input,
  Label,
  Preview,
  SubmitTrigger,
  Context: EditableContext,
};
