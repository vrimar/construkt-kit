import { FileUpIcon } from "lucide-react";

import { styled } from "#styled-system/jsx";
import { input } from "#styled-system/recipes";

import { InputGroup, InputGroupClearButton } from "../Input";
import { FileUpload, type FileUploadRootProps } from "./FileUpload";

const TriggerInput = styled(FileUpload.Trigger, input);

export interface FormFileUploadProps extends Omit<
  FileUploadRootProps,
  "onFileChange" | "maxFiles" | "children"
> {
  onFileChange: (file: File | undefined) => void;
  placeholder?: string;
}

export const FormFileUpload = ({
  onFileChange,
  placeholder = "Select file...",
  ...rootProps
}: FormFileUploadProps) => {
  return (
    <FileUpload.Root
      {...rootProps}
      maxFiles={1}
      onFileChange={({ acceptedFiles }) =>
        onFileChange(acceptedFiles.length === 1 ? acceptedFiles[0] : undefined)
      }
    >
      <FileUpload.HiddenInput />
      <InputGroup
        startElement={<FileUpIcon />}
        cursor={rootProps.disabled ? "not-allowed" : "pointer"}
        endElement={
          <FileUpload.ClearTrigger asChild>
            <InputGroupClearButton
              me="-1"
              size="sm"
              focusVisibleRing="inside"
              focusRingWidth="2px"
            />
          </FileUpload.ClearTrigger>
        }
      >
        <TriggerInput _enabled={{ cursor: "pointer" }}>
          <FileUpload.FileText
            lineClamp={1}
            fallback={placeholder}
          />
        </TriggerInput>
      </InputGroup>
    </FileUpload.Root>
  );
};
