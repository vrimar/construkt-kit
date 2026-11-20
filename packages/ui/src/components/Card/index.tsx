import type { ComponentProps } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { card } from "#styled-system/recipes";

import { renderable } from "../../primitives/render";

const { withProvider, withContext } = createSlotRecipeContext(card);

const Root = withProvider(renderable.div, "root");
const Header = withContext(renderable.div, "header");
const Body = withContext(renderable.div, "body");
const Footer = withContext(renderable.div, "footer");
const Title = withContext(renderable.h3, "title");
const Description = withContext(renderable.div, "description");

export type CardRootProps = ComponentProps<typeof Root>;

export const Card = {
  Root,
  Header,
  Body,
  Footer,
  Title,
  Description,
};
