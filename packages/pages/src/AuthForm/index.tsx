import { Alert, Button, Field, type FieldProps, Input, Stack } from "@construkt-kit/ui";
import { emailSchema } from "@construkt-kit/utils";
import {
  createContext,
  type FormEvent,
  type ReactNode,
  type Ref,
  useContext,
  useState,
} from "react";

export function getEmailError(email: string): string | undefined {
  if (!email) return "Email is required.";
  if (!emailSchema.safeParse(email).success) return "Enter a valid email address.";
  return undefined;
}

const SubmitAttemptedContext = createContext(false);

export interface AuthFormProps {
  onSubmit: () => void;
  submitLabel: string;
  loading?: boolean;
  submitDisabled?: boolean;
  /** Shown above the fields in an error alert that screen readers announce. */
  error?: ReactNode;
  children: ReactNode;
  /** Rendered between the fields and the submit button, such as a captcha. */
  beforeSubmit?: ReactNode;
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
  beforeSubmit,
  footer,
}: AuthFormProps) {
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitAttempted(true);
    onSubmit();
  };

  return (
    <SubmitAttemptedContext value={submitAttempted}>
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

          {beforeSubmit}

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
    </SubmitAttemptedContext>
  );
}

export const useSubmitAttempted = () => useContext(SubmitAttemptedContext);

export interface AuthFieldProps extends Omit<FieldProps, "invalid" | "errorText"> {
  error: string | undefined;
}

export function AuthField({ error, ...props }: AuthFieldProps) {
  const submitAttempted = useSubmitAttempted();

  return (
    <Field
      {...props}
      invalid={submitAttempted && error !== undefined}
      errorText={error}
    />
  );
}

export interface AuthEmailFieldProps {
  ref: Ref<HTMLInputElement>;
  value: string;
  onValueChange: (value: string) => void;
  autoComplete: "username" | "email";
}

export function AuthEmailField({ ref, value, onValueChange, autoComplete }: AuthEmailFieldProps) {
  return (
    <AuthField
      label="Email"
      error={getEmailError(value)}
    >
      <Input
        ref={ref}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        type="email"
        autoComplete={autoComplete}
      />
    </AuthField>
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

export interface BackToSignInProps {
  onBack: () => void;
  label?: string | undefined;
}

export function BackToSignIn({ onBack, label = "Back to sign in" }: BackToSignInProps) {
  return <AuthLinkButton onClick={onBack}>{label}</AuthLinkButton>;
}

export interface AuthSuccessProps {
  title: string;
  onBack?: () => void;
  backLabel?: string;
}

export function AuthSuccess({ title, onBack, backLabel }: AuthSuccessProps) {
  return (
    <Stack gap="4">
      <Alert
        status="success"
        title={title}
      />
      {onBack && (
        <BackToSignIn
          onBack={onBack}
          label={backLabel}
        />
      )}
    </Stack>
  );
}
