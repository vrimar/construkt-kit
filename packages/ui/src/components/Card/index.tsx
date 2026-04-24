import { ark } from "@ark-ui/react/factory";
import type { ComponentProps } from "react";
import { createStyleContext } from "@b3/styled-system/jsx";
import { card } from "@b3/styled-system/recipes";

const { withProvider, withContext } = createStyleContext(card);

const Root = withProvider(ark.div, "root");
const Header = withContext(ark.div, "header");
const Body = withContext(ark.div, "body");
const Footer = withContext(ark.h3, "footer");
const Title = withContext(ark.h3, "title");
const Description = withContext(ark.div, "description");

export type CardRootProps = ComponentProps<typeof Root>;

export const Card = {
  Root,
  Header,
  Body,
  Footer,
  Title,
  Description,
};
