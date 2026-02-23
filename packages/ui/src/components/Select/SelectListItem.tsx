import { Box, HStack } from "@chakra-ui/react";
import React from "react";
import { FiCheck } from "react-icons/fi";

interface Props<T> {
  item: T;
  isSelected: boolean;
  renderLabel: (item: T) => React.ReactNode;
  onSelect: (item: T, e: React.MouseEvent<HTMLDivElement>) => void;
  activeItemStyle?: "checkmark" | "none";
  renderActions?: (item: T) => React.ReactNode;
}

export const SelectListItem = <T,>({
  item,
  isSelected,
  renderLabel,
  onSelect,
  activeItemStyle,
  renderActions,
}: Props<T>) => {
  const isCheckmarkStyle = activeItemStyle === "checkmark";

  const handleItemSelect = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest(".select__actions")) return;
    onSelect(item, e);
  };

  return (
    <Box onClick={handleItemSelect}>
      <HStack
        asChild
        px="2"
        py="1"
        borderRadius="4px"
        cursor="pointer"
        justifyContent="space-between"
        position="relative"
        _hover={{
          bg: "bg.subtle",
        }}
      >
        <HStack
          width="100%"
          color={isSelected ? "primary" : undefined}
        >
          {isCheckmarkStyle && (
            <Box
              opacity={isSelected ? "1" : "0"}
              mt="1"
            >
              <FiCheck />
            </Box>
          )}

          <Box
            flex="1"
            wordBreak="break-all"
            userSelect="none"
          >
            {renderLabel(item)}
          </Box>
          {renderActions && (
            <HStack
              className="select__actions"
              alignSelf="flex-start"
              gap="0"
              bg="bg"
              onClick={(e) => e.stopPropagation()}
            >
              {renderActions(item)}
            </HStack>
          )}
        </HStack>
      </HStack>
    </Box>
  );
};
