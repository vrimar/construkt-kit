import { z } from "zod";

export const emailSchema = z.string().email("Invalid email address");

export const phoneSchema = z.string().regex(/^\+?[1-9]\d{7,14}$/, "Invalid phone number");

export const passwordSchema = z
  .string()
  .min(8, "At least 8 characters")
  .regex(/[A-Z]/, "At least one uppercase letter")
  .regex(/[0-9]/, "At least one number");

/** Compose base schemas in each app's form schemas. */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Required"),
});
