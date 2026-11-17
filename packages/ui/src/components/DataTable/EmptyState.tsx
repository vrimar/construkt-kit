import { RefreshCwIcon } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

import { Box } from "#styled-system/jsx";

import { Button } from "../Buttons";
import { EmptyState } from "../EmptyState";
import { LoadingOverlay } from "../LoadingOverlay";
import { useDataTableContext } from "./context";

export const viewportWidthVar = "--data-table-viewport-width";

const pinnedToViewport: CSSProperties = {
  position: "sticky",
  insetInlineStart: 0,
  width: `var(${viewportWidthVar}, 100%)`,
};

interface DataTableStatusProps {
  /** `fill` grows to fill the table body; `flow` takes only its own height. */
  layout: "fill" | "flow";
  isEmpty: boolean;
  emptyState?: ReactNode;
}

export const DataTableStatus = ({ layout, isEmpty, emptyState }: DataTableStatusProps) => {
  const { loading, labels, onReset } = useDataTableContext();
  const fill = layout === "fill";
  const overlay = <LoadingOverlay loading={loading} />;

  return (
    <>
      {fill ? (
        <Box
          position="absolute"
          inset="0"
          pointerEvents="none"
        >
          <Box
            height="full"
            style={pinnedToViewport}
          >
            {overlay}
          </Box>
        </Box>
      ) : (
        overlay
      )}
      {isEmpty && emptyState != null && (
        <Box
          display="flex"
          flexDirection="column"
          flex={fill ? "1" : undefined}
          visibility={loading ? "hidden" : undefined}
          style={fill ? pinnedToViewport : undefined}
        >
          {emptyState}
        </Box>
      )}
      {isEmpty && emptyState == null && (
        // Hidden, not unmounted, while loading: it gives the overlay an empty body's height.
        <EmptyState.Root
          flex={fill ? "1" : undefined}
          visibility={loading ? "hidden" : undefined}
          style={fill ? pinnedToViewport : undefined}
        >
          <EmptyState.Content>
            <EmptyState.Title>{labels.noResults}</EmptyState.Title>
          </EmptyState.Content>
          {onReset && (
            <Button
              variant="outline"
              size="lg"
              onClick={onReset}
            >
              <RefreshCwIcon />
              {labels.resetFilters}
            </Button>
          )}
        </EmptyState.Root>
      )}
    </>
  );
};
