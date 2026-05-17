import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
  username: z.string().min(3, "At least 3 characters").max(20, "Max 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers, and underscores only"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const placeBetSchema = z.object({
  game: z.enum(["slots", "blackjack", "poker", "roulette"]),
  currency: z.enum(["gold", "sweeps"]),
  betAmount: z.number().positive(),
});

export const recordResultSchema = z.object({
  sessionId: z.string().uuid(),
  winAmount: z.number().min(0),
  resultData: z.record(z.unknown()).optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PlaceBetInput = z.infer<typeof placeBetSchema>;
export type RecordResultInput = z.infer<typeof recordResultSchema>;
