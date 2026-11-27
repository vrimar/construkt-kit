import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, expect, test } from "vitest";

import { buildDocs } from "./build";
import type { DocsConfig, DocsSearchDoc } from "./types";

let dir: string | undefined;

afterEach(async () => {
  if (dir) await rm(dir, { recursive: true, force: true });
});

const site = async (pages: Record<string, string>) => {
  dir = await mkdtemp(path.join(tmpdir(), "docs-build-"));
  for (const [file, source] of Object.entries(pages)) {
    await mkdir(path.dirname(path.join(dir, file)), { recursive: true });
    await writeFile(path.join(dir, file), source);
  }
  return dir;
};

const config: DocsConfig = {
  roots: [
    {
      contentDir: "content",
      base: "/docs",
      routesDir: "src/routes/docs",
      nav: [
        {
          kind: "branch",
          id: "guides",
          title: "Guides",
          children: [{ kind: "link", id: "a", title: "A", href: "/docs/a/" }],
        },
        { kind: "link", id: "b", title: "B", href: "/docs/b/" },
      ],
    },
  ],
  headModule: "@/docs/head",
  manifestPath: "manifest.json",
  searchIndexPath: "/docs/search.json",
  publicDir: "public",
  siteUrl: "https://example.test",
};

test("a link to a missing page or heading fails the build and writes nothing", async () => {
  const cwd = await site({
    "content/a.mdx":
      "See [b](/docs/b/#usage), [gone](/docs/gone/) and [here](#intro).\n\n## Intro\n",
    "content/b.mdx": "## Use it\n",
  });

  const result = await buildDocs(config, { cwd, dev: false });

  expect(result.errors).toEqual([
    expect.stringContaining("/docs/b/#usage"),
    expect.stringContaining("/docs/gone/"),
  ]);
  await expect(writeFile(path.join(cwd, "manifest.json"), "", { flag: "wx" })).resolves.toBe(
    undefined,
  );
});

test("a folder's index page gets TanStack's index route file, not the folder's layout route", async () => {
  const cwd = await site({ "content/a/index.mdx": "A.\n", "content/a/b.mdx": "B.\n" });
  const nested: DocsConfig = {
    ...config,
    roots: config.roots.map((root) => ({
      ...root,
      nav: [
        { kind: "link", id: "a", title: "A", href: "/docs/a/" },
        { kind: "link", id: "b", title: "B", href: "/docs/a/b/" },
      ],
    })),
  };

  const result = await buildDocs(nested, { cwd, dev: false });

  expect(result.errors).toEqual([]);
  await expect(readFile(path.join(cwd, "src/routes/docs/a/index.tsx"), "utf8")).resolves.toContain(
    'createFileRoute("/docs/a/")',
  );
});

test("a dotted page name gets an escaped route file that serves its URL", async () => {
  const cwd = await site({ "content/v1.2.mdx": "A.\n", "content/b.mdx": "B.\n" });
  const dotted: DocsConfig = {
    ...config,
    roots: config.roots.map((root) => ({
      ...root,
      nav: [
        { kind: "link", id: "a", title: "A", href: "/docs/v1.2/" },
        { kind: "link", id: "b", title: "B", href: "/docs/b/" },
      ],
    })),
  };

  const result = await buildDocs(dotted, { cwd, dev: false });

  expect(result.errors).toEqual([]);
  await expect(readFile(path.join(cwd, "src/routes/docs/v1[.]2.tsx"), "utf8")).resolves.toContain(
    'createFileRoute("/docs/v1.2")',
  );
});

test("a page name TanStack reads as route syntax fails the build", async () => {
  const cwd = await site({ "content/_a.mdx": "A.\n", "content/b.mdx": "B.\n" });
  const pathless: DocsConfig = {
    ...config,
    roots: config.roots.map((root) => ({
      ...root,
      nav: [
        { kind: "link", id: "a", title: "A", href: "/docs/_a/" },
        { kind: "link", id: "b", title: "B", href: "/docs/b/" },
      ],
    })),
  };

  const result = await buildDocs(pathless, { cwd, dev: false });

  expect(result.errors).toEqual([expect.stringMatching(/^content\/_a\.mdx: its route file /)]);
});

test("a hand-written route above a page is its layout, a .ts route serves its URL, and a second route for a page's URL fails", async () => {
  const cwd = await site({
    "content/a/index.mdx": "See the [changelog](/docs/changelog/).\n",
    "content/b.mdx": "B.\n",
    "src/routes/docs/a.tsx": "export {};\n",
    "src/routes/docs/changelog.ts": "export {};\n",
    "src/routes/docs/_shell/b.tsx": "export {};\n",
  });

  const result = await buildDocs(config, { cwd, dev: false });

  expect(result.errors).toEqual([
    "content/b.mdx serves /docs/b/, which the hand-written src/routes/docs/_shell/b.tsx serves too",
  ]);
});

test("a relative link on the site's root page resolves from the root", async () => {
  const cwd = await site({ "content/index.mdx": "See [b](b).\n", "content/b.mdx": "B.\n" });
  const rooted: DocsConfig = {
    ...config,
    knownRoutes: [],
    roots: config.roots.map((root) => ({
      ...root,
      base: "",
      routesDir: "src/routes",
      nav: [
        { kind: "link", id: "home", title: "Home", href: "/" },
        { kind: "link", id: "b", title: "B", href: "/b/" },
      ],
    })),
  };

  const result = await buildDocs(rooted, { cwd, dev: false });

  expect(result.errors).toEqual([]);
});

test("frontmatter the YAML parser rejects fails the build naming only that page", async () => {
  const cwd = await site({
    "content/a.mdx": "---\ntitle: a: b\n---\n\nText.\n",
    "content/b.mdx": "See [a](/docs/a/).\n",
  });

  const result = await buildDocs(config, { cwd, dev: false });

  expect(result.errors).toEqual([expect.stringMatching(/^content\/a\.mdx: frontmatter: /)]);
});

test("a heading id repeated below the top level fails the build", async () => {
  const cwd = await site({
    "content/a.mdx": "## Setup [#setup]\n\n> ### More [#setup]\n",
    "content/b.mdx": "Text.\n",
  });

  const result = await buildDocs(config, { cwd, dev: false });

  expect(result.errors).toEqual(["content/a.mdx: two headings have the id #setup"]);
});

test("an MDX comment builds and stays out of the search text", async () => {
  const cwd = await site({
    "content/a.mdx": "{/* TODO: screenshot */}\n\nText.\n",
    "content/b.mdx": "Text.\n",
  });

  const result = await buildDocs(config, { cwd, dev: false });

  expect(result.errors).toEqual([]);
  const docs = JSON.parse(
    await readFile(path.join(cwd, "public/docs/search.json"), "utf8"),
  ) as DocsSearchDoc[];
  expect(docs.find((doc) => doc.id === "/docs/a")?.text).toBe("Text.");
});

test("the search index keeps list items apart, gives a page's aliases a doc of its own, and records each doc's heading level and nav section", async () => {
  const cwd = await site({
    "content/a.mdx":
      "---\naliases: [login, sign-in]\n---\n\n## Steps\n\n- Open it.\n- Close it.\n\n### Undo\n\nPress Esc.\n",
    "content/b.mdx": "Text.\n",
  });

  const result = await buildDocs(config, { cwd, dev: false });

  expect(result.errors).toEqual([]);
  const docs = JSON.parse(
    await readFile(path.join(cwd, "public/docs/search.json"), "utf8"),
  ) as DocsSearchDoc[];
  expect(docs.filter((doc) => doc.route === "/docs/a")).toEqual([
    expect.objectContaining({ id: "/docs/a", aliases: ["login", "sign-in"], section: "Guides" }),
    expect.objectContaining({ id: "/docs/a#steps", text: "Open it. Close it.", depth: 2 }),
    expect.objectContaining({ id: "/docs/a#undo", depth: 3, section: "Guides" }),
  ]);
  expect(docs.find((doc) => doc.route === "/docs/b")).not.toHaveProperty("section");
});
