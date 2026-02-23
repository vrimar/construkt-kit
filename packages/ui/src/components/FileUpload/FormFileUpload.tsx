import { LuFileUp } from "react-icons/lu";
import { CloseButton } from "../Buttons";
import { InputGroup } from "../Input/InputGroup";
import { FileUpload } from "./index";
import { Input } from "@chakra-ui/react";

export interface FormFileUploadProps {
  onFileChange: (file: File | undefined) => void;
  accept?: Record<string, string[]>;
  maxFileSize?: number;
  disabled?: boolean;
  invalid?: boolean;
  placeholder?: string;
  name?: string;
  required?: boolean;
}

export function FormFileUpload({
  onFileChange,
  accept,
  maxFileSize,
  disabled,
  invalid,
  placeholder = "Select file...",
  name,
  required,
}: FormFileUploadProps) {
  return (
    <FileUpload.Root
      maxFiles={1}
      accept={accept}
      maxFileSize={maxFileSize}
      disabled={disabled}
      invalid={invalid}
      name={name}
      required={required}
      onFileChange={({ acceptedFiles }) =>
        onFileChange(acceptedFiles.length === 1 ? acceptedFiles[0] : undefined)
      }
    >
      <FileUpload.HiddenInput />
      <InputGroup
        width="full"
        startElement={<LuFileUp />}
        cursor={disabled ? "not-allowed" : "pointer"}
        endElement={
          <FileUpload.ClearTrigger asChild>
            <CloseButton
              me="-1"
              size="xs"
              variant="plain"
              focusVisibleRing="inside"
              focusRingWidth="2px"
              pointerEvents="auto"
              disabled={disabled}
            />
          </FileUpload.ClearTrigger>
        }
      >
        <Input asChild aria-label={placeholder}>
          <FileUpload.Trigger>
            <FileUpload.FileText lineClamp={1} fallback={placeholder} />
          </FileUpload.Trigger>
        </Input>
      </InputGroup>
    </FileUpload.Root>
  );
}
