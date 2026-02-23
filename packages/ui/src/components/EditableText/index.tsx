import type { InputProps } from "@chakra-ui/react";
import { HStack, Input } from "@chakra-ui/react";
import React, { useState } from "react";
import { FiEdit2 } from "react-icons/fi";

import { useAutoFocus } from "../../hooks/useAutoFocus";
import { Button, IconButton } from "../Buttons";

export interface EditableTextProps {
  children: React.ReactNode;
  text: string;
  onEdit: (value: string) => unknown;
  isLoading?: boolean;
  inputProps?: InputProps;
}

export const EditableText = ({
  children,
  text,
  onEdit,
  inputProps,
  isLoading,
}: EditableTextProps) => {
  const [state, setState] = useState({
    text,
    isEditing: false,
  });

  const handleOnChange = (value: string) => {
    setState({
      ...state,
      text: value,
    });
  };

  const handleSave = () => {
    onEdit(state.text);
    setState({
      ...state,
      isEditing: false,
    });
  };

  if (state.isEditing)
    return (
      <HStack>
        <EditableInput
          {...inputProps}
          text={state.text}
          onChange={handleOnChange}
        />
        <HStack>
          <Button
            size="xs"
            variant="ghost"
            onClick={() =>
              setState({
                isEditing: false,
                text,
              })
            }
          >
            Cancel
          </Button>
          <Button
            size="xs"
            loading={isLoading}
            onClick={handleSave}
          >
            Save
          </Button>
        </HStack>
      </HStack>
    );

  return (
    <HStack>
      {children}
      <IconButton
        size="xs"
        variant="ghost"
        onClick={() =>
          setState({
            ...state,
            isEditing: true,
          })
        }
        icon={<FiEdit2 />}
      />
    </HStack>
  );
};

interface EditableInputProps extends Omit<InputProps, "onChange"> {
  text: string;
  onChange: (value: string) => unknown;
}

const EditableInput = ({ text, onChange, ...props }: EditableInputProps) => {
  const input = useAutoFocus(true);
  return (
    <Input
      ref={input}
      value={text}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    />
  );
};
