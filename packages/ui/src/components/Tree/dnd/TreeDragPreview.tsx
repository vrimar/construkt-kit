import { Box } from "@construkt-kit/styled-system/jsx";

/**
 * Default compact drag preview: a small pill (label + a `+N` badge for multi-drag) that,
 * offset from the pointer, keeps the drop target and drop indicator visible — unlike a
 * full-row preview under the cursor.
 */
export function TreeDragPreview({ label, count = 1 }: { label: string; count?: number }) {
  return (
    <Box
      display="inline-flex"
      alignItems="center"
      gap="1.5"
      maxW="240px"
      px="2"
      py="1"
      rounded="sm"
      bg="bg"
      borderWidth="1px"
      borderColor="border.emphasized"
      boxShadow="sm"
      fontSize="sm"
      lineHeight="1"
      color="fg"
    >
      <Box
        minW="0"
        truncate
      >
        {label}
      </Box>
      {count > 1 && (
        <Box
          colorPalette="blue"
          flexShrink={0}
          rounded="full"
          px="1.5"
          bg="colorPalette.solid.bg"
          color="colorPalette.solid.fg"
          fontSize="xs"
          fontWeight="medium"
        >
          +{count - 1}
        </Box>
      )}
    </Box>
  );
}
