import { ark } from "@ark-ui/react/factory";
import { Fieldset as ArkFieldset, FieldsetContext } from "@ark-ui/react/fieldset";
import type { ComponentProps } from "react";
import { createStyleContext } from "@b3/styled-system/jsx";
import { fieldset } from "@b3/styled-system/recipes";

const { withProvider, withContext } = createStyleContext(fieldset);

const Root = withProvider(ArkFieldset.Root, "root");
const RootProvider = withProvider(ArkFieldset.RootProvider, "root");
const Legend = withContext(ArkFieldset.Legend, "legend");
const HelperText = withContext(ArkFieldset.HelperText, "helperText");
const ErrorText = withContext(ArkFieldset.ErrorText, "errorText");
const Content = withContext(ark.div, "content");
const Control = withContext(ark.div, "control");

export type FieldsetRootProps = ComponentProps<typeof Root>;

export const Fieldset = {
  Root,
  RootProvider,
  Legend,
  HelperText,
  ErrorText,
  Content,
  Control,
  Context: FieldsetContext,
};
