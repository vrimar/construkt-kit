import { AccordionContext, Accordion as ArkAccordion } from "@ark-ui/react/accordion";
import { ark } from "@ark-ui/react/factory";
import { createStyleContext } from "@construkt-kit/styled-system/jsx";
import { accordion } from "@construkt-kit/styled-system/recipes";
import { ChevronDownIcon } from "lucide-react";
import type { ComponentProps } from "react";

const { withProvider, withContext } = createStyleContext(accordion);

const Root = withProvider(ArkAccordion.Root, "root");
const RootProvider = withProvider(ArkAccordion.RootProvider, "root");
const Item = withContext(ArkAccordion.Item, "item");
const ItemContent = withContext(ArkAccordion.ItemContent, "itemContent");
const ItemIndicator = withContext(ArkAccordion.ItemIndicator, "itemIndicator", {
  defaultProps: { children: <ChevronDownIcon /> },
});
const ItemTrigger = withContext(ArkAccordion.ItemTrigger, "itemTrigger");
const ItemBody = withContext(ark.div, "itemBody");

export type AccordionRootProps = ComponentProps<typeof Root>;

export const Accordion = {
  Root,
  RootProvider,
  Item,
  ItemContent,
  ItemIndicator,
  ItemTrigger,
  ItemBody,
  Context: AccordionContext,
};
