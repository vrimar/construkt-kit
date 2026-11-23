import { sameItems } from "@construkt-kit/utils";
import {
  type RefCallback,
  type RefObject,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import { useControllableState } from "../../hooks/useControllableState";
import { useLatestRef } from "../../hooks/useLatestRef";
import { type ReportRendered, useRenderedParts } from "../../hooks/useRenderedParts";
import { type ChangeDetails, emitChange } from "../../primitives/change";
import { useFieldControlState } from "../../primitives/field";
import { useLocale } from "../../primitives/locale";
import { dataAttr, fieldStateAttributes } from "../../primitives/render";
import { createPartContext } from "../partContext";
import {
  type FileAccept,
  type FileError,
  type FileRejection,
  createFileTypeValidator,
  getAcceptAttribute,
  getFileKey,
  getFileSizeError,
  isEventWithFiles,
  isFileEqual,
  setInputFiles,
} from "./fileUtils";

export type FileUploadChangeReason = "input-change" | "drop" | "add" | "delete" | "clear";

/** Why `onValueChange` was called, the files refused alongside, and a way to keep the files as they are. */
export type FileUploadValueChangeDetails = ChangeDetails<FileUploadChangeReason> & {
  rejectedFiles: FileRejection[];
};

/** Why `onFileReject` was called, and a way to keep the refused files as they are. */
export type FileUploadRejectDetails = ChangeDetails<FileUploadChangeReason>;

/** What `validate` can check a file against. */
export interface FileValidateDetails {
  acceptedFiles: File[];
  rejectedFiles: FileRejection[];
}

/** Whether an item shows an accepted file or a refused one. */
export type FileItemType = "accepted" | "rejected";

export interface FileUploadOptions {
  /** The accepted files. */
  value?: File[] | undefined;
  /** @default [] */
  defaultValue?: File[] | undefined;
  /** Called when the accepted files change; `details.cancel()` keeps them as they are. */
  onValueChange?: ((files: File[], details: FileUploadValueChangeDetails) => void) | undefined;
  /** Called when the refused files change, with every reason each was refused for. */
  onFileReject?:
    | ((rejectedFiles: FileRejection[], details: FileUploadRejectDetails) => void)
    | undefined;
  /** The file types to accept: MIME types, extensions, or MIME types with their extensions. */
  accept?: FileAccept | undefined;
  /** @default 1 */
  maxFiles?: number | undefined;
  /** In bytes. @default 0 */
  minFileSize?: number | undefined;
  /** In bytes. @default Infinity */
  maxFileSize?: number | undefined;
  /** Refuses a file for the errors it returns; an empty array or `null` accepts it. */
  validate?: ((file: File, details: FileValidateDetails) => FileError[] | null) | undefined;
  /** Rewrites the files that passed validation before they are added, such as resizing images. */
  transformFiles?: ((files: File[]) => Promise<File[]>) | undefined;
  /** Whether files can be dropped on the dropzone. @default true */
  allowDrop?: boolean | undefined;
  /** Stops a file dropped anywhere else on the page from opening in the browser. @default true */
  preventDocumentDrop?: boolean | undefined;
  /** Picks and drops whole directories, where the browser supports it. */
  directory?: boolean | undefined;
  /** The camera a phone opens to capture media with. */
  capture?: "user" | "environment" | undefined;
  /** The name the hidden file input submits its files under. */
  name?: string | undefined;
  disabled?: boolean | undefined;
  readOnly?: boolean | undefined;
  required?: boolean | undefined;
  invalid?: boolean | undefined;
}

/** Every `FileUploadOptions` key, to split them off the root's props. */
export const FILE_UPLOAD_OPTION_KEYS = {
  value: true,
  defaultValue: true,
  onValueChange: true,
  onFileReject: true,
  accept: true,
  maxFiles: true,
  minFileSize: true,
  maxFileSize: true,
  validate: true,
  transformFiles: true,
  allowDrop: true,
  preventDocumentDrop: true,
  directory: true,
  capture: true,
  name: true,
  disabled: true,
  readOnly: true,
  required: true,
  invalid: true,
} as const satisfies Record<keyof FileUploadOptions, true>;

/** What the root's `render` function receives besides its props. */
export type FileUploadRenderState = {
  value: File[];
  rejectedFiles: FileRejection[];
  dragging: boolean;
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
  required: boolean;
  /**
   * Adds files from anywhere, such as a paste, through the same transform and validation as a
   * pick. Returns whether any of them passed validation.
   */
  addFiles: (files: File[]) => boolean;
};

interface FileUploadContextValue {
  value: File[];
  rejectedFiles: FileRejection[];
  dragging: boolean;
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
  required: boolean;
  /** The field-state attributes the root and its controls carry. */
  stateAttributes: ReturnType<typeof fieldStateAttributes>;
  interactive: boolean;
  allowDrop: boolean;
  directory: boolean | undefined;
  capture: "user" | "environment" | undefined;
  name: string | undefined;
  multiple: boolean;
  acceptAttribute: string | undefined;
  locale: string;
  ids: { input: string; label: string };
  /** The rendered input's id. */
  inputId: string | undefined;
  reportRendered: ReportRendered<"input">;
  attachInput: RefCallback<HTMLInputElement>;
  dropzoneRef: RefObject<HTMLElement | null>;
  setDragging: (dragging: boolean) => void;
  openFilePicker: () => void;
  syncInputFiles: () => void;
  select: (files: File[], reason: FileUploadChangeReason, event?: Event) => boolean;
  deleteFile: (file: File, type: FileItemType, event?: Event) => void;
  clearFiles: (event?: Event) => void;
}

export const [FileUploadContext, useFileUploadContext] =
  createPartContext<FileUploadContextValue>("<FileUpload.Root>");

export const FileUploadProvider = FileUploadContext.Provider;

const EMPTY_FILES: File[] = [];
const EMPTY_REJECTIONS: FileRejection[] = [];

interface FileState {
  value: File[];
  rejectedFiles: FileRejection[];
}

/** A file upload's files, validation, drag state and the parts' shared ids and refs. */
export function useFileUploadRoot({
  value: valueProp,
  defaultValue = EMPTY_FILES,
  onValueChange,
  onFileReject,
  accept,
  maxFiles = 1,
  minFileSize = 0,
  maxFileSize = Number.POSITIVE_INFINITY,
  validate,
  transformFiles,
  allowDrop = true,
  preventDocumentDrop = true,
  directory,
  capture,
  name,
  disabled: disabledProp,
  readOnly: readOnlyProp,
  required: requiredProp,
  invalid: invalidProp,
}: FileUploadOptions) {
  const field = useFieldControlState({
    disabled: disabledProp,
    readOnly: readOnlyProp,
    required: requiredProp,
    invalid: invalidProp,
  });
  const { locale } = useLocale();
  const uid = useId();
  const [rendered, reportRendered] = useRenderedParts<"input">();
  const [value, setValue] = useControllableState({ value: valueProp, defaultValue });
  const [rejectedFiles, setRejectedFiles] = useState(EMPTY_REJECTIONS);
  const [dragging, setDragging] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLElement>(null);
  const latest = useLatestRef({ value, rejectedFiles, onValueChange, onFileReject });
  const pendingRef = useRef<FileState | null>(null);
  const currentFiles = useCallback((): FileState => pendingRef.current ?? latest.current, [latest]);

  const { disabled, readOnly, invalid, required } = field;
  const interactive = !disabled && !readOnly;
  const multiple = maxFiles > 1;
  const acceptAttribute = getAcceptAttribute(accept);
  const isValidType = createFileTypeValidator(acceptAttribute);

  const update = (
    next: { value?: File[]; rejected?: FileRejection[] },
    reason: FileUploadChangeReason,
    event?: Event,
  ) => {
    const callbacks = latest.current;
    const state = currentFiles();
    const pending: FileState = { value: state.value, rejectedFiles: state.rejectedFiles };
    const rejected = next.rejected ?? state.rejectedFiles;
    if (next.value && !sameItems(next.value, state.value, isFileEqual)) {
      if (
        emitChange(callbacks.onValueChange, next.value, reason, event, { rejectedFiles: rejected })
      ) {
        setValue(next.value);
        pending.value = next.value;
      }
    }
    if (
      next.rejected &&
      !sameItems(next.rejected, state.rejectedFiles, (x, y) => isFileEqual(x.file, y.file))
    ) {
      if (emitChange(callbacks.onFileReject, next.rejected, reason, event)) {
        setRejectedFiles(next.rejected);
        pending.rejectedFiles = next.rejected;
      }
    }
    // Only for the rest of this task: a controlled parent that ignores the change never re-renders.
    if (!pendingRef.current) queueMicrotask(() => (pendingRef.current = null));
    pendingRef.current = pending;
  };

  const isWithinRange = (incoming: number, current: number) => {
    if (!multiple && incoming > 1) return false;
    if (!multiple && incoming + current === 2) return true;
    return incoming + current <= maxFiles;
  };

  const validateFiles = (files: File[], current: File[], currentRejected: FileRejection[]) => {
    const accepted: File[] = [];
    const rejected: FileRejection[] = [];
    const keys = new Set(multiple ? current.map(getFileKey) : []);
    for (const file of files) {
      const typeError = isValidType(file);
      const sizeError = getFileSizeError(file, minFileSize, maxFileSize);
      const key = getFileKey(file);
      const duplicate = keys.has(key);
      const custom = validate?.(file, { acceptedFiles: current, rejectedFiles: currentRejected });
      const valid = custom ? custom.length === 0 : true;
      if (!typeError && !sizeError && valid && !duplicate) {
        accepted.push(file);
        keys.add(key);
        continue;
      }
      const errors: FileError[] = [];
      if (typeError) errors.push(typeError);
      if (sizeError) errors.push(sizeError);
      if (duplicate) errors.push("FILE_EXISTS");
      if (!valid) errors.push(...(custom ?? []));
      rejected.push({ file, errors });
    }
    if (!isWithinRange(accepted.length, current.length)) {
      for (const file of accepted) rejected.push({ file, errors: ["TOO_MANY_FILES"] });
      accepted.length = 0;
    }
    return { accepted, rejected };
  };

  const select = (files: File[], reason: FileUploadChangeReason, event?: Event) => {
    const state = currentFiles();
    const { accepted, rejected } = validateFiles(files, state.value, state.rejectedFiles);
    const add = (added: File[]) => {
      if (multiple) update({ value: [...currentFiles().value, ...added], rejected }, reason, event);
      else if (added.length > 0) update({ value: [added[0]], rejected }, reason, event);
      else if (rejected.length > 0) update({ rejected }, reason, event);
    };
    if (transformFiles) void transformFiles(accepted).then(add);
    else add(accepted);
    return accepted.length > 0;
  };

  useEffect(() => {
    if (!preventDocumentDrop || !allowDrop || disabled) return;
    const doc = rootRef.current?.ownerDocument ?? document;
    const preventFileDrop = (event: DragEvent) => {
      if (event.defaultPrevented || !isEventWithFiles(event)) return;
      event.preventDefault();
    };
    doc.addEventListener("dragover", preventFileDrop);
    doc.addEventListener("drop", preventFileDrop);
    return () => {
      doc.removeEventListener("dragover", preventFileDrop);
      doc.removeEventListener("drop", preventFileDrop);
    };
  }, [preventDocumentDrop, allowDrop, disabled]);

  const valueKey = value.map(getFileKey).join(",");
  const syncedKeyRef = useRef<string | null>(null);
  useEffect(() => {
    const input = inputRef.current;
    if (!input || syncedKeyRef.current === valueKey) return;
    const mounting = syncedKeyRef.current === null;
    syncedKeyRef.current = valueKey;
    setInputFiles(input, latest.current.value);
    if (!mounting) input.dispatchEvent(new Event("change", { bubbles: true }));
  }, [valueKey, latest]);

  const syncInputFiles = useCallback(() => {
    const input = inputRef.current;
    if (input) setInputFiles(input, currentFiles().value);
  }, [currentFiles]);

  const attachInput = useCallback(
    (input: HTMLInputElement | null) => {
      inputRef.current = input;
      if (!input) return;
      input.addEventListener("cancel", syncInputFiles);
      return () => {
        input.removeEventListener("cancel", syncInputFiles);
        inputRef.current = null;
      };
    },
    [syncInputFiles],
  );

  const stateAttributes = fieldStateAttributes({ disabled, readOnly, invalid, required });

  const context: FileUploadContextValue = {
    value,
    rejectedFiles,
    dragging,
    disabled,
    readOnly,
    invalid,
    required,
    stateAttributes,
    interactive,
    allowDrop,
    directory,
    capture,
    name,
    multiple,
    acceptAttribute,
    locale,
    ids: { input: `file:${uid}:input`, label: `file:${uid}:label` },
    inputId: rendered.input,
    reportRendered,
    attachInput,
    dropzoneRef,
    setDragging,
    openFilePicker() {
      if (!interactive) return;
      requestAnimationFrame(() => inputRef.current?.click());
    },
    syncInputFiles,
    select,
    deleteFile(file, type, event) {
      if (!interactive) return;
      if (type === "rejected") {
        const rejected = currentFiles().rejectedFiles.filter(
          (entry) => !isFileEqual(entry.file, file),
        );
        update({ rejected }, "delete", event);
      } else {
        const files = currentFiles().value.filter((entry) => !isFileEqual(entry, file));
        update({ value: files }, "delete", event);
      }
    },
    clearFiles(event) {
      if (!interactive) return;
      update({ value: EMPTY_FILES, rejected: EMPTY_REJECTIONS }, "clear", event);
    },
  };

  const renderState: FileUploadRenderState = {
    value,
    rejectedFiles,
    dragging,
    disabled,
    readOnly,
    invalid,
    required,
    addFiles: (files) => interactive && select(files, "add"),
  };

  return {
    context,
    renderState,
    rootRef,
    rootProps: {
      ...stateAttributes,
      "data-dragging": dataAttr(dragging),
    },
  };
}
