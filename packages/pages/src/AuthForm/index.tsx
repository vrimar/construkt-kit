import { Alert, Button, Stack } from "@construkt-kit/ui";
import { emailSchema } from "@construkt-kit/utils";
import type { FormEvent, ReactNode } from "react";

export function getEmailError(email: string): string | undefined {
  if (!email) return "Email is required.";
  if (!emailSchema.safeParse(email).success) return "Enter a valid email address.";
  return undefined;
}

export interface AuthFormProps {
  onSubmit: () => void;
  submitLabel: string;
  loading?: boolean;
  submitDisabled?: boolean;
  /** Shown above the fields in an error alert that screen readers announce. */
  error?: ReactNode;
  children: ReactNode;
  /** Rendered below the submit button. */
  footer?: ReactNode;
}

export function AuthForm({
  onSubmit,
  submitLabel,
  loading,
  submitDisabled,
  error,
  children,
  footer,
}: AuthFormProps) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
    >
      <Stack gap="4">
        {error ? (
          <Alert
            status="error"
            role="alert"
            title={error}
          />
        ) : null}

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

export function AuthSuccess({ title, onBack, backLabel = "Back to sign in" }: AuthSuccessProps) {
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
