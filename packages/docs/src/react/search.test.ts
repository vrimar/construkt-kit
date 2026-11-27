import { expect, test } from "vitest";

import { createSearchIndex, searchDocs } from "./search";

const doc = (id: string, text: string) => ({ id, route: `/${id}`, title: id, heading: "", text });

test("a short word matches only itself or, as the last word typed, words it starts", () => {
  const index = createSearchIndex([
    doc("next", "Click Next to go on."),
    doc("net", "Merge rows into a net."),
    doc("network", "The network view."),
  ]);

  const routes = (query: string) =>
    searchDocs(index, query, 10).groups.flatMap((group) => (group.page ? [group.page.href] : []));

  expect(routes("net").sort()).toEqual(["/net", "/network"]);
  expect(routes("net rows")).toEqual(["/net"]);
});

test("a page's sections list in page order, whatever their rank", () => {
  const section = (anchor: string, heading: string, text: string) => ({
    id: `/guide#${anchor}`,
    route: "/guide",
    anchor,
    title: "Guide",
    heading,
    text,
  });
  const index = createSearchIndex([
    section("intro", "Intro", "Projects hold pages, people, and the role each person has in them."),
    section("roles", "Roles", "A role is a set of permissions."),
  ]);

  const [group] = searchDocs(index, "role", 10).groups;

  expect(group?.sections.map((hit) => hit.label)).toEqual(["Intro", "Roles"]);
});
