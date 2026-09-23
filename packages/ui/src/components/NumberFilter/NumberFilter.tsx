import { HStack } from "@construkt-kit/styled-system/jsx";
import {
  NUMBER_FILTER_OPERATORS,
  type NumberFilterOperator,
  type NumberFilterValue,
  isValidNumber,
} from "@construkt-kit/utils";
import { useState } from "react";
import { useDebounce } from "react-use";

import { useControlledMirror } from "../../hooks/useControlledMirror";
import { IconButton } from "../Buttons";
import {
  Input,
  InputGroup,
  InputGroupClearButton,
  type InputProps,
  inputGroupButtonSizeFor,
} from "../Input";
import { Menu } from "../Menu";
import { operatorLabels, operatorSymbols } from "./operators";

export interface NumberFilterProps {
  /** Controlled filter value; undefined means no active filter. */
  value: NumberFilterValue | undefined;
  onValueChange: (value: NumberFilterValue | undefined) => unknown;
  /** Operators offered in the picker. Defaults to all of them. */
  operators?: NumberFilterOperator[];
  /** Operator shown while no value is set. Defaults to the first offered operator. */
  defaultOperator?: NumberFilterOperator;
  /** Debounce for typed operands; operator switches and clears emit immediately. */
  debounceMs?: number;
  size?: InputProps["size"];
  variant?: InputProps["variant"];
  placeholder?: string;
  fromPlaceholder?: string;
  toPlaceholder?: string;
  /** Overrides for the operator menu labels. */
  operatorLabels?: Partial<Record<NumberFilterOperator, string>>;
  /** Accessible name for the clear button. */
  clearLabel?: string;
  /** Forwarded to the operand input(s); `id` and `name` go to the first input only. */
  inputProps?: InputProps;
  disabled?: boolean;
}

const ALL_OPERATORS: NumberFilterOperator[] = [...NUMBER_FILTER_OPERATORS];

function deriveValue(
  operator: NumberFilterOperator,
  fromText: string,
  toText: string,
): NumberFilterValue | undefined {
  if (!isValidNumber(fromText)) return undefined;
  const from = Number(fromText);
  if (operator !== "between") return { operator, value: from };
  if (!isValidNumber(toText)) return undefined;
  return { operator, value: from, to: Number(toText) };
}

const isSameValue = (a: NumberFilterValue | undefined, b: NumberFilterValue | undefined) =>
  a?.operator === b?.operator && Object.is(a?.value, b?.value) && Object.is(a?.to, b?.to);

const textMatches = (text: string, operand: number | undefined) =>
  isValidNumber(text) && Object.is(Number(text), operand);

const isInvalidText = (text: string) => text.trim() !== "" && !isValidNumber(text);

export const NumberFilter = ({
  value,
  onValueChange,
  operators,
  defaultOperator,
  debounceMs = 0,
  size = "md",
  variant,
  placeholder,
  fromPlaceholder = "From",
  toPlaceholder = "To",
  operatorLabels: labelOverrides,
  clearLabel = "Clear filter",
  inputProps,
  disabled,
}: NumberFilterProps) => {
  const offered = operators?.length ? operators : ALL_OPERATORS;
  const [operator, setOperator] = useState<NumberFilterOperator>(
    value?.operator ?? defaultOperator ?? offered[0],
  );
  const [fromText, setFromText] = useState(value ? String(value.value) : "");
  const [toText, setToText] = useState(value?.operator === "between" ? String(value.to) : "");

  const emit = useControlledMirror({
    value,
    onValueChange,
    isSame: isSameValue,
    onExternalChange: (next) => {
      if (!next) {
        setFromText("");
        setToText("");
        return;
      }
      setOperator(next.operator);
      if (!textMatches(fromText, next.value)) setFromText(String(next.value));
      if (next.operator === "between") {
        if (!textMatches(toText, next.to)) setToText(String(next.to));
      } else if (toText !== "") setToText("");
    },
  });

  useDebounce(
    () => {
      const candidate = deriveValue(operator, fromText, toText);
      if (candidate) {
        if (!isSameValue(candidate, value)) emit(candidate);
      } else if (value && (isInvalidText(fromText) || isInvalidText(toText))) {
        emit(undefined);
      }
    },
    debounceMs,
    [fromText, toText],
  );

  const handleTextChange = (setText: (text: string) => void, text: string) => {
    setText(text);
    if (text.trim() === "" && value) emit(undefined);
  };

  const handleClear = () => {
    setFromText("");
    setToText("");
    if (value) emit(undefined);
  };

  const handleOperatorChange = (next: NumberFilterOperator) => {
    setOperator(next);
    const candidate = deriveValue(next, fromText, toText);
    if (candidate && !isSameValue(candidate, value)) emit(candidate);
  };

  const labelFor = (op: NumberFilterOperator) => labelOverrides?.[op] ?? operatorLabels[op];

  const clearButton = (fromText !== "" || toText !== "") && !disabled && (
    <InputGroupClearButton
      size={size}
      aria-label={clearLabel}
      onClick={handleClear}
    />
  );

  const operatorTrigger = (
    <Menu.Root placement="bottom-start">
      <Menu.Trigger asChild>
        <IconButton
          size={inputGroupButtonSizeFor(size)}
          variant="plain"
          disabled={disabled}
          aria-label={labelFor(operator)}
        >
          {operatorSymbols[operator]}
        </IconButton>
      </Menu.Trigger>
      <Menu.Content>
        <Menu.RadioItemGroup
          value={operator}
          onValueChange={(e) => handleOperatorChange(e.value as NumberFilterOperator)}
        >
          {offered.map((op) => (
            <Menu.RadioItem
              key={op}
              value={op}
            >
              {`${operatorSymbols[op]}  ${labelFor(op)}`}
            </Menu.RadioItem>
          ))}
        </Menu.RadioItemGroup>
      </Menu.Content>
    </Menu.Root>
  );

  const { id, name, ...sharedInputProps } = inputProps ?? {};
  const managedInputProps: InputProps = {
    size,
    variant,
    inputMode: "decimal",
    autoComplete: "off",
    disabled,
  };

  const isBetween = operator === "between";

  const fromInput = (
    <InputGroup
      size={size}
      startElement={operatorTrigger}
      endElement={!isBetween && clearButton}
    >
      <Input
        {...sharedInputProps}
        {...managedInputProps}
        id={id}
        name={name}
        placeholder={isBetween ? fromPlaceholder : placeholder}
        value={fromText}
        onChange={(e) => handleTextChange(setFromText, e.target.value)}
      />
    </InputGroup>
  );

  if (!isBetween) return fromInput;

  return (
    <HStack
      gap="1"
      width="100%"
    >
      {fromInput}
      <InputGroup
        size={size}
        endElement={clearButton}
      >
        <Input
          {...sharedInputProps}
          {...managedInputProps}
          placeholder={toPlaceholder}
          value={toText}
          onChange={(e) => handleTextChange(setToText, e.target.value)}
        />
      </InputGroup>
    </HStack>
  );
};
