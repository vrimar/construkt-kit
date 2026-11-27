import preview from "@construkt-kit/story-kit/preview";
import { Box } from "@construkt-kit/ui";

import { StoryLink, WithRoute, nav } from "../../test/fixture";
import { NavTree } from "./NavTree";

const meta = preview.meta({
  title: "Docs/NavTree",
  tags: ["autodocs"],
  parameters: { layout: "padded" },
});

export const InSection = meta.story({
  render: () => (
    <Box maxW="240px">
      <WithRoute initial="/docs/sharing/roles/">
        {(route) => (
          <NavTree
            nav={nav}
            currentRoute={route}
            LinkComponent={StoryLink}
          />
        )}
      </WithRoute>
    </Box>
  ),
});

export const OnTopLevelPage = meta.story({
  render: () => (
    <Box maxW="240px">
      <WithRoute initial="/docs/">
        {(route) => (
          <NavTree
            nav={nav}
            currentRoute={route}
            LinkComponent={StoryLink}
          />
        )}
      </WithRoute>
    </Box>
  ),
});
