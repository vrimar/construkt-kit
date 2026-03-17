import { Alert, Button, Field, Input, Stack, useAutoFocus } from "@b3/ui";
import { type ReactNode, useState } from "react";

import { AuthLayout } from "../AuthLayout";

export interface ForgotPasswordPageProps {
  onSubmit: (email: string) => void;
  isLoading?: boolean;
  logo?: ReactNode;
  onBack?: () => void;
  isSuccess?: boolean;
}

export function ForgotPasswordPage({
  onSubmit,
  isLoading,
  logo,
  onBack,
  isSuccess,
}: ForgotPasswordPageProps) {
  const emailInput = useAutoFocus();
  const [email, setEmail] = useState("");

  return (
    <AuthLayout
      logo={logo}
      title="Reset password"
      showTitle
    >
      {isSuccess ? (
        <Stack gap="4">
          <Alert
            status="success"
            title="Check your email for a link to reset your password."
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
            onSubmit(email);
          }}
        >
          <Stack gap="4">
            <Field label="Email">
              <Input
                ref={emailInput}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
              />
            </Field>

            <Button
              w="100%"
              type="submit"
              loading={isLoading}
              colorPalette="brand"
            >
              Send reset link
            </Button>

            {onBack && (
              <Button
                type="button"
                variant="plain"
                onClick={onBack}
              >
                Back to login
              </Button>
            )}
          </Stack>
        </form>
      )}
    </AuthLayout>
  );
}
