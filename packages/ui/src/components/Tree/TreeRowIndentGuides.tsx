import { Box } from "@construkt-kit/styled-system/jsx";

export const TreeRowIndentGuides = ({ indexPath }: { indexPath: number[] }) => {
  const ancestorDepths = Array.from(
    { length: Math.max(0, indexPath.length - 1) },
    (_, index) => index + 1,
  );

  if (ancestorDepths.length === 0) return null;

  return ancestorDepths.map((depth) => (
    <Box
      key={depth}
      aria-hidden="true"
      data-part="branch-indent-guide"
      data-scope="tree-view"
      data-virtualized="true"
      position="absolute"
      top="0"
      bottom="0"
      width="1px"
      bg="border"
      pointerEvents="none"
      style={{
        insetInlineStart: `calc(var(--tree-padding-inline) + ((${depth} - 1) * var(--tree-indent)) + (var(--tree-icon-size) * 0.5))`,
      }}
    />
  ));
};
