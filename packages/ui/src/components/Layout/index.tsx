export {
  Box,
  Center,
  Container,
  Divider,
  Flex,
  Float,
  Grid,
  GridItem,
  HStack,
  Spacer,
  Stack,
  VStack,
  Wrap,
} from "#styled-system/jsx";

export type {
  BoxProps,
  CenterProps,
  ContainerProps,
  DividerProps,
  FlexProps,
  FloatProps,
  GridItemProps,
  GridProps,
  HstackProps as HStackProps,
  SpacerProps,
  StackProps,
  VstackProps as VStackProps,
  WrapProps,
} from "#styled-system/jsx";

/** Re-export `Divider` as `Separator` for backward compatibility. */
export { Divider as Separator } from "#styled-system/jsx";
export type { DividerProps as SeparatorProps } from "#styled-system/jsx";

export { SimpleGrid, type SimpleGridProps } from "./SimpleGrid";
