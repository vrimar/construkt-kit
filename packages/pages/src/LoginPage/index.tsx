import { Field, Input, Link, useAutoFocus } from "@construkt-kit/ui";
import { useRef, useState } from "react";

import { AuthForm } from "../AuthForm";
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
  const passwordInput = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const handleSubmit = () => {
    setSubmitAttempted(true);
    if (!email) emailInput.current?.focus();
    else if (!password) passwordInput.current?.focus();
    else onSubmit(email, password);
  };

  return (
    <AuthLayout
      logo={logo}
      title={title}
      description={description}
      showTitle
    >
      <AuthForm
        onSubmit={handleSubmit}
        submitLabel="Login"
        loading={isLoading}
      >
        <Field
          label="Email"
          invalid={submitAttempted && !email}
          errorText="Email is required."
        >
          <Input
            ref={emailInput}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field
          label="Password"
          invalid={submitAttempted && !password}
          errorText="Password is required."
          labelAction={
            onForgotPassword && (
              <Link
                asChild
                variant="plain"
                colorPalette="brand"
                color="colorPalette.plain.fg"
              >
                <button
                  type="button"
                  onClick={onForgotPassword}
                >
                  Forgot password?
                </button>
              </Link>
            )
          }
        >
          <Input
            ref={passwordInput}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
          />
        </Field>
      </AuthForm>
    </AuthLayout>
  );
}
