import { TreeView, depthStyle } from "./TreeView";

export const TreeRowIndentGuides = ({ indexPath }: { indexPath: number[] }) =>
  Array.from({ length: Math.max(0, indexPath.length - 1) }, (_, index) => (
    <TreeView.BranchIndentGuide
      key={index}
      aria-hidden="true"
      data-depth={index + 1}
      style={depthStyle(index + 1)}
    />
  ));
