import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
  fullName: z.string().min(2, "Tell us your name"),
  businessName: z.string().min(2, "What's your company called?"),
  industry: z.enum([
    "cleaning",
    "airbnb_turnover",
    "pressure_washing",
    "mobile_detailing",
    "landscaping",
    "home_services",
    "contracting",
    "other",
  ]),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
