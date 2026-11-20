import { FileUpIcon } from "lucide-react";

import { styled } from "#styled-system/jsx";
import { input } from "#styled-system/recipes";

import { InputGroup, InputGroupClearButton } from "../Input";
import { FileUpload, type FileUploadRootProps } from "./FileUpload";

const TriggerInput = styled(FileUpload.Trigger, input);

export interface FormFileUploadProps extends Omit<
  FileUploadRootProps,
  "onValueChange" | "maxFiles" | "children"
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
      onValueChange={(files) => onFileChange(files.length === 1 ? files[0] : undefined)}
    >
      <FileUpload.HiddenInput />
      <InputGroup
        startElement={<FileUpIcon />}
        endElement={
          <FileUpload.ClearTrigger
            render={
              <InputGroupClearButton
                me="-1"
                size="sm"
                focusVisibleRing="inside"
                focusRingWidth="2px"
              />
            }
          />
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
