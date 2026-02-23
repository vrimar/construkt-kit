import type { BoxProps } from "@chakra-ui/react";
import { Box } from "@chakra-ui/react";
import type {
  ListBoxProps as RACListBoxProps,
  ListBoxItemProps as RACListBoxItemProps,
  ListBoxSectionProps as RACListBoxSectionProps,
} from "react-aria-components";
import {
  ListBox as RACListBox,
  ListBoxItem as RACListBoxItem,
  ListBoxSection as RACListBoxSection,
  Header,
  Text,
  Collection,
} from "react-aria-components";
import type { ReactNode } from "react";
import { FiCheck } from "react-icons/fi";

export interface ListBoxProps<T extends object> extends RACListBoxProps<T> {
  /** Chakra BoxProps applied to the outer container */
  containerProps?: BoxProps;
}

export function ListBox<T extends object>({ containerProps, ...props }: ListBoxProps<T>) {
  return (
    <Box
      {...containerProps}
      asChild
      display="flex"
      flexDirection="column"
      gap="1"
      outline="none"
      p="1"
      borderWidth="1px"
      borderColor="border"
      borderRadius="md"
      bg="bg"
      maxHeight="320px"
      overflowY="auto"
      _empty={{ p: "4", textAlign: "center", color: "fg.muted", fontSize: "sm" }}
    >
      <RACListBox<T> {...props} />
    </Box>
  );
}

export interface ListBoxItemProps extends RACListBoxItemProps {
  /** Optional description rendered below the label */
  description?: string;
}

export function ListBoxItem({ children, description, ...props }: ListBoxItemProps) {
  return (
    <Box
      asChild
      display="flex"
      alignItems="center"
      gap="2"
      px="2"
      py="1.5"
      borderRadius="sm"
      cursor="pointer"
      userSelect="none"
      fontSize="sm"
      outline="none"
      transition="backgrounds"
      _hover={{ bg: "bg.subtle" }}
      data-rac=""
      css={{
        "&[data-focused]": { bg: "bg.subtle" },
        "&[data-selected]": { bg: "colorPalette.subtle", color: "colorPalette.fg" },
        "&[data-disabled]": { opacity: 0.5, cursor: "not-allowed" },
        "&[data-focus-visible]": {
          outline: "2px solid",
          outlineColor: "colorPalette.focusRing",
          outlineOffset: "-2px",
        },
      }}
    >
      <RACListBoxItem {...props}>
        {({ isSelected }) => (
          <>
            <Box
              as="span"
              display="inline-flex"
              alignItems="center"
              flexShrink={0}
              w="4"
              color="colorPalette.fg"
              opacity={isSelected ? 1 : 0}
            >
              <FiCheck />
            </Box>
            {description ? (
              <Box flex="1" minW="0">
                <Text slot="label">{children as ReactNode}</Text>
                <Box as="span" display="block" fontSize="xs" color="fg.muted" truncate>
                  <Text slot="description">{description}</Text>
                </Box>
              </Box>
            ) : (
              <Box as="span" flex="1" truncate>
                {children as ReactNode}
              </Box>
            )}
          </>
        )}
      </RACListBoxItem>
    </Box>
  );
}

export interface ListBoxSectionProps<T extends object> extends RACListBoxSectionProps<T> {
  /** Section heading text */
  title?: string;
}

export function ListBoxSection<T extends object>({
  title,
  children,
  ...props
}: ListBoxSectionProps<T>) {
  return (
    <RACListBoxSection {...props}>
      {title && (
        <Header
          style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            padding: "0.25rem 0.5rem",
            color: "var(--chakra-colors-fg-muted)",
          }}
        >
          {title}
        </Header>
      )}
      {children as ReactNode}
    </RACListBoxSection>
  );
}

export { Collection, Text, Header };
