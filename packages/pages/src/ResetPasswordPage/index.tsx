import { Field, PasswordInput, Popover, Text, useAutoFocus } from "@construkt-kit/ui";
import { useState } from "react";

import { AuthForm, AuthSuccess } from "../AuthForm";
import { AuthLayout } from "../AuthLayout";
import { isPasswordValid, PasswordRulesPopover } from "../PasswordRules";
import type { AuthPageProps } from "../types";

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
  logo,
  email = "",
  token = "",
  isSuccess,
  onBack,
  title = "Set new password",
  description = "Choose a new password to secure your account.",
}: ResetPasswordPageProps) {
  const passwordInput = useAutoFocus();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isConfirmFocused, setIsConfirmFocused] = useState(false);

  const passwordValid = isPasswordValid(password);
  const confirmValid = password === confirmPassword;

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
          onSubmit={() => onSubmit(email, token, password, confirmPassword)}
          submitLabel="Reset password"
          isLoading={isLoading}
          isSubmitDisabled={!password || !passwordValid || !confirmPassword || !confirmValid}
        >
          <Field label="New password">
            <PasswordRulesPopover
              isOpen={isRulesOpen && password.length > 0}
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
          </Field>

          <Field label="Confirm password">
            <Popover.Root
              lazyMount
              unmountOnExit
              autoFocus={false}
              modal={false}
              open={isConfirmFocused && !confirmValid}
              placement="right"
            >
              <Popover.Trigger>
                <PasswordInput
                  value={confirmPassword}
                  onFocus={() => setIsConfirmFocused(true)}
                  onBlur={() => setIsConfirmFocused(false)}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Popover.Trigger>
              <Popover.Content p="4">
                <Text color="fg.error">Passwords do not match.</Text>
              </Popover.Content>
            </Popover.Root>
          </Field>
        </AuthForm>
      )}
    </AuthLayout>
  );
}
