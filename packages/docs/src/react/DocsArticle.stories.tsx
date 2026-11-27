import preview from "@construkt-kit/story-kit/preview";

import { StoryLink, nav } from "../../test/fixture";
import { DocsArticle } from "./DocsArticle";
import { DocsPager } from "./DocsPager";

const meta = preview.meta({
  title: "Docs/DocsArticle",
  tags: ["autodocs"],
  parameters: { layout: "padded" },
});

export const TitleOnly = meta.story({
  render: () => (
    <DocsArticle title="Glossary">
      <p>The terms these docs use, and what each means.</p>
    </DocsArticle>
  ),
});

export const WithPager = meta.story({
  render: () => (
    <DocsArticle
      title="Project settings"
      description="Names, colours and the defaults new pages start with."
      badge="Concept"
      footer={
        <DocsPager
          nav={nav}
          currentRoute="/docs/projects/settings/"
          LinkComponent={StoryLink}
        />
      }
    >
      <p>Each setting shows its default beside its name.</p>
    </DocsArticle>
  ),
});
