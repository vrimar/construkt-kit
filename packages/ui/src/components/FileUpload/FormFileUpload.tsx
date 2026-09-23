import { styled } from "@construkt-kit/styled-system/jsx";
import { input } from "@construkt-kit/styled-system/recipes";
import { FileUpIcon } from "lucide-react";

import { CloseButton } from "../Buttons";
import { InputGroup } from "../Input";
import { FileUpload } from "./FileUpload";

const TriggerInput = styled(FileUpload.Trigger, input);

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

export const FormFileUpload = ({
  onFileChange,
  accept,
  maxFileSize,
  disabled,
  invalid,
  placeholder = "Select file...",
  name,
  required,
}: FormFileUploadProps) => {
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
        startElement={<FileUpIcon />}
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
        <TriggerInput
          aria-label={placeholder}
          cursor="pointer"
        >
          <FileUpload.FileText
            lineClamp={1}
            fallback={placeholder}
          />
        </TriggerInput>
      </InputGroup>
    </FileUpload.Root>
  );
};
