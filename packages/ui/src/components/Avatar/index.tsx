import { UserIcon } from "lucide-react";
import { type ComponentProps, useCallback, useLayoutEffect, useRef, useState } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { avatar } from "#styled-system/recipes";

import { useComposedRefs } from "../../hooks/useComposedRefs";
import { useLatestRef } from "../../hooks/useLatestRef";
import { mergeProps, renderable } from "../../primitives/render";
import { createPartContext } from "../partContext";
import { rendersOwnContent } from "../renderContent";

const { withProvider, withContext } = createSlotRecipeContext(avatar);

const StyledRoot = withProvider(renderable.div, "root");
const StyledImage = withContext(renderable.img, "image", {
  defaultProps: {
    draggable: "false",
    referrerPolicy: "no-referrer",
  },
});
const StyledFallback = withContext(renderable.span, "fallback");

export type AvatarImageStatus = "loading" | "loaded" | "error";

interface AvatarContextValue {
  status: AvatarImageStatus;
  setStatus: (status: AvatarImageStatus, notify?: boolean) => void;
}

const [AvatarContext, useAvatarContext] = createPartContext<AvatarContextValue>("<Avatar.Root>");

type StyledRootProps = ComponentProps<typeof StyledRoot>;

export interface AvatarRootProps extends StyledRootProps {
  /** Called when the image finishes loading, or fails to. */
  onStatusChange?: ((status: Exclude<AvatarImageStatus, "loading">) => void) | undefined;
}

function Root({ onStatusChange, ...props }: AvatarRootProps) {
  const [status, setStatusState] = useState<AvatarImageStatus>("loading");
  const statusRef = useRef<AvatarImageStatus>("loading");
  const onStatusChangeRef = useLatestRef(onStatusChange);

  const setStatus = useCallback(
    (next: AvatarImageStatus, notify = true) => {
      if (next === statusRef.current) return;
      statusRef.current = next;
      setStatusState(next);
      if (notify && next !== "loading") onStatusChangeRef.current?.(next);
    },
    [onStatusChangeRef],
  );

  return (
    <AvatarContext value={{ status, setStatus }}>
      <StyledRoot {...props} />
    </AvatarContext>
  );
}

const hasLoaded = (image: HTMLImageElement) =>
  image.complete && image.naturalWidth !== 0 && image.naturalHeight !== 0;

type ImageProps = ComponentProps<typeof StyledImage>;

// Not `display: none`, which keeps a `loading="lazy"` image from ever being requested.
const loadingImageStyle = {
  position: "absolute",
  inset: 0,
  visibility: "hidden",
} as const;

/** Shows once it has loaded; until then, or if it fails, the fallback shows. */
function Image({ ref, ...props }: ImageProps) {
  const { status, setStatus } = useAvatarContext("Avatar.Image");
  const imageRef = useRef<HTMLImageElement>(null);
  const composedRef = useComposedRefs(imageRef, ref);
  const { src, srcSet } = props;

  useLayoutEffect(() => {
    const image = imageRef.current;
    if (!image) return;
    if (!image.complete) setStatus("loading");
    else setStatus(hasLoaded(image) ? "loaded" : "error");
  }, [src, srcSet, setStatus]);

  useLayoutEffect(() => () => setStatus("error", false), [setStatus]);

  return (
    <StyledImage
      {...mergeProps<ImageProps>(
        {
          hidden: status === "error",
          style: status === "loading" ? loadingImageStyle : undefined,
          onLoad() {
            setStatus("loaded");
          },
          onError() {
            setStatus("error");
          },
        },
        props,
      )}
      ref={composedRef}
    />
  );
}

export interface AvatarFallbackProps extends ComponentProps<typeof StyledFallback> {
  /**
   * The name to derive the initials from.
   * If not provided, the fallback will display a generic icon.
   */
  name?: string | undefined;
}

function Fallback({ name, children, ...rest }: AvatarFallbackProps) {
  const { status } = useAvatarContext("Avatar.Fallback");
  const fallbackContent =
    children || rendersOwnContent(rest.render)
      ? children
      : (name && getInitials(name)) || <UserIcon />;

  return (
    <StyledFallback
      hidden={status === "loaded"}
      {...rest}
    >
      {fallbackContent}
    </StyledFallback>
  );
}

const firstChar = (word = "") => Array.from(word)[0] ?? "";

const getInitials = (name: string) => {
  const names = name.trim().split(/\s+/);
  const lastName = names.length > 1 ? names[names.length - 1] : "";
  return `${firstChar(names[0])}${firstChar(lastName)}`;
};

export const Avatar = {
  Root,
  Image,
  Fallback,
};
