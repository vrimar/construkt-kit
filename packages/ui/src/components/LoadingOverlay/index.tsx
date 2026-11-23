import { Flex, type FlexProps, createSlotRecipeContext } from "#styled-system/jsx";
import { type SpinnerVariant, loadingOverlay } from "#styled-system/recipes";

import { renderable } from "../../primitives/render";
import { Spinner } from "../Spinner";

const { withProvider, withContext } = createSlotRecipeContext(loadingOverlay);

const Root = withProvider(Flex, "root");
const Content = withContext(renderable.div, "content");
const Tip = withContext(renderable.p, "tip");

type SpinnerSize = NonNullable<SpinnerVariant["size"]>;

export interface LoadingOverlayProps extends FlexProps {
  loading: boolean;
  backdrop?: boolean;
  tip?: string;
  relative?: boolean;
  size?: SpinnerSize;
}

export const LoadingOverlay = ({
  loading,
  backdrop = true,
  tip = "Loading...",
  relative = false,
  size = "xl",
  ...props
}: LoadingOverlayProps) => (
  <Root
    role="status"
    aria-busy={loading}
    aria-live="polite"
    backdrop={backdrop}
    relative={relative}
    size={size}
    {...props}
  >
    <Content>
      <Spinner size={size} />
      {tip && <Tip>{tip}</Tip>}
    </Content>
  </Root>
);
