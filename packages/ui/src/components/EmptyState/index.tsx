import type { ComponentProps } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { emptyState } from "#styled-system/recipes";

import { renderable } from "../../primitives/render";

const { withProvider, withContext } = createSlotRecipeContext(emptyState);

const Root = withProvider(renderable.div, "root");
const Content = withContext(renderable.div, "content");
const Indicator = withContext(renderable.div, "indicator");
const Title = withContext(renderable.h3, "title");
const Description = withContext(renderable.p, "description");

export type EmptyStateRootProps = ComponentProps<typeof Root>;

export const EmptyState = {
  Root,
  Content,
  Indicator,
  Title,
  Description,
};
