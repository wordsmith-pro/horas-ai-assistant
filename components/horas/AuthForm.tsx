"use client"

import { useState, useEffect } from "react"
import { signIn, signUp, useSession } from "@/lib/auth-client"
import HorasLogo from "./HorasLogo"

interface AuthFormProps {
  mode: "sign-in" | "sign-up"
}

export default function AuthForm({ mode }: AuthFormProps) {
  const { data: session, isPending } = useSession()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // If already authenticated redirect without touching the Next.js router
  useEffect(() => {
    if (!isPending && session?.user) {
      window.location.href = "/"
    }
  }, [isPending, session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const onSuccess = () => {
      // Store that we just signed in to bypass session fetch race condition in iframe
      localStorage.setItem("horas-auth-pending", "true")
      // Hard navigate so the new session is picked up on the next page load
      window.location.href = "/"
    }

    const onError = (ctx: { error: { message?: string } }) => {
      setError(ctx.error.message ?? "An error occurred")
      setLoading(false)
    }

    if (mode === "sign-up") {
      await signUp.email({ name, email, password }, { onSuccess, onError })
    } else {
      await signIn.email({ email, password }, { onSuccess, onError })
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #F8F9FC 0%, #EEF0F8 50%, #F4F2FF 100%)" }}
    >
      {/* Subtle background glows — very light, no blobs */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(ellipse at 15% 40%, rgba(201,168,76,0.07) 0%, transparent 55%),
                            radial-gradient(ellipse at 85% 60%, rgba(59,130,246,0.06) 0%, transparent 55%)`,
        }}
      />

      <div className="relative w-full max-w-[380px]">
        {/* Logo + brand */}
        <div className="text-center mb-7">
          <div className="flex justify-center mb-3">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full blur-3xl"
                style={{ background: "rgba(201,168,76,0.12)" }}
              />
              <HorasLogo theme="light" size={80} className="relative logo-shimmer" />
            </div>
          </div>
          <h1
            className="text-2xl font-bold font-sans tracking-wider"
            style={{ color: "#8A6A1F" }}
          >
            HORAS
          </h1>
          <p
            className="text-[10px] font-sans tracking-widest mt-0.5"
            style={{ color: "rgba(59,130,246,0.7)" }}
          >
            AI ASSISTANT
          </p>
          <p
            className="text-sm mt-2.5 font-sans"
            style={{ color: "rgba(13,17,23,0.45)" }}
          >
            {mode === "sign-in"
              ? "Welcome back — أهلاً بعودتك"
              : "Create your account — أنشئ حسابك"}
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(201,168,76,0.15)",
            boxShadow:
              "0 8px 32px rgba(13,17,23,0.08), 0 1px 2px rgba(201,168,76,0.12), 0 0 0 1px rgba(255,255,255,0.6) inset",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "sign-up" && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-xs font-semibold mb-1.5 font-sans"
                  style={{ color: "rgba(13,17,23,0.55)" }}
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
                    background: "#F4F6FA",
                    border: "1.5px solid rgba(13,17,23,0.1)",
                    color: "#0D1117",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(201,168,76,0.6)"
                    e.target.style.background = "#fff"
                    e.target.style.boxShadow = "0 0 0 3px rgba(201,168,76,0.08)"
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(13,17,23,0.1)"
                    e.target.style.background = "#F4F6FA"
                    e.target.style.boxShadow = "none"
                  }}
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold mb-1.5 font-sans"
                style={{ color: "rgba(13,17,23,0.55)" }}
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
                  background: "#F4F6FA",
                  border: "1.5px solid rgba(13,17,23,0.1)",
                  color: "#0D1117",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(201,168,76,0.6)"
                  e.target.style.background = "#fff"
                  e.target.style.boxShadow = "0 0 0 3px rgba(201,168,76,0.08)"
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(13,17,23,0.1)"
                  e.target.style.background = "#F4F6FA"
                  e.target.style.boxShadow = "none"
                }}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold mb-1.5 font-sans"
                style={{ color: "rgba(13,17,23,0.55)" }}
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
                  background: "#F4F6FA",
                  border: "1.5px solid rgba(13,17,23,0.1)",
                  color: "#0D1117",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(201,168,76,0.6)"
                  e.target.style.background = "#fff"
                  e.target.style.boxShadow = "0 0 0 3px rgba(201,168,76,0.08)"
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(13,17,23,0.1)"
                  e.target.style.background = "#F4F6FA"
                  e.target.style.boxShadow = "none"
                }}
              />
            </div>

            {error && (
              <div
                className="rounded-xl px-3.5 py-2.5 text-xs font-sans flex items-start gap-2"
                style={{
                  background: "rgba(239,68,68,0.06)",
                  color: "#DC2626",
                  border: "1px solid rgba(239,68,68,0.18)",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="flex-shrink-0 mt-0.5"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path strokeLinecap="round" d="M12 8v4M12 16h.01" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm font-bold font-sans transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
              style={{
                background: "linear-gradient(135deg, #C9A84C 0%, #E8C870 100%)",
                color: "#0D1117",
                boxShadow: loading
                  ? "none"
                  : "0 4px 20px rgba(201,168,76,0.35), 0 1px 2px rgba(201,168,76,0.2)",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-[#0D1117]/30 border-t-[#0D1117] animate-spin" />
                  {mode === "sign-in" ? "Signing in..." : "Creating account..."}
                </span>
              ) : mode === "sign-in" ? (
                "Sign In / دخول"
              ) : (
                "Create Account / إنشاء حساب"
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs font-sans" style={{ color: "rgba(13,17,23,0.4)" }}>
              {mode === "sign-in" ? (
                <>
                  {"Don't have an account? "}
                  <a
                    href="/sign-up"
                    className="font-semibold hover:underline"
                    style={{ color: "#8A6A1F" }}
                  >
                    Sign Up
                  </a>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <a
                    href="/sign-in"
                    className="font-semibold hover:underline"
                    style={{ color: "#8A6A1F" }}
                  >
                    Sign In
                  </a>
                </>
              )}
            </p>
          </div>
        </div>

        <p
          className="text-center text-[10px] mt-4 font-sans"
          style={{ color: "rgba(13,17,23,0.25)" }}
        >
          HORAS AI — Made in Egypt for the World
        </p>
      </div>
    </div>
  )
}
