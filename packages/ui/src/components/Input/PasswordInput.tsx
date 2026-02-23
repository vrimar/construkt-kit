import type { InputProps } from "@chakra-ui/react";
import { Input } from "@chakra-ui/react";
import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

import { TooltipIconButton } from "../Buttons";
import type { InputGroupProps } from "./InputGroup";
import { InputGroup } from "./InputGroup";

export interface PasswordInputProps extends InputProps {
  containerProps?: InputGroupProps;
}

export const PasswordInput = ({ containerProps, ...props }: PasswordInputProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <InputGroup
      width="100%"
      {...containerProps}
      endElement={
        <TooltipIconButton
          label={isVisible ? "Hide password" : "Show password"}
          icon={isVisible ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
          onClick={() => setIsVisible((prev) => !prev)}
          size="sm"
        />
      }
    >
      <Input
        type={isVisible ? "text" : "password"}
        {...props}
      />
    </InputGroup>
  );
};
