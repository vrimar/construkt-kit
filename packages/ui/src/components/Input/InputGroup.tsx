import { ark } from "@ark-ui/react/factory";
import {
  type ComponentProps,
  type ReactNode,
  type RefObject,
  createContext,
  useContext,
  useRef,
} from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { type InputGroupVariant, inputGroup } from "#styled-system/recipes";

import { useComposedRefs } from "../../hooks/useComposedRefs";
import type { ButtonProps, CloseButtonProps } from "../Buttons";
import { ClearButton, type ClearButtonProps } from "../Buttons/ClearButton";
import type { InputProps } from "./Input";

const { withProvider, withContext } = createSlotRecipeContext(inputGroup);

type InputGroupSize = NonNullable<InputGroupVariant["size"]>;

/** Button size that fits inside an input group's start/end element slot at each input size. */
const inputGroupButtonSize: Record<InputGroupSize, ButtonProps["size"]> = {
  "2xs": "2xs",
  xs: "2xs",
  sm: "xs",
  md: "sm",
  lg: "md",
  xl: "lg",
  "2xl": "xl",
};

export const inputGroupButtonSizeFor = (size: InputProps["size"] = "md"): ButtonProps["size"] =>
  inputGroupButtonSize[size as InputGroupSize];

const InputGroupRootContext = createContext<RefObject<HTMLDivElement | null> | null>(null);

const GROUP_FIELD = "input:not([type=hidden]), textarea";

export interface InputGroupClearButtonProps extends Omit<CloseButtonProps, "size" | "children"> {
  size?: InputProps["size"];
  /** The field that takes focus once a clear removes the button. Defaults to the group's field. */
  field?: ClearButtonProps["field"];
}

/** A clear button sized for the group; once a clear removes it, the group's field takes focus. */
export const InputGroupClearButton = ({ size, field, ...props }: InputGroupClearButtonProps) => {
  const rootRef = useContext(InputGroupRootContext);
  return (
    <ClearButton
      size={inputGroupButtonSizeFor(size)}
      field={field ?? (() => rootRef?.current?.querySelector<HTMLElement>(GROUP_FIELD))}
      {...props}
    />
  );
};

type RootProps = ComponentProps<typeof Root>;
const Root = withProvider(ark.div, "root");
const Element = withContext(ark.div, "element");

export interface InputGroupProps extends RootProps {
  startElement?: ReactNode | undefined;
  endElement?: ReactNode | undefined;
}

export const InputGroup = ({
  ref,
  startElement,
  endElement,
  children,
  ...rest
}: InputGroupProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const composedRef = useComposedRefs(ref, rootRef);

  return (
    <InputGroupRootContext.Provider value={rootRef}>
      <Root
        ref={composedRef}
        {...rest}
      >
        {startElement && (
          <Element
            insetInlineStart="0"
            top="0"
          >
            {startElement}
          </Element>
        )}
        {children}
        {endElement && (
          <Element
            insetInlineEnd="0"
            top="0"
          >
            {endElement}
          </Element>
        )}
      </Root>
    </InputGroupRootContext.Provider>
  );
};
