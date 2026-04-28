import { Collapsible as ArkCollapsible, CollapsibleContext } from "@ark-ui/react/collapsible";
import { createStyleContext } from "@construkt-kit/styled-system/jsx";
import { collapsible } from "@construkt-kit/styled-system/recipes";
import type { ComponentProps } from "react";

const { withProvider, withContext } = createStyleContext(collapsible);

const Root = withProvider(ArkCollapsible.Root, "root");
const RootProvider = withProvider(ArkCollapsible.RootProvider, "root");
const Content = withContext(ArkCollapsible.Content, "content");
const Indicator = withContext(ArkCollapsible.Indicator, "indicator");
const Trigger = withContext(ArkCollapsible.Trigger, "trigger");

export type CollapsibleRootProps = ComponentProps<typeof Root>;

export const Collapsible = {
  Root,
  RootProvider,
  Content,
  Indicator,
  Trigger,
  Context: CollapsibleContext,
};
