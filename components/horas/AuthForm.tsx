"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn, signUp } from "@/lib/auth-client"
import HorasLogo from "./HorasLogo"

interface AuthFormProps {
  mode: "sign-in" | "sign-up"
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (mode === "sign-up") {
        const result = await signUp.email({ name, email, password })
        if (result.error) throw new Error(result.error.message ?? "Sign up failed")
      } else {
        const result = await signIn.email({ email, password })
        if (result.error) throw new Error(result.error.message ?? "Sign in failed")
      }
      router.push("/")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #0D1117 0%, #161B22 50%, #0D1117 100%)" }}
    >
      {/* Background decoration */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(201,168,76,0.04) 0%, transparent 50%),
                            radial-gradient(circle at 80% 50%, rgba(59,130,246,0.04) 0%, transparent 50%)`,
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo + brand */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full blur-2xl"
                style={{ background: "rgba(201,168,76,0.15)" }}
              />
              <HorasLogo theme="dark" size={72} className="relative logo-shimmer" />
            </div>
          </div>
          <h1
            className="text-2xl font-bold font-sans tracking-wider"
            style={{ color: "#C9A84C" }}
          >
            HORAS
          </h1>
          <p className="text-xs font-sans tracking-widest mt-0.5" style={{ color: "rgba(201,168,76,0.5)" }}>
            AI ASSISTANT
          </p>
          <p className="text-sm mt-3 font-sans" style={{ color: "rgba(232,234,240,0.5)" }}>
            {mode === "sign-in" ? "Welcome back — أهلاً بعودتك" : "Create your account — أنشئ حسابك"}
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6 border"
          style={{
            background: "#161B22",
            borderColor: "rgba(255,255,255,0.07)",
            boxShadow: "0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(201,168,76,0.06)",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "sign-up" && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-xs font-medium mb-1.5 font-sans"
                  style={{ color: "rgba(232,234,240,0.6)" }}
                >
                  Full Name / الاسم الكامل
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Ahmed Mohamed"
                  className="w-full rounded-xl px-4 py-2.5 text-sm font-sans outline-none transition-all duration-200"
                  style={{
                    background: "#1C2128",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#E8EAF0",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.5)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium mb-1.5 font-sans"
                style={{ color: "rgba(232,234,240,0.6)" }}
              >
                Email / البريد الإلكتروني
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full rounded-xl px-4 py-2.5 text-sm font-sans outline-none transition-all duration-200"
                style={{
                  background: "#1C2128",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#E8EAF0",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.5)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium mb-1.5 font-sans"
                style={{ color: "rgba(232,234,240,0.6)" }}
              >
                Password / كلمة المرور
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="••••••••"
                className="w-full rounded-xl px-4 py-2.5 text-sm font-sans outline-none transition-all duration-200"
                style={{
                  background: "#1C2128",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#E8EAF0",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.5)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
              />
            </div>

            {error && (
              <div
                className="rounded-lg px-3 py-2 text-xs font-sans"
                style={{ background: "rgba(239,68,68,0.1)", color: "#F87171", border: "1px solid rgba(239,68,68,0.2)" }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm font-semibold font-sans transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: loading ? "rgba(201,168,76,0.4)" : "#C9A84C",
                color: "#0D1117",
                boxShadow: "0 4px 16px rgba(201,168,76,0.25)",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  {mode === "sign-in" ? "Signing in..." : "Creating account..."}
                </span>
              ) : (
                mode === "sign-in" ? "Sign In / دخول" : "Create Account / إنشاء حساب"
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs font-sans" style={{ color: "rgba(232,234,240,0.35)" }}>
              {mode === "sign-in" ? (
                <>
                  {"Don't have an account? "}
                  <a href="/sign-up" className="font-medium hover:underline" style={{ color: "#C9A84C" }}>
                    Sign Up
                  </a>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <a href="/sign-in" className="font-medium hover:underline" style={{ color: "#C9A84C" }}>
                    Sign In
                  </a>
                </>
              )}
            </p>
          </div>
        </div>

        <p className="text-center text-[10px] mt-4 font-sans" style={{ color: "rgba(232,234,240,0.2)" }}>
          HORAS AI — Made in Egypt for the World
        </p>
      </div>
    </div>
  )
}
