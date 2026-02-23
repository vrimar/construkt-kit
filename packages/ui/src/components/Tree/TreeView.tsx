import type { BoxProps } from "@chakra-ui/react";
import { Box } from "@chakra-ui/react";
import type { ItemInstance, TreeConfig, TreeInstance } from "@headless-tree/core";
import { hotkeysCoreFeature, selectionFeature, syncDataLoaderFeature } from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import type { ReactNode } from "react";
import { Fragment } from "react";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";

export interface TreeViewItem {
  id: string;
  name: string;
  children?: string[];
  icon?: ReactNode;
  isFolder?: boolean;
}

export type TreeViewConfig<T> = Omit<TreeConfig<T>, "features"> & {
  features?: TreeConfig<T>["features"];
};

export interface TreeViewProps<T> extends Omit<BoxProps, "children"> {
  tree: TreeInstance<T>;
  renderItem?: (item: ItemInstance<T>) => ReactNode;
  indent?: number;
}

const defaultFeatures = [syncDataLoaderFeature, selectionFeature, hotkeysCoreFeature];

export function useTreeView<T>(config: TreeViewConfig<T>) {
  return useTree<T>({
    ...config,
    features: config.features ?? defaultFeatures,
  });
}

export function TreeView<T>({ tree, renderItem, indent = 20, ...boxProps }: TreeViewProps<T>) {
  return (
    <Box
      {...tree.getContainerProps()}
      role="tree"
      outline="none"
      fontSize="sm"
      {...boxProps}
    >
      {tree.getItems().map((item) => (
        <Fragment key={item.getId()}>
          {renderItem ? (
            renderItem(item)
          ) : (
            <TreeViewItem
              item={item}
              indent={indent}
            />
          )}
        </Fragment>
      ))}
    </Box>
  );
}

interface TreeViewItemProps<T> {
  item: ItemInstance<T>;
  indent: number;
}

function TreeViewItem<T>({ item, indent }: TreeViewItemProps<T>) {
  return (
    <Box
      asChild
      display="flex"
      alignItems="center"
      w="full"
      textAlign="start"
      rounded="sm"
      cursor="pointer"
      userSelect="none"
      px="2"
      py="1"
      transition="backgrounds"
      _hover={{ bg: "bg.subtle" }}
      style={{ paddingLeft: `${item.getItemMeta().level * indent}px` }}
      {...(item.isSelected() && { bg: "bg.emphasized" })}
      {...(item.isFocused() && {
        outline: "2px solid",
        outlineColor: "border.emphasized",
        outlineOffset: "-2px",
      })}
    >
      <button {...item.getProps()}>
        {item.isFolder() && (
          <Box as="span" mr="1" color="fg.muted" display="inline-flex" alignItems="center" flexShrink={0}>
            {item.isExpanded() ? <FiChevronDown /> : <FiChevronRight />}
          </Box>
        )}
        <Box
          as="span"
          truncate
        >
          {item.getItemName()}
        </Box>
      </button>
    </Box>
  );
}
