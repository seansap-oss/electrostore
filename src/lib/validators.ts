import { z } from "zod";

export const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(60),
  lastName: z.string().min(1, "Last name is required").max(60),
  email: z.string().email("Enter a valid email"),
  mobile: z.string().max(20).optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirm: z.string()
}).refine((d) => d.password === d.confirm, { message: "Passwords do not match", path: ["confirm"] });

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required")
});

export const addressSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  company: z.string().optional(),
  street: z.string().min(3, "Street address is required"),
  unit: z.string().optional(),
  suburb: z.string().min(1, "Suburb is required"),
  state: z.enum(["NSW", "VIC", "QLD", "SA", "WA", "TAS", "NT", "ACT"]),
  postcode: z.string().regex(/^\d{4}$/, "Enter a valid 4-digit postcode"),
  country: z.string().default("AU"),
  mobile: z.string().min(6, "Mobile is required"),
  instructions: z.string().optional()
});

export const productSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(2),
  sku: z.string().min(2),
  price: z.number().int().min(0),
  categoryId: z.string().optional(),
  brandId: z.string().optional().nullable()
});

export const couponSchema = z.object({
  code: z.string().min(3).max(24),
  type: z.enum(["percent", "fixed", "freeship"]),
  amount: z.number().int().min(0)
});
