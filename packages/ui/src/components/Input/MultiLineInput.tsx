import type { TextareaProps } from "@chakra-ui/react";
import { Textarea } from "@chakra-ui/react";
import React, { useCallback } from "react";

export const MultiLineInput = ({ onKeyDown, ...props }: TextareaProps) => {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (onKeyDown) {
          onKeyDown(e);
        }
      }
    },
    [onKeyDown],
  );

  return (
    <Textarea
      resize="none"
      {...props}
      onKeyDown={handleKeyDown}
    />
  );
};
