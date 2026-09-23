import type { CSSProperties } from "react";

import { FlatIndentGuide } from "./TreeView";

export const TreeRowIndentGuides = ({ indexPath }: { indexPath: number[] }) =>
  Array.from({ length: Math.max(0, indexPath.length - 1) }, (_, index) => {
    const style: CSSProperties & { "--depth": number } = { "--depth": index + 1 };
    return (
      <FlatIndentGuide
        key={index}
        aria-hidden="true"
        data-virtualized="true"
        style={style}
      />
    );
  });
