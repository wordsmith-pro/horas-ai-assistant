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

// Collect all known origins — including the v0 preview, Vercel preview,
// production, and localhost. Wildcards are not supported by Better Auth so
// we enumerate every env-derived URL we can find.
const trustedOrigins = [
  baseURL,
  productionUrl,
  deploymentUrl,
  runtimeUrl,
  "http://localhost:3000",
  "https://localhost:3000",
  // v0.app preview iframes send requests from these origins
  process.env.NEXT_PUBLIC_APP_URL,
].filter(Boolean) as string[]

export const auth = betterAuth({
  database: new Pool({ connectionString: process.env.DATABASE_URL }),
  baseURL,
  trustedOrigins,
  emailAndPassword: { enabled: true },
  advanced: {
    // Required in ALL environments when running inside v0 / Vercel preview
    // iframes — without sameSite:none the browser silently drops the cookie.
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
    },
    crossSubDomainCookies: {
      enabled: true,
    },
    // Disable CSRF check so that cross-origin requests from the iframe work.
    disableCSRFCheck: true,
  },
})
