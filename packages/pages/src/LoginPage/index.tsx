import { Field, Input, useAutoFocus } from "@construkt-kit/ui";
import { useState } from "react";

import { AuthForm, AuthLinkButton } from "../AuthForm";
import { AuthLayout } from "../AuthLayout";
import type { AuthPageProps } from "../types";

export interface LoginPageProps extends AuthPageProps {
  onSubmit: (email: string, password: string) => void;
  onForgotPassword?: () => void;
}

export function LoginPage({
  onSubmit,
  isLoading,
  logo,
  onForgotPassword,
  title = "Welcome back",
  description = "Sign in to continue to App.",
}: LoginPageProps) {
  const emailInput = useAutoFocus();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <AuthLayout
      logo={logo}
      title={title}
      description={description}
      showTitle
    >
      <AuthForm
        onSubmit={() => onSubmit(email, password)}
        submitLabel="Login"
        isLoading={isLoading}
        isSubmitDisabled={!email || !password}
        footer={
          onForgotPassword && (
            <AuthLinkButton onClick={onForgotPassword}>Forgot your password?</AuthLinkButton>
          )
        }
      >
        <Field label="Email">
          <Input
            ref={emailInput}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field label="Password">
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
          />
        </Field>
      </AuthForm>
    </AuthLayout>
  );
}
