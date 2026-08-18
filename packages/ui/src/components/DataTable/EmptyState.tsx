import { RefreshCwIcon } from "lucide-react";

import { Button } from "../Buttons";
import { Box, Stack } from "../Layout";
import { Text } from "../Text";

interface DataTableEmptyStateProps {
  noResultsLabel: string;
  resetFiltersLabel: string;
  onReset?: () => void;
  /** `fill` absolutely covers the scroll viewport; `flow` sits in the document flow. */
  layout: "fill" | "flow";
}

export const DataTableEmptyState = ({
  noResultsLabel,
  resetFiltersLabel,
  onReset,
  layout,
}: DataTableEmptyStateProps) => (
  <Box
    display="flex"
    alignItems="center"
    justifyContent="center"
    {...(layout === "fill"
      ? { position: "absolute", top: "0", left: "0", width: "100%", height: "100%" }
      : { py: "10" })}
  >
    <Stack alignItems={layout === "flow" ? "center" : undefined}>
      <Text fontSize="lg">{noResultsLabel}</Text>
      {onReset && (
        <Button
          variant="outline"
          size="lg"
          onClick={onReset}
        >
          <RefreshCwIcon />
          {resetFiltersLabel}
        </Button>
      )}
    </Stack>
  </Box>
);
