import { PasswordInput, Text, useAutoFocus } from "@construkt-kit/ui";
import { type ReactElement, useRef, useState } from "react";

import { AuthField, AuthForm, AuthSuccess, useSubmitAttempted } from "../AuthForm";
import { AuthLayout } from "../AuthLayout";
import { FieldHintPopover } from "../FieldHintPopover";
import { isPasswordValid, PasswordRulesPopover } from "../PasswordRules";
import type { AuthPageProps } from "../types";

const PASSWORDS_DIFFER = "Passwords do not match.";

function getPasswordError(password: string): string | undefined {
  if (!password) return "Password is required.";
  if (!isPasswordValid(password)) return "Enter a password that meets every rule.";
  return undefined;
}

export interface ResetPasswordPageProps extends AuthPageProps {
  onSubmit: (email: string, token: string, password: string, confirmPassword: string) => void;
  email?: string;
  token?: string;
  isSuccess?: boolean;
  onBack?: () => void;
}

export function ResetPasswordPage({
  onSubmit,
  isLoading,
  error,
  logo,
  email = "",
  token = "",
  isSuccess,
  onBack,
  title = "Set new password",
  description = "Choose a new password to secure your account.",
}: ResetPasswordPageProps) {
  const passwordInput = useAutoFocus();
  const confirmInput = useRef<HTMLInputElement>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isConfirmFocused, setIsConfirmFocused] = useState(false);

  const passwordError = getPasswordError(password);
  const confirmError = password === confirmPassword ? undefined : PASSWORDS_DIFFER;

  const handleSubmit = () => {
    if (passwordError) passwordInput.current?.focus();
    else if (confirmError) confirmInput.current?.focus();
    else onSubmit(email, token, password, confirmPassword);
  };

  return (
    <AuthLayout
      logo={logo}
      title={title}
      description={description}
      showTitle
    >
      {isSuccess ? (
        <AuthSuccess
          title="Your password has been reset successfully."
          onBack={onBack}
        />
      ) : (
        <AuthForm
          onSubmit={handleSubmit}
          submitLabel="Reset password"
          loading={isLoading}
          error={error}
        >
          <AuthField
            label="New password"
            error={passwordError}
          >
            <PasswordRulesPopover
              open={isRulesOpen && password.length > 0}
              password={password}
            >
              <PasswordInput
                ref={passwordInput}
                value={password}
                onFocus={() => setIsRulesOpen(true)}
                onBlur={() => setIsRulesOpen(false)}
                onChange={(e) => setPassword(e.target.value)}
              />
            </PasswordRulesPopover>
          </AuthField>

          <AuthField
            label="Confirm password"
            error={confirmError}
          >
            <PasswordsDifferHint open={isConfirmFocused && confirmError !== undefined}>
              <PasswordInput
                ref={confirmInput}
                value={confirmPassword}
                onFocus={() => setIsConfirmFocused(true)}
                onBlur={() => setIsConfirmFocused(false)}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </PasswordsDifferHint>
          </AuthField>
        </AuthForm>
      )}
    </AuthLayout>
  );
}

function PasswordsDifferHint({ open, children }: { open: boolean; children: ReactElement }) {
  // Once a submit is attempted, the field's error text says the same.
  const submitAttempted = useSubmitAttempted();

  return (
    <FieldHintPopover
      open={open && !submitAttempted}
      hint={<Text color="fg.error">{PASSWORDS_DIFFER}</Text>}
    >
      {children}
    </FieldHintPopover>
  );
}
