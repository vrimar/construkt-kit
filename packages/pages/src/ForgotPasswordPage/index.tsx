import { Alert, Button, Field, Input, Stack, useAutoFocus } from "@construkt-kit/ui";
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
      description="Enter your email and we will send you a reset link."
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
                bg="bg.subtle"
                _focusVisible={{
                  borderColor: "brand.solid.bg",
                  boxShadow: "0 0 0 3px rgba(59,114,217,0.12)",
                  bg: "bg",
                }}
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
                colorPalette="brand"
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
