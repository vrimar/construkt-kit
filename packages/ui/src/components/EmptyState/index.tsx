import { ark } from "@ark-ui/react/factory";
import { createStyleContext } from "@construkt-kit/styled-system/jsx";
import { emptyState } from "@construkt-kit/styled-system/recipes";
import type { ComponentProps } from "react";

const { withProvider, withContext } = createStyleContext(emptyState);

const Root = withProvider(ark.div, "root");
const Content = withContext(ark.div, "content");
const Indicator = withContext(ark.div, "indicator");
const Title = withContext(ark.h3, "title");
const Description = withContext(ark.p, "description");

export type EmptyStateRootProps = ComponentProps<typeof Root>;

export const EmptyState = {
  Root,
  Content,
  Indicator,
  Title,
  Description,
};
