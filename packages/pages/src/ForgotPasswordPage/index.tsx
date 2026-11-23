import { useAutoFocus } from "@construkt-kit/ui";
import { type ReactNode, useState } from "react";

import { AuthEmailField, AuthForm, AuthSuccess, BackToSignIn, getEmailError } from "../AuthForm";
import { AuthLayout } from "../AuthLayout";
import type { AuthPageProps } from "../types";

export interface ForgotPasswordPageProps extends AuthPageProps {
  onSubmit: (email: string) => void;
  onBack?: () => void;
  isSuccess?: boolean;
  /** Rendered between the email field and the submit button, such as a captcha. */
  beforeSubmit?: ReactNode;
}

export function ForgotPasswordPage({
  onSubmit,
  isLoading,
  error,
  logo,
  onBack,
  isSuccess,
  beforeSubmit,
  title = "Reset password",
  description = "Enter your email and we will send you a reset link.",
}: ForgotPasswordPageProps) {
  const emailInput = useAutoFocus();
  const [email, setEmail] = useState("");

  const handleSubmit = () => {
    if (getEmailError(email)) emailInput.current?.focus();
    else onSubmit(email);
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
          title="Check your email for a link to reset your password."
          onBack={onBack}
        />
      ) : (
        <AuthForm
          onSubmit={handleSubmit}
          submitLabel="Send reset link"
          loading={isLoading}
          error={error}
          beforeSubmit={beforeSubmit}
          footer={onBack && <BackToSignIn onBack={onBack} />}
        >
          <AuthEmailField
            ref={emailInput}
            value={email}
            onValueChange={setEmail}
            autoComplete="email"
          />
        </AuthForm>
      )}
    </AuthLayout>
  );
}
