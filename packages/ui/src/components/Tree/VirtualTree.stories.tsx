import preview from "@construkt-kit/story-kit/preview";
import { useState } from "react";

import { TreeView, VirtualTree, VirtualTreeRow, createTreeCollection, useVirtualTreeView } from ".";
import { Box } from "../Layout";

const meta = preview.meta({
  title: "Components/VirtualTree",
  tags: ["autodocs"],
});

interface ChapterNode {
  id: string;
  label: string;
  children?: ChapterNode[];
}

const collection = createTreeCollection<ChapterNode>({
  nodeToValue: (node) => node.id,
  nodeToString: (node) => node.label,
  rootNode: {
    id: "ROOT",
    label: "",
    children: Array.from({ length: 12 }, (_, part) => ({
      id: `part-${part + 1}`,
      label: `Part ${part + 1}`,
      children: Array.from({ length: 40 }, (__, chapter) => ({
        id: `part-${part + 1}/chapter-${chapter + 1}`,
        label: `Chapter ${part + 1}.${chapter + 1}`,
      })),
    })),
  },
});

function NavigationTreeDemo() {
  const [selected, setSelected] = useState<string[]>(["part-1/chapter-3"]);
  const [expanded, setExpanded] = useState<string[]>(["part-1", "part-2"]);
  const tree = useVirtualTreeView({
    collection,
    selectionMode: "single",
    selectedValue: selected,
    onSelectionChange: ({ selectedValue }) => setSelected(selectedValue),
    expandedValue: expanded,
    onExpandedChange: ({ expandedValue }) => setExpanded(expandedValue),
  });

  return (
    <Box
      maxW="320px"
      borderWidth="1px"
      borderColor="border"
      borderRadius="lg"
    >
      <TreeView.RootProvider value={tree.api}>
        <TreeView.Tree aria-label="Chapters">
          <VirtualTree
            tree={tree}
            rowHeight={32}
            height="400px"
            p="2"
            stickyBranches
            renderStickyBranch={({ node }) => (
              <>
                <TreeView.BranchText>{node.label}</TreeView.BranchText>
                <TreeView.BranchCount>{node.children?.length}</TreeView.BranchCount>
              </>
            )}
          >
            {({ node }) => (
              <VirtualTreeRow>
                {node.children ? (
                  <>
                    <TreeView.BranchIndicator />
                    <TreeView.BranchText>{node.label}</TreeView.BranchText>
                    <TreeView.BranchCount>{node.children.length}</TreeView.BranchCount>
                  </>
                ) : (
                  <TreeView.ItemText>{node.label}</TreeView.ItemText>
                )}
              </VirtualTreeRow>
            )}
          </VirtualTree>
        </TreeView.Tree>
      </TreeView.RootProvider>
    </Box>
  );
}

/** A single-select tree of 480 rows that renders only those in view; branch headings stay pinned. */
export const NavigationTree = meta.story({
  render: () => <NavigationTreeDemo />,
});
