import { evaluate } from "@mdx-js/mdx";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as runtime from "react/jsx-runtime";
import { expect, test } from "vitest";

import { headingIdOf } from "./core/headingIds";
import { parseMdx } from "./core/parse";
import type { MdNode } from "./core/types";
import { rehypePlugins, remarkPlugins } from "./mdx";

const SOURCE = `---
description: Headings that collide.
---

## Setup

## Setup

## Setup [#install]

### Setup

## Bases & weights

## Café **menu**
`;

const headings = (node: MdNode): MdNode[] => [
  ...(node.type === "heading" ? [node] : []),
  ...(node.children ?? []).flatMap(headings),
];

test("the ids the CLI validates anchors against are the ids the site renders", async () => {
  const cliIds = headings(await parseMdx(SOURCE)).map(headingIdOf);

  const { default: Content } = await evaluate(SOURCE, { ...runtime, remarkPlugins, rehypePlugins });
  const html = renderToStaticMarkup(createElement(Content));
  const renderedIds = [...html.matchAll(/<h[2-6] id="([^"]+)"/g)].map((match) => match[1]);

  expect(cliIds).toHaveLength(6);
  expect(renderedIds).toEqual(cliIds);
});
