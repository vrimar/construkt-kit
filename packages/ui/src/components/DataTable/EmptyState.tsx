import { RefreshCwIcon } from "lucide-react";

import { Button } from "../Buttons";
import { EmptyState } from "../EmptyState";
import { LoadingOverlay } from "../LoadingOverlay";
import { useDataTableContext } from "./context";

interface DataTableEmptyStateProps {
  /** `fill` grows to fill the table body; `flow` takes only its own height. */
  layout: "fill" | "flow";
}

export const DataTableEmptyState = ({ layout }: DataTableEmptyStateProps) => {
  const { labels, onReset } = useDataTableContext();

  return (
    <EmptyState.Root flex={layout === "fill" ? "1" : undefined}>
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
  );
};

export const DataTableStatus = ({
  layout,
  isEmpty,
}: DataTableEmptyStateProps & { isEmpty: boolean }) => {
  const { loading } = useDataTableContext();

  return (
    <>
      <LoadingOverlay isActive={loading} />
      {!loading && isEmpty && <DataTableEmptyState layout={layout} />}
    </>
  );
};
