import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    email: z.string().min(1).email(),
    password: z.string().min(6),
    confirmPassword: z.string(),
    full_name: z.string().min(1).max(200),
    phone: z.string().min(10).max(15),
    flat_number: z.string().max(50).optional(),
    society_code: z.string().min(1),
    building_id: z.string().optional(),
    role: z.enum(["resident", "guard"]),
  })
  .refine((d) => d.password === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

export type SignupInput = z.infer<typeof signupSchema>;
