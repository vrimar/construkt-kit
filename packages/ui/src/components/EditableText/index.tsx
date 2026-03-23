import { PencilIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { HStack } from "styled-system/jsx";
import { type InputProps, Input } from "../Input";

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

  useEffect(() => {
    setState((prev) => (prev.isEditing ? prev : { ...prev, text }));
  }, [text]);

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
            variant="plain"
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
        variant="plain"
        onClick={() =>
          setState({
            ...state,
            isEditing: true,
          })
        }
      >
        <PencilIcon />
      </IconButton>
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
