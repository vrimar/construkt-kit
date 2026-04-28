import { ark } from "@ark-ui/react/factory";
import { createStyleContext } from "@construkt-kit/styled-system/jsx";
import { card } from "@construkt-kit/styled-system/recipes";
import type { ComponentProps } from "react";

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
