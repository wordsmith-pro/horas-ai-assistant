import { betterAuth } from "better-auth"
import { Pool } from "pg"

const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined

const deploymentUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : undefined

const runtimeUrl = process.env.V0_RUNTIME_URL

const baseURL =
  process.env.BETTER_AUTH_URL ??
  productionUrl ??
  deploymentUrl ??
  runtimeUrl ??
  "http://localhost:3000"

const trustedOrigins = [
  baseURL,
  productionUrl,
  deploymentUrl,
  runtimeUrl,
  "http://localhost:3000",
].filter(Boolean) as string[]

export const auth = betterAuth({
  database: new Pool({ connectionString: process.env.DATABASE_URL }),
  baseURL,
  trustedOrigins,
  emailAndPassword: { enabled: true },
  ...(process.env.NODE_ENV === "development" && {
    advanced: {
      defaultCookieAttributes: { sameSite: "none", secure: true },
    },
  }),
})
