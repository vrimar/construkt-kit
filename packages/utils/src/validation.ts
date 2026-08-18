import { z } from "zod";

export const emailSchema = z.string().email("Invalid email address");

export const phoneSchema = z.string().regex(/^\+?[1-9]\d{7,14}$/, "Invalid phone number");

const PASSWORD_MIN_LENGTH = 8;

const PASSWORD_PATTERNS = [
  { id: "lowercase", label: "Lower case letters (a-z)", pattern: /[a-z]/ },
  { id: "uppercase", label: "Upper case letters (A-Z)", pattern: /[A-Z]/ },
  { id: "digits", label: "Numbers (i.e. 0-9)", pattern: /[0-9]/ },
  { id: "symbols", label: "Special characters (e.g. !@#$%^&*)", pattern: /[^A-Za-z0-9]/ },
];

export interface PasswordRule {
  id: string;
  label: string;
  test: (value: string) => boolean;
}

/** The password policy as data, so a form and a rules checklist can't disagree. */
export const passwordRules: PasswordRule[] = [
  {
    id: "min",
    label: `At least ${PASSWORD_MIN_LENGTH} characters in length`,
    test: (value) => value.length >= PASSWORD_MIN_LENGTH,
  },
  ...PASSWORD_PATTERNS.map(({ id, label, pattern }) => ({
    id,
    label,
    test: (value: string) => pattern.test(value),
  })),
];

export const passwordSchema = PASSWORD_PATTERNS.reduce(
  (schema, { label, pattern }) => schema.regex(pattern, label),
  z.string().min(PASSWORD_MIN_LENGTH, `At least ${PASSWORD_MIN_LENGTH} characters in length`),
);

/** Compose base schemas in each app's form schemas. */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Required"),
});
