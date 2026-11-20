import { FileIcon, XIcon } from "lucide-react";
import {
  type ComponentProps,
  type ComponentPropsWithRef,
  type DragEvent,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
  createContext,
  useCallback,
  useContext,
} from "react";

import { type HTMLStyledProps, Stack, createSlotRecipeContext } from "#styled-system/jsx";
import { visuallyHidden } from "#styled-system/patterns";
import { fileUpload } from "#styled-system/recipes";

import { useComposedRefs } from "../../hooks/useComposedRefs";
import { dataAttr, renderable } from "../../primitives/render";
import { mergeProps } from "../../primitives/render/mergeProps";
import {
  type RenderProp,
  type StateAttributes,
  useRender,
} from "../../primitives/render/useRender";
import type { WithRef } from "../../types";
import {
  type FileItemType,
  type FileUploadOptions,
  type FileUploadRenderState,
  FileUploadProvider,
  useFileUploadContext,
  useFileUploadRoot,
} from "./fileUploadRoot";
import { formatBytes, getFileEntries, isEventWithFiles } from "./fileUtils";

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

const NO_STATE_ATTRIBUTES: StateAttributes<FileUploadRenderState> = {
  value: () => null,
  rejectedFiles: () => null,
  dragging: () => null,
  disabled: () => null,
  readOnly: () => null,
  invalid: () => null,
  required: () => null,
  addFiles: () => null,
};

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
    stateAttributes: NO_STATE_ATTRIBUTES,
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

function Root({
  ref,
  value,
  defaultValue,
  onValueChange,
  onFileReject,
  accept,
  maxFiles,
  minFileSize,
  maxFileSize,
  validate,
  transformFiles,
  allowDrop,
  preventDocumentDrop,
  directory,
  capture,
  name,
  disabled,
  readOnly,
  required,
  invalid,
  ...props
}: FileUploadRootProps) {
  const { context, renderState, rootRef, rootProps } = useFileUploadRoot({
    value,
    defaultValue,
    onValueChange,
    onFileReject,
    accept,
    maxFiles,
    minFileSize,
    maxFileSize,
    validate,
    transformFiles,
    allowDrop,
    preventDocumentDrop,
    directory,
    capture,
    name,
    disabled,
    readOnly,
    required,
    invalid,
  });
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

const hiddenInputClass = visuallyHidden();

type HiddenInputProps = ComponentProps<typeof renderable.input>;

function HiddenInput({ ref, ...props }: HiddenInputProps) {
  const context = useFileUploadContext("HiddenInput");
  const composedRef = useComposedRefs(context.attachInput, ref);
  const directoryProps = context.directory ? { webkitdirectory: "" } : undefined;

  return (
    <renderable.input
      {...mergeProps<HiddenInputProps>(
        {
          id: context.ids.input,
          className: hiddenInputClass,
          type: "file",
          tabIndex: -1,
          "aria-hidden": true,
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

const INTERACTIVE_SELECTOR =
  "button, a[href], input:not([type='file']), select, textarea, [tabindex], [contenteditable]";

function isInteractiveTarget(target: EventTarget | null, container: HTMLElement): boolean {
  if (!(target instanceof Element) || target.getAttribute("type") === "file") return false;
  const interactive = target.closest(INTERACTIVE_SELECTOR);
  return interactive !== container && container.contains(interactive);
}

type DropzoneProps = ComponentProps<typeof StyledDropzone> & {
  /** Leaves picking to the trigger: a press or Enter on the dropzone doesn't open the picker. */
  disableClick?: boolean | undefined;
};

/** Takes dropped files, and opens the picker on a press, Enter or Space. */
function Dropzone({ ref, disableClick = false, ...props }: DropzoneProps) {
  const context = useFileUploadContext("Dropzone");
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
          "data-disabled": dataAttr(context.disabled),
          "data-read-only": dataAttr(context.readOnly),
          "data-invalid": dataAttr(context.invalid),
          "data-dragging": dataAttr(context.dragging),
          onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
            if (!pickable || event.defaultPrevented) return;
            const container = event.currentTarget;
            if (!container.contains(event.target as Node)) return;
            if (isInteractiveTarget(event.target, container)) return;
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            context.openFilePicker();
          },
          onClick(event: MouseEvent<HTMLDivElement>) {
            if (!pickable || event.defaultPrevented) return;
            const container = event.currentTarget;
            if (!container.contains(event.target as Node)) return;
            if (isInteractiveTarget(event.target, container)) return;
            // A label would also open the picker through its control, opening it twice.
            if (container.localName === "label") event.preventDefault();
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
  const context = useFileUploadContext("Trigger");
  return (
    <StyledTrigger
      {...mergeProps<TriggerProps>(
        {
          type: "button",
          disabled: !context.interactive,
          "data-disabled": dataAttr(context.disabled),
          "data-read-only": dataAttr(context.readOnly),
          "data-invalid": dataAttr(context.invalid),
          onClick(event: MouseEvent<HTMLButtonElement>) {
            if (!context.interactive) return;
            if (context.dropzoneRef.current?.contains(event.currentTarget)) event.stopPropagation();
            context.openFilePicker();
          },
        } as TriggerProps,
        props,
      )}
    />
  );
}

type ClearTriggerProps = ComponentProps<typeof StyledClearTrigger>;

/** Removes every file, accepted and refused; hidden while there are none. */
function ClearTrigger(props: ClearTriggerProps) {
  const context = useFileUploadContext("ClearTrigger");
  return (
    <StyledClearTrigger
      {...mergeProps<ClearTriggerProps>(
        {
          type: "button",
          disabled: !context.interactive,
          hidden: context.value.length === 0,
          "data-disabled": dataAttr(context.disabled),
          "data-read-only": dataAttr(context.readOnly),
          onClick(event: MouseEvent<HTMLButtonElement>) {
            if (event.defaultPrevented) return;
            context.clearFiles(event.nativeEvent);
          },
        } as ClearTriggerProps,
        props,
      )}
    />
  );
}

type LabelProps = ComponentProps<typeof StyledLabel>;

function Label(props: LabelProps) {
  const context = useFileUploadContext("Label");
  return (
    <StyledLabel
      {...mergeProps<LabelProps>(
        {
          id: context.ids.label,
          htmlFor: context.ids.input,
          "data-disabled": dataAttr(context.disabled),
          "data-invalid": dataAttr(context.invalid),
          "data-required": dataAttr(context.required),
        } as LabelProps,
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
const ItemContext = createContext<ItemContextValue | null>(null);

function useItemContext(part: string): ItemContextValue {
  const item = useContext(ItemContext);
  if (!item) throw new Error(`FileUpload.${part} must be placed inside <FileUpload.Item>.`);
  return item;
}

type ItemGroupProps = ComponentProps<typeof StyledItemGroup> & {
  /** Which files the items in it show. @default "accepted" */
  type?: FileItemType | undefined;
};

function ItemGroup({ type = "accepted", ...props }: ItemGroupProps) {
  const context = useFileUploadContext("ItemGroup");
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
  const context = useFileUploadContext("Item");
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
  const context = useFileUploadContext("ItemName");
  const { file, type } = useItemContext("ItemName");
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
  const context = useFileUploadContext("ItemSizeText");
  const { file, type } = useItemContext("ItemSizeText");
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
  const context = useFileUploadContext("ItemPreview");
  const item = useItemContext("ItemPreview");
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
  const context = useFileUploadContext("ItemPreviewImage");
  const { file, type } = useItemContext("ItemPreviewImage");
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
  const context = useFileUploadContext("ItemDeleteTrigger");
  const { file, type } = useItemContext("ItemDeleteTrigger");
  return (
    <StyledItemDeleteTrigger
      {...mergeProps<ItemDeleteTriggerProps>(
        {
          type: "button",
          disabled: !context.interactive,
          "aria-label": `delete file ${file.name}`,
          "data-disabled": dataAttr(context.disabled),
          "data-read-only": dataAttr(context.readOnly),
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
  const context = useFileUploadContext("Items");

  return (files ?? context.value).map((file) => (
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

/** The chosen file's name, how many files there are, or `fallback` while there are none. */
function FileText({
  ref,
  fallback = "Select file(s)",
  ...rest
}: WithRef<FileTextProps, HTMLSpanElement>) {
  const { value } = useFileUploadContext("FileText");
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
