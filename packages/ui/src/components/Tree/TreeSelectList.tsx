import { SquareCheckIcon, SquareIcon, SquareMinusIcon } from "lucide-react";
import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";

import { Box, Flex } from "#styled-system/jsx";
import type { TreeViewVariant } from "#styled-system/recipes";

import { TooltipIconButton, type TooltipIconButtonProps } from "../Buttons";
import { SelectionSearchField, splitKeys } from "../Listbox/managed";
import { TreeViewDndProvider, type TreeViewDndProviderProps } from "./dnd/TreeDndContext";
import type { TreeCheckedState } from "./treeCollection";
import { TreeNodeContent, type TreeNodeRenderDetails } from "./TreeRow";
import {
  FlatBranchIndicator,
  FlatNodeCheckbox,
  type TreeRenameDetails,
  TreeRowContent,
  TreeView,
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

const TreeSelectListContext = createContext<TreeSelectListState<unknown> | null>(null);

function useTreeSelectListState<TNode>(): TreeSelectListState<TNode> {
  const context = useContext(TreeSelectListContext);
  if (!context) {
    throw new Error("TreeSelectList parts must be rendered inside TreeSelectList.RootProvider.");
  }
  return context as TreeSelectListState<TNode>;
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
  loading: boolean;
  checkable: boolean;
  checked: TreeCheckedState;
  actions: ReactNode;
  children: ReactNode;
  onToggleChecked: () => void;
}

const TreeSelectRow = ({
  loading,
  checkable,
  checked,
  actions,
  children,
  onToggleChecked,
}: TreeSelectRowProps) => {
  const { isBranch, renaming } = useTreeNodeState();

  return (
    <VirtualTreeRow
      loading={loading}
      aria-checked={checkable ? (checked === "indeterminate" ? "mixed" : checked) : undefined}
      onKeyDown={(e) => {
        if (!checkable || e.target !== e.currentTarget) return;
        if (e.key === " " || (e.key === "Enter" && !isBranch)) {
          e.preventDefault();
          onToggleChecked();
        }
      }}
    >
      {isBranch ? <TreeView.BranchIndicator /> : <FlatBranchIndicator aria-hidden="true" />}
      {checkable && (
        <TreeView.NodeCheckbox
          checked={checked}
          onClick={(e) => {
            // Bails out the root's own toggle, which would also check unselectable leaves.
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.closest<HTMLElement>("[role=treeitem]")?.focus({ preventScroll: true });
            onToggleChecked();
          }}
        />
      )}
      <TreeRowContent>{renaming ? <TreeView.NodeRenameInput /> : children}</TreeRowContent>
      {actions && !renaming && <TreeView.NodeActions>{actions}</TreeView.NodeActions>}
    </VirtualTreeRow>
  );
};

const NO_SELECTION: string[] = [];

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

  const handleNodesChange = (nextNodes: TNode[]) => {
    list.carryLoads(nextNodes);
    onNodesChange?.(nextNodes);
  };

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
            {list.isCheckable({ node, indexPath, isBranch: true }) && (
              <FlatNodeCheckbox style={{ visibility: "hidden" }} />
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
          const nodeValue = displayedCollection.getNodeValue(node);
          const isBranch = displayedCollection.isBranchNode(node);
          const details = nodeDetails(node, indexPath, isBranch);
          const checkable = list.isCheckable({ node, indexPath, isBranch });

          return (
            <TreeSelectRow
              loading={list.loadingValues.has(nodeValue)}
              checkable={checkable}
              checked={checkable && list.checkedState(node, isBranch)}
              actions={renderActions?.(details)}
              onToggleChecked={() => list.toggle(node, isBranch)}
            >
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
    <TreeView.Root
      nodes={displayedCollection.nodes}
      {...displayedCollection.accessors}
      expandedValue={list.expandedValue}
      onExpandedChange={list.onExpandedChange}
      selectedValue={NO_SELECTION}
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
          onNodesChange={handleNodesChange}
          isBranchLoaded={list.isBranchLoaded}
          disabled={!list.dndAllowed}
          scrollElement={scrollViewport}
        >
          {treeBody}
        </TreeViewDndProvider>
      ) : (
        treeBody
      )}
    </TreeView.Root>
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

export const TreeSelectList = Object.assign(TreeSelectListRoot, {
  RootProvider,
  Search,
  Tree,
});
