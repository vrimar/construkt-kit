import { Alert, Button, Field, Input, Stack, useAutoFocus } from "@b3/ui";
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
}

export function ResetPasswordPage({
  onSubmit,
  isLoading,
  logo,
  email = "",
  token = "",
  isSuccess,
  onBack,
}: ResetPasswordPageProps) {
  const passwordInput = useAutoFocus();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <AuthLayout
      logo={logo}
      title="Set new password"
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
            >
              Reset password
            </Button>
          </Stack>
        </form>
      )}
    </AuthLayout>
  );
}
