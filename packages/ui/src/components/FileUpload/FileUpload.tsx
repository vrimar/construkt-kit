import { ark } from "@ark-ui/react/factory";
import {
  FileUpload as ArkFileUpload,
  FileUploadContext,
  useFileUploadContext,
} from "@ark-ui/react/file-upload";
import { FileIcon, XIcon } from "lucide-react";
import { type ComponentProps, useMemo } from "react";

import { type HTMLStyledProps, Stack, createSlotRecipeContext } from "#styled-system/jsx";
import { fileUpload } from "#styled-system/recipes";

import type { WithRef } from "../../types";

const { withProvider, withContext } = createSlotRecipeContext(fileUpload);

type ItemProps = ComponentProps<typeof Item>;

const Root = withProvider(ArkFileUpload.Root, "root");
const RootProvider = withProvider(ArkFileUpload.RootProvider, "root");
const ClearTrigger = withContext(ArkFileUpload.ClearTrigger, "clearTrigger");
// zag names the dropzone "dropzone"; null lets its visible text name it instead.
const Dropzone = withContext(ArkFileUpload.Dropzone, "dropzone", {
  defaultProps: { "aria-label": null } as Record<string, unknown>,
});
const HiddenInput = ArkFileUpload.HiddenInput;
const Item = withContext(ArkFileUpload.Item, "item");
const ItemDeleteTrigger = withContext(ArkFileUpload.ItemDeleteTrigger, "itemDeleteTrigger", {
  defaultProps: { children: <XIcon /> },
});
const ItemGroup = withContext(ArkFileUpload.ItemGroup, "itemGroup");
const ItemName = withContext(ArkFileUpload.ItemName, "itemName");
const ItemPreview = withContext(ArkFileUpload.ItemPreview, "itemPreview", {
  defaultProps: {
    children: <FileIcon />,
  },
});
const ItemPreviewImage = withContext(ArkFileUpload.ItemPreviewImage, "itemPreviewImage");
const ItemSizeText = withContext(ArkFileUpload.ItemSizeText, "itemSizeText");
const Label = withContext(ArkFileUpload.Label, "label");
const Trigger = withContext(ArkFileUpload.Trigger, "trigger");
const StyledFileText = withContext(ark.span, "fileText");

interface ItemsBaseProps {
  showSize?: boolean | undefined;
  clearable?: boolean | undefined;
  files?: File[] | undefined;
}

interface ItemsProps extends Omit<ItemProps, "file">, ItemsBaseProps {}

function Items(props: ItemsProps) {
  const { showSize, clearable, files, ...rest } = props;
  const ctx = useFileUploadContext();
  const acceptedFiles = files ?? ctx.acceptedFiles;

  return acceptedFiles.map((file) => (
    <Item
      file={file}
      key={`${file.name}|${file.size}|${file.type}|${file.lastModified}`}
      {...rest}
    >
      <ItemPreview />
      <Stack
        gap="0.5"
        flex="1"
      >
        <ItemName />
        {showSize && <ItemSizeText />}
      </Stack>

      {clearable && <ItemDeleteTrigger />}
    </Item>
  ));
}

export interface FileTextProps extends HTMLStyledProps<"span"> {
  fallback?: string | undefined;
}

function FileText({
  ref,
  fallback = "Select file(s)",
  ...rest
}: WithRef<FileTextProps, HTMLSpanElement>) {
  const ctx = useFileUploadContext();

  const acceptedFiles = ctx.acceptedFiles;

  const fileText = useMemo(() => {
    if (acceptedFiles.length === 1) {
      return acceptedFiles[0].name;
    }
    if (acceptedFiles.length > 1) {
      return `${acceptedFiles.length} files`;
    }
    return fallback;
  }, [acceptedFiles, fallback]);

  return (
    <StyledFileText
      ref={ref}
      data-placeholder={acceptedFiles.length === 0 ? "" : undefined}
      data-scope="file-upload"
      data-part="file-text"
      {...rest}
    >
      {fileText}
    </StyledFileText>
  );
}

export type FileUploadRootProps = ComponentProps<typeof Root>;

export const FileUpload = {
  Root,
  RootProvider,
  ClearTrigger,
  Dropzone,
  HiddenInput,
  Item,
  ItemDeleteTrigger,
  ItemGroup,
  ItemName,
  ItemPreview,
  ItemPreviewImage,
  ItemSizeText,
  Items,
  Label,
  Trigger,
  FileText,
  Context: FileUploadContext,
};

export {
  type UseFileUploadProps,
  type UseFileUploadReturn,
  useFileUpload,
} from "@ark-ui/react/file-upload";
