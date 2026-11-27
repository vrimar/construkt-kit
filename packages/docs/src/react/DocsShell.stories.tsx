import preview from "@construkt-kit/story-kit/preview";
import { Alert } from "@construkt-kit/ui";

import { StoryLink, WithRoute, headings, nav, searchIndexUrl } from "../../test/fixture";
import { AnchoredH2, AnchoredH3 } from "./AnchoredHeading";
import { DocsArticle } from "./DocsArticle";
import { DocsPager } from "./DocsPager";
import { DocsSearch } from "./DocsSearch";
import { DocsShell, DocsSkipLink } from "./DocsShell";
import { DocsToc } from "./DocsToc";

const meta = preview.meta({
  title: "Docs/DocsShell",
  tags: ["autodocs"],
  parameters: { layout: "padded" },
});

export const Page = meta.story({
  render: () => (
    <WithRoute initial="/docs/sharing/roles/">
      {(route, navigate) => (
        <>
          <DocsSkipLink />
          <DocsShell
            nav={nav}
            currentRoute={route}
            LinkComponent={StoryLink}
            search={
              <DocsSearch
                indexUrl={searchIndexUrl}
                navigate={navigate}
              />
            }
            aside={<DocsToc headings={headings} />}
            menuLinks={[{ href: "https://example.com/", title: "example.com" }]}
          >
            <DocsArticle
              title="Roles and permissions"
              description="A role is a set of permissions, and everyone in a project has one."
              badge="How-to"
              lastModified="2026-03-02T10:00:00Z"
              toc={
                <DocsToc
                  headings={headings}
                  collapsible
                />
              }
              footer={
                <DocsPager
                  nav={nav}
                  currentRoute={route}
                  LinkComponent={StoryLink}
                />
              }
            >
              <p>
                Every project starts with an Owner role. Add roles beside it to give people less
                access.
              </p>
              <Alert.Root
                status="info"
                variant="subtle"
              >
                <Alert.Content>
                  <Alert.Title render={<p />}>Tip</Alert.Title>
                  <Alert.Description>
                    <p>A person&apos;s role applies to every page in the project.</p>
                  </Alert.Description>
                </Alert.Content>
              </Alert.Root>
              <AnchoredH2 id="add-a-role">Add a role</AnchoredH2>
              <ol>
                <li>Open the project menu.</li>
                <li>
                  Choose <strong>Add role</strong>.
                </li>
              </ol>
              <AnchoredH3 id="from-a-template">From a template</AnchoredH3>
              <p>
                Pick a template from the list. Each permission becomes a switch; press{" "}
                <kbd>Esc</kbd> to cancel.
              </p>
              <AnchoredH2 id="reorder-roles">Reorder roles</AnchoredH2>
              <p>
                Drag a role by its handle. <code>Owner</code> always stays first.
              </p>
              <AnchoredH2 id="limits">Limits</AnchoredH2>
              <table>
                <thead>
                  <tr>
                    <th>What</th>
                    <th>Limit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Roles per project</td>
                    <td>200</td>
                  </tr>
                </tbody>
              </table>
            </DocsArticle>
          </DocsShell>
        </>
      )}
    </WithRoute>
  ),
});
