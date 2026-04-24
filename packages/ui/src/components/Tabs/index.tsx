import { Tabs as ArkTabs, TabsContext } from "@ark-ui/react/tabs";
import type { ComponentProps } from "react";
import { createStyleContext } from "@b3/styled-system/jsx";
import { tabs } from "@b3/styled-system/recipes";

const { withProvider, withContext } = createStyleContext(tabs);

const Root = withProvider(ArkTabs.Root, "root");
const RootProvider = withProvider(ArkTabs.RootProvider, "root");
const List = withContext(ArkTabs.List, "list");
const Trigger = withContext(ArkTabs.Trigger, "trigger");
const Content = withContext(ArkTabs.Content, "content");
const Indicator = withContext(ArkTabs.Indicator, "indicator");

export type TabsRootProps = ComponentProps<typeof Root>;

export const Tabs = {
  Root,
  RootProvider,
  List,
  Trigger,
  Content,
  Indicator,
  Context: TabsContext,
};
