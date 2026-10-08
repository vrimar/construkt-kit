import { Alert, Button, Stack } from "@construkt-kit/ui";
import type { FormEvent, ReactNode } from "react";

export interface AuthFormProps {
  onSubmit: () => void;
  submitLabel: string;
  loading?: boolean;
  submitDisabled?: boolean;
  children: ReactNode;
  /** Rendered below the submit button. */
  footer?: ReactNode;
}

export function AuthForm({
  onSubmit,
  submitLabel,
  loading,
  submitDisabled,
  children,
  footer,
}: AuthFormProps) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="4">
        {children}

        <Button
          w="100%"
          type="submit"
          loading={loading}
          disabled={loading || submitDisabled}
          colorPalette="brand"
        >
          {submitLabel}
        </Button>

        {footer}
      </Stack>
    </form>
  );
}

export interface AuthLinkButtonProps {
  onClick: () => void;
  children: ReactNode;
}

export function AuthLinkButton({ onClick, children }: AuthLinkButtonProps) {
  return (
    <Button
      type="button"
      variant="plain"
      onClick={onClick}
      colorPalette="brand"
    >
      {children}
    </Button>
  );
}

export interface AuthSuccessProps {
  title: string;
  onBack?: () => void;
  backLabel?: string;
}

export function AuthSuccess({ title, onBack, backLabel = "Back to login" }: AuthSuccessProps) {
  return (
    <Stack gap="4">
      <Alert
        status="success"
        title={title}
      />
      {onBack && <AuthLinkButton onClick={onBack}>{backLabel}</AuthLinkButton>}
    </Stack>
  );
}
