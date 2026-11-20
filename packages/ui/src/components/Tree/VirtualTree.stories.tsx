import preview from "@construkt-kit/story-kit/preview";
import { useState } from "react";

import { TreeView, VirtualTree, type VirtualTreeEntry, VirtualTreeRow } from ".";
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

const chapters: ChapterNode[] = Array.from({ length: 12 }, (_, part) => ({
  id: `part-${part + 1}`,
  label: `Part ${part + 1}`,
  children: Array.from({ length: 40 }, (__, chapter) => ({
    id: `part-${part + 1}/chapter-${chapter + 1}`,
    label: `Chapter ${part + 1}.${chapter + 1}`,
  })),
}));

const chapterValue = (node: ChapterNode) => node.id;
const chapterLabel = (node: ChapterNode) => node.label;

function NavigationTreeDemo() {
  const [selected, setSelected] = useState<string[]>(["part-1/chapter-3"]);
  const [expanded, setExpanded] = useState<string[]>(["part-1", "part-2"]);

  return (
    <Box
      maxW="320px"
      borderWidth="1px"
      borderColor="border"
      borderRadius="lg"
    >
      <TreeView.Root
        nodes={chapters}
        getNodeValue={chapterValue}
        getNodeLabel={chapterLabel}
        selectedValue={selected}
        onSelectionChange={setSelected}
        expandedValue={expanded}
        onExpandedChange={setExpanded}
      >
        <TreeView.Tree aria-label="Chapters">
          <VirtualTree
            rowHeight={32}
            height="400px"
            p="2"
            stickyBranches
            renderStickyBranch={({ node }: VirtualTreeEntry<ChapterNode>) => (
              <>
                <TreeView.BranchText>{node.label}</TreeView.BranchText>
                <TreeView.BranchCount>{node.children?.length}</TreeView.BranchCount>
              </>
            )}
          >
            {({ node }: VirtualTreeEntry<ChapterNode>) => (
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
      </TreeView.Root>
    </Box>
  );
}

/** A single-select tree of 480 rows that renders only those in view; branch headings stay pinned. */
export const NavigationTree = meta.story({
  render: () => <NavigationTreeDemo />,
});
