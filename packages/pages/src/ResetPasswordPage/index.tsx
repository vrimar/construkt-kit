import {
  Alert,
  Button,
  Field,
  PasswordInput,
  Popover,
  Stack,
  Text,
  useAutoFocus,
} from "@construkt-kit/ui";
import { type ReactNode, useState } from "react";

import { AuthLayout } from "../AuthLayout";
import { isPasswordValid, PasswordRulesPopover } from "../PasswordRules";

export interface ResetPasswordPageProps {
  onSubmit: (email: string, token: string, password: string, confirmPassword: string) => void;
  isLoading?: boolean;
  logo?: ReactNode;
  email?: string;
  token?: string;
  isSuccess?: boolean;
  onBack?: () => void;
  title?: string;
  description?: string;
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
  const isDisabled = isLoading || !password || !passwordValid || !confirmPassword || !confirmValid;

  return (
    <AuthLayout
      logo={logo}
      title={title}
      description={description}
      showTitle
    >
      {isSuccess ? (
        <Stack gap="4">
          <Alert
            status="success"
            title="Your password has been reset successfully."
          />
          {onBack && (
            <Button
              variant="plain"
              onClick={onBack}
              colorPalette="brand"
            >
              Back to login
            </Button>
          )}
        </Stack>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(email, token, password, confirmPassword);
          }}
        >
          <Stack gap="4">
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
                  <Text color="red.600">Passwords do not match.</Text>
                </Popover.Content>
              </Popover.Root>
            </Field>

            <Button
              w="100%"
              type="submit"
              loading={isLoading}
              disabled={isDisabled}
              colorPalette="brand"
            >
              Reset password
            </Button>
          </Stack>
        </form>
      )}
    </AuthLayout>
  );
}
