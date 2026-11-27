import preview from "@construkt-kit/story-kit/preview";

import { searchIndexUrl } from "../../test/fixture";
import { DocsSearch } from "./DocsSearch";
import { DocsShellContext } from "./shellContext";

const meta = preview.meta({
  title: "Docs/DocsSearch",
  tags: ["autodocs"],
  parameters: { layout: "padded" },
});

const onRolesPage = { currentRoute: "/docs/sharing/roles", content: () => null };

export const Open = meta.story({
  tags: ["open-state"],
  render: () => (
    <DocsSearch
      indexUrl={searchIndexUrl}
      navigate={() => undefined}
      defaultOpen
    />
  ),
});

export const Results = meta.story({
  tags: ["open-state"],
  // The name is the item's label; the snippet and page are its description, which WCAG 2.5.3 allows.
  parameters: {
    a11y: { config: { rules: [{ id: "label-content-name-mismatch", enabled: false }] } },
  },
  render: () => (
    <DocsShellContext value={onRolesPage}>
      <DocsSearch
        indexUrl={searchIndexUrl}
        navigate={() => undefined}
        defaultOpen
        defaultQuery="role"
      />
    </DocsShellContext>
  ),
});
