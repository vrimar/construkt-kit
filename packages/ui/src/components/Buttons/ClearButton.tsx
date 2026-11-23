import { CloseButton, type CloseButtonProps } from "./IconButtonPresets";

export interface ClearButtonProps extends CloseButtonProps {
  field: () => HTMLElement | null | undefined;
}

export function ClearButton({ field, onClick, ...props }: ClearButtonProps) {
  return (
    <CloseButton
      {...props}
      onClick={(event) => {
        const button = event.currentTarget;
        onClick?.(event);
        requestAnimationFrame(() => {
          if (!button.isConnected) field()?.focus();
        });
      }}
    />
  );
}
