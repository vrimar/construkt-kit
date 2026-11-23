import { SquareCheckIcon, SquareIcon, SquareMinusIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import { Box, Flex } from "#styled-system/jsx";
import type { TreeViewVariant } from "#styled-system/recipes";

import { splitKeys } from "../../foundations/props";
import { TooltipIconButton, type TooltipIconButtonProps } from "../Buttons";
import { createPartContext } from "../partContext";
import { SelectionSearchField } from "../selection";
import { TreeViewDndProvider, type TreeViewDndProviderProps } from "./dnd/TreeDndContext";
import { TreeNodeContent, type TreeNodeRenderDetails } from "./TreeRow";
import {
  LazyLoadedTreeRoot,
  type TreeRenameDetails,
  TreeRowContent,
  TreeView,
  useTreeContext,
  useTreeNodeState,
} from "./TreeView";
import {
  type TreeSelectListState,
  useTreeSelectList,
  type UseTreeSelectListProps,
  type UseTreeSelectListReturn,
} from "./useTreeSelectList";
import { VirtualTree, type VirtualTreeEntry, VirtualTreeRow } from "./VirtualTree";

type TreeSize = NonNullable<TreeViewVariant["size"]>;

// Must match the recipe's row padding-y + line-height per size.
const TREE_ROW_HEIGHT_ESTIMATE: Record<TreeSize, number> = {
  sm: 28,
  md: 32,
};

const SELECT_ALL_BUTTON_SIZE: Record<TreeSize, TooltipIconButtonProps["size"]> = {
  sm: "xs",
  md: "sm",
};

const [TreeSelectListContext, useListContext] = createPartContext<TreeSelectListState<unknown>>(
  "<TreeSelectList.RootProvider>",
  "TreeSelectList parts",
);

function useTreeSelectListState<TNode>(): TreeSelectListState<TNode> {
  return useListContext() as TreeSelectListState<TNode>;
}

export interface TreeSelectListRootProviderProps {
  /** What `useTreeSelectList` returns. */
  value: UseTreeSelectListReturn;
  children?: ReactNode;
}

function RootProvider({ value, children }: TreeSelectListRootProviderProps) {
  return (
    <TreeSelectListContext.Provider value={value as TreeSelectListState<unknown>}>
      {children}
    </TreeSelectListContext.Provider>
  );
}

export interface TreeSelectListSearchProps {
  /** Show the select-all toggle button. @default true */
  showSelectAll?: boolean;
  /** Label of the select-all toggle while not everything is selected. @default "Select all" */
  selectAllLabel?: string;
  /** Label of the select-all toggle while everything is selected. @default "Deselect all" */
  clearAllLabel?: string;
  /** Size of the select-all toggle; match the tree's. @default "md" */
  size?: TreeSize;
}

function Search({
  showSelectAll = true,
  selectAllLabel = "Select all",
  clearAllLabel = "Deselect all",
  size = "md",
}: TreeSelectListSearchProps) {
  const list = useTreeSelectListState();
  const { search } = list;

  const selectAllButton = showSelectAll && (
    <TooltipIconButton
      label={list.allSelected ? clearAllLabel : selectAllLabel}
      size={SELECT_ALL_BUTTON_SIZE[size]}
      variant="plain"
      color="fg.muted"
      mr="1"
      flexShrink={0}
      onClick={() => (list.allSelected ? list.deselectAll() : list.selectAll())}
    >
      {list.allSelected ? (
        <SquareCheckIcon />
      ) : list.someSelected ? (
        <SquareMinusIcon />
      ) : (
        <SquareIcon />
      )}
    </TooltipIconButton>
  );

  return search.showInput ? (
    <Box mb="2">
      <SelectionSearchField
        search={search}
        endElement={
          <>
            {search.endElement}
            {selectAllButton}
          </>
        }
      />
    </Box>
  ) : (
    selectAllButton && (
      <Flex
        borderBottomWidth="1px"
        borderColor="border"
        align="center"
        mb="2"
      >
        {selectAllButton}
      </Flex>
    )
  );
}

type TreeSelectListDndProps<TNode> = Pick<
  TreeViewDndProviderProps<TNode>,
  | "isNodeDraggable"
  | "blockReparent"
  | "autoExpandDelay"
  | "onDrop"
  | "onDragStart"
  | "onDragEnd"
  | "canDrop"
  | "getDragValues"
  | "getExtraDragData"
  | "renderDragPreview"
  | "getDropAnnouncement"
  | "autoScrollSpeed"
>;

export interface TreeSelectListTreeProps<TNode> extends TreeSelectListDndProps<TNode> {
  /** Render custom node content. Defaults to the node label. */
  renderNode?: (details: TreeNodeRenderDetails<TNode>) => ReactNode;
  /** Render actions aligned to the end of a row. */
  renderActions?: (details: TreeNodeRenderDetails<TNode>) => ReactNode;
  /**
   * `hover` shows row actions over the end of the row only while it is hovered, focused within or
   * holding an open menu, and always on touch screens. @default "always"
   */
  actionsVisibility?: TreeViewVariant["actionsVisibility"];
  /** Wrap node text onto up to two lines instead of truncating it. @default false */
  clampText?: boolean;
  /**
   * Pins the branch heading of the topmost visible row above the list while its children scroll
   * by. @default false
   */
  stickyBranches?: boolean;
  /** Lets F2 rename the focused node when it returns true. */
  canRename?: (details: TreeNodeRenderDetails<TNode>) => boolean;
  /** Called when a rename is submitted, with the node's value and its new label. */
  onRenameComplete?: (value: string, details: TreeRenameDetails) => void;
  /**
   * Height of the scroll area: px if a number, otherwise a size token or CSS length.
   * @default "320px"
   */
  listHeight?: string | number;
  /** Size variant. @default "md" */
  size?: TreeSize;
  /**
   * Enables drag-and-drop reordering. Called with the reordered nodes after a drop.
   * DnD is automatically disabled while a search query or `nodeFilter` is active.
   */
  onNodesChange?: (nodes: TNode[]) => void;
}

const TREE_PROP_KEYS = {
  renderNode: true,
  renderActions: true,
  actionsVisibility: true,
  clampText: true,
  stickyBranches: true,
  canRename: true,
  onRenameComplete: true,
  listHeight: true,
  size: true,
  onNodesChange: true,
  isNodeDraggable: true,
  blockReparent: true,
  autoExpandDelay: true,
  onDrop: true,
  onDragStart: true,
  onDragEnd: true,
  canDrop: true,
  getDragValues: true,
  getExtraDragData: true,
  renderDragPreview: true,
  getDropAnnouncement: true,
  autoScrollSpeed: true,
} as const satisfies Record<keyof TreeSelectListTreeProps<unknown>, true>;

interface TreeSelectRowProps {
  actions: ReactNode;
  children: ReactNode;
}

const TreeSelectRow = ({ actions, children }: TreeSelectRowProps) => {
  const { tree } = useTreeContext();
  const { node, isBranch, renaming, checkable } = useTreeNodeState();
  const checksOnPress = checkable && !isBranch;

  return (
    <VirtualTreeRow
      onClick={(e) => {
        if (checksOnPress && !renaming && e.button === 0) tree.toggleChecked(node);
      }}
      onKeyDown={(e) => {
        if (checksOnPress && e.key === "Enter" && e.target === e.currentTarget) {
          e.preventDefault();
          tree.toggleChecked(node);
        }
      }}
    >
      {isBranch ? (
        <TreeView.BranchIndicator />
      ) : (
        <TreeView.BranchIndicator>{null}</TreeView.BranchIndicator>
      )}
      {checkable && <TreeView.NodeCheckbox />}
      <TreeRowContent>{renaming ? <TreeView.NodeRenameInput /> : children}</TreeRowContent>
      {actions && !renaming && <TreeView.NodeActions>{actions}</TreeView.NodeActions>}
    </VirtualTreeRow>
  );
};

function Tree<TNode>({
  renderNode,
  renderActions,
  actionsVisibility,
  clampText,
  stickyBranches = false,
  canRename,
  onRenameComplete,
  listHeight = "320px",
  size = "md",
  onNodesChange,
  ...dndProps
}: TreeSelectListTreeProps<TNode>) {
  const list = useTreeSelectListState<TNode>();
  const { displayedCollection, toSourceIndexPath } = list;
  const [scrollViewport, setScrollViewport] = useState<HTMLDivElement | null>(null);

  const nodeDetails = (node: TNode, indexPath: number[], isBranch: boolean) => ({
    node,
    indexPath: toSourceIndexPath(indexPath),
    isBranch,
  });

  const treeBody = (
    <TreeView.Tree>
      <VirtualTree<TNode>
        rowHeight={TREE_ROW_HEIGHT_ESTIMATE[size]}
        height={listHeight}
        maxHeight={listHeight}
        ref={setScrollViewport}
        p="2"
        stickyBranches={stickyBranches}
        renderStickyBranch={({ node, indexPath }) => (
          <>
            {list.isNodeCheckable(node) && (
              <TreeView.NodeCheckbox style={{ visibility: "hidden" }} />
            )}
            <TreeRowContent>
              <TreeNodeContent
                details={nodeDetails(node, indexPath, true)}
                renderNode={renderNode}
              />
            </TreeRowContent>
          </>
        )}
      >
        {({ node, indexPath }: VirtualTreeEntry<TNode>) => {
          const details = nodeDetails(node, indexPath, displayedCollection.isBranchNode(node));
          return (
            <TreeSelectRow actions={renderActions?.(details)}>
              <TreeNodeContent
                details={details}
                renderNode={renderNode}
              />
            </TreeSelectRow>
          );
        }}
      </VirtualTree>
    </TreeView.Tree>
  );

  return (
    <LazyLoadedTreeRoot
      nodes={displayedCollection.nodes}
      {...displayedCollection.accessors}
      lazyLoad={list.lazyLoad}
      selectionMode="none"
      checkable
      isNodeCheckable={list.isNodeCheckable}
      checkedValue={list.checkedValue}
      onCheckedChange={list.onCheckedChange}
      expandedValue={list.expandedValue}
      onExpandedChange={list.onExpandedChange}
      canRename={
        canRename &&
        ((node: TNode, indexPath: number[]) =>
          canRename(nodeDetails(node, indexPath, displayedCollection.isBranchNode(node))))
      }
      onRenameComplete={
        onRenameComplete &&
        ((renamed: string, details: TreeRenameDetails) =>
          onRenameComplete(renamed, {
            ...details,
            indexPath: toSourceIndexPath(details.indexPath),
          }))
      }
      size={size}
      actionsVisibility={actionsVisibility}
      clampText={clampText}
    >
      {onNodesChange ? (
        // Keep the provider mounted: toggling `disabled` must not remount the tree.
        <TreeViewDndProvider
          {...dndProps}
          onNodesChange={onNodesChange}
          disabled={!list.dndAllowed}
          scrollElement={scrollViewport}
        >
          {treeBody}
        </TreeViewDndProvider>
      ) : (
        treeBody
      )}
    </LazyLoadedTreeRoot>
  );
}

export type TreeSelectListProps<TNode> = UseTreeSelectListProps<TNode> &
  Omit<TreeSelectListSearchProps, "size"> &
  TreeSelectListTreeProps<TNode>;

function TreeSelectListRoot<TNode>(props: TreeSelectListProps<TNode>) {
  const list = useTreeSelectList(props);
  const [treeProps] = splitKeys(props, TREE_PROP_KEYS);

  return (
    <RootProvider value={list}>
      <Flex direction="column">
        <Search
          showSelectAll={props.showSelectAll}
          selectAllLabel={props.selectAllLabel}
          clearAllLabel={props.clearAllLabel}
          size={props.size}
        />
        <Tree<TNode> {...(treeProps as TreeSelectListTreeProps<TNode>)} />
      </Flex>
    </RootProvider>
  );
}

/**
 * A searchable tree whose leaves check on and off, with a select-all toggle. Clicking a leaf row
 * checks it; clicking a branch row expands it, and its checkbox checks every leaf under it. For
 * controls of your own around the list, call `useTreeSelectList` and render `RootProvider`,
 * `Search` and `Tree`.
 */
export const TreeSelectList = Object.assign(TreeSelectListRoot, {
  RootProvider,
  Search,
  Tree,
});
