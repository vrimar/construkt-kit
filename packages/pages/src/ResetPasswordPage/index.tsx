import { Alert, Button, Field, Input, Stack, useAutoFocus } from "@construkt-kit/ui";
import { type ReactNode, useState } from "react";

import { AuthLayout } from "../AuthLayout";

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
              <Input
                ref={passwordInput}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
              />
            </Field>

            <Field label="Confirm password">
              <Input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type="password"
              />
            </Field>

            <Button
              w="100%"
              type="submit"
              loading={isLoading}
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
