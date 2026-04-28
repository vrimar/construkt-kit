import {
  FileUpload as ArkFileUpload,
  FileUploadContext,
  useFileUploadContext,
} from "@ark-ui/react/file-upload";
import { type HTMLStyledProps, Stack, createStyleContext } from "@construkt-kit/styled-system/jsx";
import { fileUpload } from "@construkt-kit/styled-system/recipes";
import { FileIcon, XIcon } from "lucide-react";
import { type ComponentProps, useMemo } from "react";

import type { WithRef } from "../../types";
import { Span } from "../Span";

const { withProvider, withContext } = createStyleContext(fileUpload);

type ItemProps = ComponentProps<typeof Item>;

const Root = withProvider(ArkFileUpload.Root, "root");
const RootProvider = withProvider(ArkFileUpload.RootProvider, "root");
const ClearTrigger = withContext(ArkFileUpload.ClearTrigger, "clearTrigger");
const Dropzone = withContext(ArkFileUpload.Dropzone, "dropzone");
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
      key={file.name}
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

interface FileUploadListProps extends ItemsBaseProps {}

function List({
  ref,
  showSize,
  clearable,
  files,
  ...rest
}: WithRef<FileUploadListProps, HTMLUListElement>) {
  return (
    <ItemGroup
      ref={ref}
      {...rest}
    >
      <Items
        showSize={showSize}
        clearable={clearable}
        files={files}
      />
    </ItemGroup>
  );
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
    <Span
      ref={ref}
      data-placeholder={fileText === fallback ? "" : undefined}
      data-scope="file-upload"
      data-part="file-text"
      {...rest}
    >
      {fileText}
    </Span>
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
  List,
  Trigger,
  FileText,
  Context: FileUploadContext,
};

export { useFileUpload } from "@ark-ui/react/file-upload";
