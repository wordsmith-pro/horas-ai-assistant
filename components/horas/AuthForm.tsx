"use client"

import { useState, useEffect } from "react"
import { signIn, signUp, useSession } from "@/lib/auth-client"

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
  const [focusedInput, setFocusedInput] = useState<string | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!isPending && session?.user) {
      window.location.href = "/"
    }
  }, [isPending, session])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const onSuccess = async () => {
      // Cache the basic user info to bypass iframe cookie issue
      localStorage.setItem("amun-user-session", JSON.stringify({
        user: {
          id: "temp-" + Date.now(),
          name: name || email.split("@")[0],
          email: email,
        }
      }))
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
      onMouseMove={handleMouseMove}
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0F0E1E 0%, #1A1530 50%, #2D1E3E 100%)",
      }}
    >
      {/* Animated gradient orbs */}
      <div
        className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(201,168,76,0.8) 0%, transparent 70%)",
          animation: "float 20s ease-in-out infinite",
        }}
      />
      <div
        className="absolute bottom-20 right-10 w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(100,200,255,0.6) 0%, transparent 70%)",
          animation: "float 25s ease-in-out infinite reverse",
        }}
      />

      {/* Cursor glow effect */}
      <div
        className="fixed w-96 h-96 rounded-full pointer-events-none opacity-30 blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(201,168,76,0.4) 0%, transparent 70%)",
          left: mousePos.x - 192,
          top: mousePos.y - 192,
          transition: "all 0.3s ease-out",
          filter: "blur(40px)",
        }}
      />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            "url('data:image/svg+xml?utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100\" height=\"100\"><filter id=\"n\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"4\" result=\"noise\"/></filter><rect width=\"100%\" height=\"100%\" fill=\"white\" filter=\"url(%23n)\"/></svg>')",
          backgroundSize: "100px 100px",
        }}
      />

      <div className="relative w-full max-w-md z-10">
        {/* Logo + Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div
              className="relative"
              style={{
                transform: `perspective(1000px) rotateX(${mousePos.y / 100}deg) rotateY(${-mousePos.x / 100}deg)`,
                transition: "transform 0.3s ease-out",
              }}
            >
              <div className="w-32 h-32 relative">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Amun%20logo-9WfU8NV7xTbk9pT9D1ZqFAUAUrlxX1.png"
                  alt="AMUN Logo"
                  className="w-full h-full object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </div>

          <h1 className="text-5xl font-black tracking-wider mb-2" style={{ color: "#C9A84C" }}>
            AMUN
          </h1>
          <p className="text-sm tracking-widest mb-1" style={{ color: "#C9A84C" }}>
            EGYPTIAN AI ASSISTANT
          </p>
          <p className="text-sm mt-3" style={{ color: "rgba(201,168,76,0.6)" }}>
            {mode === "sign-in" ? "Welcome back — أهلاً بعودتك" : "Create your account — أنشئ حسابك"}
          </p>
        </div>

        {/* Main Card with 3D effect */}
        <div
          className="relative rounded-3xl p-8 overflow-hidden group"
          style={{
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(201,168,76,0.2)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
            transition: "all 0.3s ease-out",
            transform: `perspective(1000px) rotateX(${mousePos.y / 200}deg) rotateY(${-mousePos.x / 200}deg)`,
          }}
        >
          {/* Shine effect */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: `linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)`,
              transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
            }}
          />

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {mode === "sign-up" && (
              <div className="group/input">
                <label className="block text-xs font-bold mb-2 uppercase tracking-widest" style={{ color: "rgba(201,168,76,0.8)" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setFocusedInput("name")}
                  onBlur={() => setFocusedInput(null)}
                  required
                  placeholder="Ahmed Mohamed"
                  className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all duration-300 placeholder-shown:bg-opacity-40"
                  style={{
                    background: focusedInput === "name" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)",
                    border: focusedInput === "name" ? "2px solid rgba(201,168,76,0.5)" : "2px solid rgba(201,168,76,0.2)",
                    color: "#fff",
                    boxShadow: focusedInput === "name" ? "0 0 20px rgba(201,168,76,0.2), inset 0 1px 2px rgba(255,255,255,0.1)" : "inset 0 1px 2px rgba(255,255,255,0.05)",
                  }}
                />
              </div>
            )}

            <div className="group/input">
              <label className="block text-xs font-bold mb-2 uppercase tracking-widest" style={{ color: "rgba(201,168,76,0.8)" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedInput("email")}
                onBlur={() => setFocusedInput(null)}
                required
                placeholder="you@example.com"
                className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all duration-300"
                style={{
                  background: focusedInput === "email" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)",
                  border: focusedInput === "email" ? "2px solid rgba(201,168,76,0.5)" : "2px solid rgba(201,168,76,0.2)",
                  color: "#fff",
                  boxShadow: focusedInput === "email" ? "0 0 20px rgba(201,168,76,0.2), inset 0 1px 2px rgba(255,255,255,0.1)" : "inset 0 1px 2px rgba(255,255,255,0.05)",
                }}
              />
            </div>

            <div className="group/input">
              <label className="block text-xs font-bold mb-2 uppercase tracking-widest" style={{ color: "rgba(201,168,76,0.8)" }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedInput("password")}
                onBlur={() => setFocusedInput(null)}
                required
                minLength={8}
                placeholder="••••••••"
                className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all duration-300"
                style={{
                  background: focusedInput === "password" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)",
                  border: focusedInput === "password" ? "2px solid rgba(201,168,76,0.5)" : "2px solid rgba(201,168,76,0.2)",
                  color: "#fff",
                  boxShadow: focusedInput === "password" ? "0 0 20px rgba(201,168,76,0.2), inset 0 1px 2px rgba(255,255,255,0.1)" : "inset 0 1px 2px rgba(255,255,255,0.05)",
                }}
              />
            </div>

            {error && (
              <div
                className="rounded-xl px-4 py-3 text-xs font-medium flex items-start gap-2 animate-pulse"
                style={{
                  background: "rgba(239,68,68,0.15)",
                  border: "1px solid rgba(239,68,68,0.4)",
                  color: "#FF6B6B",
                }}
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="flex-shrink-0 mt-0.5">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                  <path d="m11.354-3.354a.5.5 0 0 0-.708.708L7.5 7.793 4.354 4.646a.5.5 0 1 0-.708.708L6.793 8.5l-3.147 3.146a.5.5 0 0 0 .708.708L7.5 9.207l3.146 3.147a.5.5 0 0 0 .708-.708L8.207 8.5l3.147-3.146z" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2 group/btn"
              style={{
                background: "linear-gradient(135deg, #C9A84C 0%, #E8C870 100%)",
                color: "#0F0E1E",
                boxShadow: loading ? "0 0 0 rgba(201,168,76,0)" : "0 8px 30px rgba(201,168,76,0.4), inset 0 1px 0 rgba(255,255,255,0.4)",
                transform: loading ? "scale(0.98)" : "scale(1)",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.boxShadow = "0 12px 40px rgba(201,168,76,0.6), inset 0 1px 0 rgba(255,255,255,0.6)"
                  e.currentTarget.style.transform = "scale(1.02)"
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.boxShadow = "0 8px 30px rgba(201,168,76,0.4), inset 0 1px 0 rgba(255,255,255,0.4)"
                  e.currentTarget.style.transform = "scale(1)"
                }
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-current/30 border-t-current animate-spin" />
                  {mode === "sign-in" ? "Signing in..." : "Creating..."}
                </span>
              ) : mode === "sign-in" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-rgba(201,168,76,0.2) pt-4" style={{ borderColor: "rgba(201,168,76,0.2)" }}>
            <p className="text-xs" style={{ color: "rgba(201,168,76,0.6)" }}>
              {mode === "sign-in" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <a
                    href="/sign-up"
                    className="font-bold hover:text-opacity-100 transition-colors"
                    style={{ color: "#C9A84C" }}
                  >
                    Sign Up
                  </a>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <a
                    href="/sign-in"
                    className="font-bold hover:text-opacity-100 transition-colors"
                    style={{ color: "#C9A84C" }}
                  >
                    Sign In
                  </a>
                </>
              )}
            </p>
          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "rgba(201,168,76,0.4)" }}>
          Made in Egypt for the World
        </p>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }
        
        input::placeholder {
          color: rgba(201, 168, 76, 0.4);
        }
      `}</style>
    </div>
  )
}
