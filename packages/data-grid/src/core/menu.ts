export interface MenuItem<TNode = unknown> {
  type?: "item";
  id: string;
  label: TNode;
  icon?: TNode;
  /** Trailing text, such as a shortcut. */
  hint?: TNode;
  disabled?: boolean;
  /** Danger colours, for actions that delete or can't be undone. */
  destructive?: boolean;
  onSelect?: () => void;
  /** Opens a submenu in place of running `onSelect`. */
  items?: readonly MenuEntry<TNode>[];
}

export interface MenuSeparator {
  type: "separator";
}

export type MenuEntry<TNode = unknown> = MenuItem<TNode> | MenuSeparator;

/** Anything with the element the menu should anchor to as `currentTarget`, such as a click event. */
export interface MenuAnchorEvent {
  currentTarget: unknown;
  /** 0 for a click a key press made, which opens the menu with its first item highlighted. */
  detail?: number;
}
