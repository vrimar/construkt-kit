import { FileIcon, XIcon } from "lucide-react";
import {
  type ComponentProps,
  type ComponentPropsWithRef,
  type DragEvent,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
  type SyntheticEvent,
  createContext,
  useCallback,
  useContext,
} from "react";

import { Stack, createSlotRecipeContext } from "#styled-system/jsx";
import { fileUpload } from "#styled-system/recipes";

import { isWithinNestedControl } from "../../foundations/dom";
import { splitOptions } from "../../foundations/props";
import { useComposedRefs } from "../../hooks/useComposedRefs";
import { useReportRendered } from "../../hooks/useRenderedParts";
import { hiddenFormInputProps, useFieldControlId } from "../../primitives/field";
import {
  type RenderProp,
  dataAttr,
  mergeProps,
  renderable,
  useRender,
} from "../../primitives/render";
import { createPartContext } from "../partContext";
import {
  FILE_UPLOAD_OPTION_KEYS,
  type FileItemType,
  type FileUploadOptions,
  type FileUploadRenderState,
  FileUploadProvider,
  useFileUploadContext,
  useFileUploadRoot,
} from "./fileUploadRoot";
import { formatBytes, getFileEntries, getFileKey, isEventWithFiles } from "./fileUtils";
export type { FileAccept, FileError, FileRejection } from "./fileUtils";
export type {
  FileItemType,
  FileUploadChangeReason,
  FileUploadRejectDetails,
  FileUploadRenderState,
  FileUploadValueChangeDetails,
  FileValidateDetails,
} from "./fileUploadRoot";

const { withProvider, withContext } = createSlotRecipeContext(fileUpload);

interface RootElementProps extends ComponentPropsWithRef<"div"> {
  render?: RenderProp<FileUploadRenderState> | undefined;
  renderState: FileUploadRenderState;
}

function RootElement({ render, renderState, ...props }: RootElementProps) {
  return useRender({
    defaultTagName: "div",
    render,
    props,
    state: renderState,
    stateAttributes: false,
  });
}

const StyledRoot = withProvider(RootElement, "root");
const StyledClearTrigger = withContext(renderable.button, "clearTrigger");
const StyledDropzone = withContext(renderable.div, "dropzone");
const StyledItem = withContext(renderable.li, "item");
const StyledItemDeleteTrigger = withContext(renderable.button, "itemDeleteTrigger");
const StyledItemGroup = withContext(renderable.ul, "itemGroup");
const StyledItemName = withContext(renderable.div, "itemName");
const StyledItemPreview = withContext(renderable.div, "itemPreview");
const StyledItemPreviewImage = withContext(renderable.img, "itemPreviewImage");
const StyledItemSizeText = withContext(renderable.div, "itemSizeText");
const StyledLabel = withContext(renderable.label, "label");
const StyledTrigger = withContext(renderable.button, "trigger");
const StyledFileText = withContext(renderable.span, "fileText");

type StyledRootProps = ComponentProps<typeof StyledRoot>;

export interface FileUploadRootProps
  extends
    Omit<StyledRootProps, "renderState" | "render" | keyof FileUploadOptions>,
    FileUploadOptions {
  /** Replaces the root element; a function also gets the files, refused files and `addFiles`. */
  render?: RenderProp<FileUploadRenderState> | undefined;
}

function Root({ ref, ...rest }: FileUploadRootProps) {
  const [options, props] = splitOptions(rest, FILE_UPLOAD_OPTION_KEYS);
  const { context, renderState, rootRef, rootProps } = useFileUploadRoot(options);
  const composedRef = useComposedRefs(rootRef, ref);

  return (
    <FileUploadProvider value={context}>
      <StyledRoot
        {...rootProps}
        {...props}
        renderState={renderState}
        ref={composedRef}
      />
    </FileUploadProvider>
  );
}

type HiddenInputProps = ComponentProps<typeof renderable.input>;

function HiddenInput({ ref, ...props }: HiddenInputProps) {
  const context = useFileUploadContext("FileUpload.HiddenInput");
  const composedRef = useComposedRefs(context.attachInput, ref);
  const directoryProps = context.directory ? { webkitdirectory: "" } : undefined;
  const inputId = useReportRendered(
    context.reportRendered,
    "input",
    useFieldControlId(props.id) ?? context.ids.input,
  );

  return (
    <renderable.input
      {...mergeProps<HiddenInputProps>(
        {
          ...hiddenFormInputProps,
          id: inputId,
          type: "file",
          disabled: !context.interactive,
          required: context.required,
          name: context.name,
          accept: context.acceptAttribute,
          capture: context.capture,
          multiple: context.multiple,
          ...directoryProps,
          onClick(event: MouseEvent<HTMLInputElement>) {
            event.stopPropagation();
            event.currentTarget.value = "";
          },
          onInput(event: FormEvent<HTMLInputElement>) {
            if (!context.interactive) return;
            const { files } = event.currentTarget;
            context.select(files ? Array.from(files) : [], "input-change", event.nativeEvent);
            context.syncInputFiles();
          },
        },
        props,
      )}
      ref={composedRef}
    />
  );
}

const ownsPress = ({ currentTarget, target, defaultPrevented }: SyntheticEvent<HTMLElement>) =>
  !defaultPrevented &&
  currentTarget.contains(target as Node) &&
  ((target instanceof HTMLInputElement && target.type === "file") ||
    !isWithinNestedControl(target, currentTarget));

type DropzoneProps = ComponentProps<typeof StyledDropzone> & {
  /** Leaves picking to the trigger: a press or Enter on the dropzone doesn't open the picker. */
  disableClick?: boolean | undefined;
};

/** Takes dropped files, and opens the picker on a press, Enter or Space. */
function Dropzone({ ref, disableClick = false, ...props }: DropzoneProps) {
  const context = useFileUploadContext("FileUpload.Dropzone");
  const composedRef = useComposedRefs(context.dropzoneRef, ref);
  const { interactive, allowDrop } = context;
  const pickable = interactive && !disableClick;

  return (
    <StyledDropzone
      {...mergeProps<DropzoneProps>(
        {
          role: disableClick ? "application" : "button",
          tabIndex: pickable ? 0 : undefined,
          "aria-disabled": interactive ? undefined : true,
          ...context.stateAttributes,
          "data-dragging": dataAttr(context.dragging),
          onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
            if (!pickable || !ownsPress(event)) return;
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            context.openFilePicker();
          },
          onClick(event: MouseEvent<HTMLDivElement>) {
            if (!pickable || !ownsPress(event)) return;
            // A label would also open the picker through its control, opening it twice.
            if (event.currentTarget.localName === "label") event.preventDefault();
            context.openFilePicker();
          },
          onDragOver(event: DragEvent<HTMLDivElement>) {
            if (!interactive || !allowDrop) return;
            event.preventDefault();
            event.stopPropagation();
            if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
            if (isEventWithFiles(event)) context.setDragging(true);
          },
          onDragLeave(event: DragEvent<HTMLDivElement>) {
            if (!interactive || !allowDrop) return;
            if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
            context.setDragging(false);
          },
          onDrop(event: DragEvent<HTMLDivElement>) {
            if (!interactive) return;
            if (allowDrop) {
              event.preventDefault();
              event.stopPropagation();
            }
            if (!context.dragging) return;
            context.setDragging(false);
            if (!isEventWithFiles(event)) return;
            const { nativeEvent } = event;
            void getFileEntries(event.dataTransfer.items, context.directory).then((files) =>
              context.select(files, "drop", nativeEvent),
            );
          },
        } as DropzoneProps,
        props,
      )}
      ref={composedRef}
    />
  );
}

type TriggerProps = ComponentProps<typeof StyledTrigger>;

function Trigger(props: TriggerProps) {
  const context = useFileUploadContext("FileUpload.Trigger");
  return (
    <StyledTrigger
      {...mergeProps<TriggerProps>(
        {
          type: props.render ? undefined : "button",
          disabled: !context.interactive,
          ...context.stateAttributes,
          onClick(event: MouseEvent<HTMLButtonElement>) {
            if (!context.interactive) return;
            if (context.dropzoneRef.current?.contains(event.currentTarget)) event.stopPropagation();
            context.openFilePicker();
          },
        },
        props,
      )}
    />
  );
}

type ClearTriggerProps = ComponentProps<typeof StyledClearTrigger>;

/** Removes every file, accepted and refused; hidden while there are none. */
function ClearTrigger(props: ClearTriggerProps) {
  const context = useFileUploadContext("FileUpload.ClearTrigger");
  return (
    <StyledClearTrigger
      {...mergeProps<ClearTriggerProps>(
        {
          type: props.render ? undefined : "button",
          disabled: !context.interactive,
          hidden: context.value.length === 0,
          ...context.stateAttributes,
          onClick(event: MouseEvent<HTMLButtonElement>) {
            if (event.defaultPrevented) return;
            context.clearFiles(event.nativeEvent);
          },
        },
        props,
      )}
    />
  );
}

type LabelProps = ComponentProps<typeof StyledLabel>;

function Label(props: LabelProps) {
  const context = useFileUploadContext("FileUpload.Label");
  return (
    <StyledLabel
      {...mergeProps<LabelProps>(
        {
          id: context.ids.label,
          htmlFor: context.inputId,
          ...context.stateAttributes,
        },
        props,
      )}
    />
  );
}

interface ItemContextValue {
  file: File;
  type: FileItemType;
}

const ItemTypeContext = createContext<FileItemType>("accepted");
const [ItemContext, useItemContext] = createPartContext<ItemContextValue>("<FileUpload.Item>");

type ItemGroupProps = ComponentProps<typeof StyledItemGroup> & {
  /** Which files the items in it show. @default "accepted" */
  type?: FileItemType | undefined;
};

function ItemGroup({ type = "accepted", ...props }: ItemGroupProps) {
  const context = useFileUploadContext("FileUpload.ItemGroup");
  return (
    <ItemTypeContext value={type}>
      <StyledItemGroup
        data-disabled={dataAttr(context.disabled)}
        data-type={type}
        {...props}
      />
    </ItemTypeContext>
  );
}

type StyledItemProps = ComponentProps<typeof StyledItem>;

export interface FileUploadItemProps extends StyledItemProps {
  file: File;
  /** Whether it shows an accepted or a refused file; defaults to its `ItemGroup`'s. */
  type?: FileItemType | undefined;
}

function Item({ file, type, ...props }: FileUploadItemProps) {
  const context = useFileUploadContext("FileUpload.Item");
  const groupType = useContext(ItemTypeContext);
  const itemType = type ?? groupType;
  return (
    <ItemContext value={{ file, type: itemType }}>
      <StyledItem
        data-disabled={dataAttr(context.disabled)}
        data-type={itemType}
        {...props}
      />
    </ItemContext>
  );
}

type ItemNameProps = ComponentProps<typeof StyledItemName>;

function ItemName({ children, ...props }: ItemNameProps) {
  const context = useFileUploadContext("FileUpload.ItemName");
  const { file, type } = useItemContext("FileUpload.ItemName");
  return (
    <StyledItemName
      data-disabled={dataAttr(context.disabled)}
      data-type={type}
      {...props}
    >
      {children || file.name}
    </StyledItemName>
  );
}

type ItemSizeTextProps = ComponentProps<typeof StyledItemSizeText>;

function ItemSizeText({ children, ...props }: ItemSizeTextProps) {
  const context = useFileUploadContext("FileUpload.ItemSizeText");
  const { file, type } = useItemContext("FileUpload.ItemSizeText");
  return (
    <StyledItemSizeText
      data-disabled={dataAttr(context.disabled)}
      data-type={type}
      {...props}
    >
      {children || formatBytes(file.size, context.locale)}
    </StyledItemSizeText>
  );
}

type StyledItemPreviewProps = ComponentProps<typeof StyledItemPreview>;

export interface FileUploadItemPreviewProps extends Omit<StyledItemPreviewProps, "type"> {
  /** A pattern the file's MIME type must match for the preview to show, such as `image/*`. */
  type?: string | undefined;
}

function ItemPreview({
  type = ".*",
  children = <FileIcon />,
  ...props
}: FileUploadItemPreviewProps) {
  const context = useFileUploadContext("FileUpload.ItemPreview");
  const item = useItemContext("FileUpload.ItemPreview");
  if (!item.file.type.match(type)) return null;
  return (
    <StyledItemPreview
      data-disabled={dataAttr(context.disabled)}
      data-type={item.type}
      {...props}
    >
      {children}
    </StyledItemPreview>
  );
}

type ItemPreviewImageProps = ComponentProps<typeof StyledItemPreviewImage>;

function ItemPreviewImage({ ref, ...props }: ItemPreviewImageProps) {
  const context = useFileUploadContext("FileUpload.ItemPreviewImage");
  const { file, type } = useItemContext("FileUpload.ItemPreviewImage");
  const attachUrl = useCallback(
    (image: HTMLImageElement | null) => {
      if (!image) return;
      const url = URL.createObjectURL(file);
      image.setAttribute("src", url);
      return () => URL.revokeObjectURL(url);
    },
    [file],
  );
  const composedRef = useComposedRefs(attachUrl, ref);

  if (!file.type.startsWith("image/")) {
    throw new Error(
      'FileUpload.ItemPreviewImage previews image files only; wrap it in <FileUpload.ItemPreview type="image/*">.',
    );
  }
  return (
    <StyledItemPreviewImage
      alt={`preview of ${file.name}`}
      data-disabled={dataAttr(context.disabled)}
      data-type={type}
      {...props}
      ref={composedRef}
    />
  );
}

type ItemDeleteTriggerProps = ComponentProps<typeof StyledItemDeleteTrigger>;

function ItemDeleteTrigger({ children = <XIcon />, ...props }: ItemDeleteTriggerProps) {
  const context = useFileUploadContext("FileUpload.ItemDeleteTrigger");
  const { file, type } = useItemContext("FileUpload.ItemDeleteTrigger");
  return (
    <StyledItemDeleteTrigger
      {...mergeProps<ItemDeleteTriggerProps>(
        {
          type: props.render ? undefined : "button",
          disabled: !context.interactive,
          "aria-label": `delete file ${file.name}`,
          ...context.stateAttributes,
          "data-type": type,
          onClick(event: MouseEvent<HTMLButtonElement>) {
            context.deleteFile(file, type, event.nativeEvent);
          },
        } as ItemDeleteTriggerProps,
        props,
      )}
    >
      {children}
    </StyledItemDeleteTrigger>
  );
}

interface ItemsProps extends Omit<FileUploadItemProps, "file"> {
  showSize?: boolean | undefined;
  clearable?: boolean | undefined;
  /** The files to list in place of the accepted ones. */
  files?: File[] | undefined;
}

function Items({ showSize, clearable, files, ...rest }: ItemsProps) {
  const context = useFileUploadContext("FileUpload.Items");

  return (files ?? context.value).map((file) => (
    <Item
      file={file}
      key={getFileKey(file)}
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

type StyledFileTextProps = ComponentProps<typeof StyledFileText>;

export interface FileTextProps extends StyledFileTextProps {
  fallback?: string | undefined;
}

/** The chosen file's name, how many files there are, or `fallback` while there are none. */
function FileText({ ref, fallback = "Select file(s)", ...rest }: FileTextProps) {
  const { value } = useFileUploadContext("FileUpload.FileText");
  const fileText =
    value.length === 1 ? value[0].name : value.length > 1 ? `${value.length} files` : fallback;

  return (
    <StyledFileText
      ref={ref}
      data-placeholder={dataAttr(value.length === 0)}
      {...rest}
    >
      {fileText}
    </StyledFileText>
  );
}

export const FileUpload = {
  Root,
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
};
