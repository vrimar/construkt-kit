import { RefreshCwIcon } from "lucide-react";

import { Button } from "../Buttons";
import { EmptyState } from "../EmptyState";
import { LoadingOverlay } from "../LoadingOverlay";
import { useDataTableContext } from "./context";

interface DataTableStatusProps {
  /** `fill` grows to fill the table body; `flow` takes only its own height. */
  layout: "fill" | "flow";
  isEmpty: boolean;
}

export const DataTableStatus = ({ layout, isEmpty }: DataTableStatusProps) => {
  const { loading, labels, onReset } = useDataTableContext();

  return (
    <>
      <LoadingOverlay loading={loading} />
      {!loading && isEmpty && (
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
      )}
    </>
  );
};
