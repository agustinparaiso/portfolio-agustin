import dotenv from "dotenv";
import { envConfigSchema, EnvConfig } from "@ai-playground/shared";

dotenv.config();

export function loadEnv(): EnvConfig {
  const parsed = envConfigSchema.safeParse(process.env);
  if (!parsed.success) {
    const formatted = parsed.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
    throw new Error(`Invalid environment configuration: ${formatted}`);
  }

  return parsed.data;
}
