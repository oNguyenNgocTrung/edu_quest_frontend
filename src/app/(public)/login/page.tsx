"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const login = useAuthStore((s) => s.login);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      router.push("/onboarding");
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 px-4 py-4 flex items-center border-b border-gray-100 bg-white z-10">
        <Link
          href="/"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 mr-3"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </Link>
        <h2 className="text-xl font-bold text-gray-800">Welcome Back</h2>
      </div>

      {/* Mobile Content */}
      <div className="lg:hidden w-full px-4 pt-20 pb-8 overflow-y-auto">
        {/* Small Mascot with Speech Bubble */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="flex flex-col items-center mb-8"
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4 px-4 py-2 bg-purple-50 border-2 border-purple-200 rounded-full"
          >
            <p className="text-xs font-semibold text-purple-600 text-center">
              Parent Account Login
            </p>
          </motion.div>

          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute -top-14 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
            >
              <div className="bg-white rounded-2xl px-4 py-2 shadow-lg border-2 border-purple-600">
                <p className="text-sm font-semibold text-purple-600">
                  Welcome back, Parent!
                </p>
              </div>
              <div
                className="absolute left-1/2 transform -translate-x-1/2 -bottom-2"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "8px solid transparent",
                  borderRight: "8px solid transparent",
                  borderTop: "8px solid #7C3AED",
                }}
              />
            </motion.div>

            <svg width="80" height="80" viewBox="0 0 100 100">
              <ellipse cx="50" cy="55" rx="32" ry="35" fill="#7C3AED" />
              <ellipse cx="50" cy="62" rx="22" ry="25" fill="#C4B5FD" />
              <ellipse cx="22" cy="55" rx="12" ry="20" fill="#6D28D9" />
              <ellipse cx="78" cy="55" rx="12" ry="20" fill="#6D28D9" />
              <circle cx="40" cy="45" r="14" fill="white" />
              <circle cx="60" cy="45" r="14" fill="white" />
              <circle cx="40" cy="45" r="6" fill="#1F2937" />
              <circle cx="60" cy="45" r="6" fill="#1F2937" />
              <circle cx="42" cy="43" r="2.5" fill="white" />
              <circle cx="62" cy="43" r="2.5" fill="white" />
              <path d="M 50 50 L 45 57 L 55 57 Z" fill="#FB923C" />
              <ellipse cx="42" cy="88" rx="6" ry="4" fill="#FB923C" />
              <ellipse cx="58" cy="88" rx="6" ry="4" fill="#FB923C" />
            </svg>
          </div>
        </motion.div>

        {/* Info Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <span className="text-xl">ℹ️</span>
            <div>
              <p className="text-sm font-semibold text-blue-800 mb-1">
                Parent Login Only
              </p>
              <p className="text-xs text-blue-500 leading-relaxed">
                Children access the app by selecting their profile. This login
                is for parents to manage content and view progress.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Mobile Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
          onSubmit={handleSubmit}
        >
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full h-12 px-4 border-2 border-gray-200 rounded-2xl text-base text-gray-800 bg-white outline-none focus:border-purple-600 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full h-12 px-4 pr-12 border-2 border-gray-200 rounded-2xl text-base text-gray-800 bg-white outline-none focus:border-purple-600 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-red-50 border border-red-400"
            >
              <p className="text-sm text-red-500">{error}</p>
            </motion.div>
          )}

          <div className="pt-2">
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={loading ? {} : { scale: 1.02 }}
              whileTap={loading ? {} : { scale: 0.98 }}
              className="relative overflow-hidden w-full h-14 rounded-3xl font-semibold text-base text-white flex items-center justify-center cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                background: loading
                  ? "#9CA3AF"
                  : "linear-gradient(135deg, #7C3AED, #6D28D9)",
                boxShadow: loading
                  ? "none"
                  : "0 4px 12px rgba(124, 58, 237, 0.3)",
              }}
            >
              {!loading && (
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)",
                  }}
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 2,
                    ease: "easeInOut",
                  }}
                />
              )}
              <span className="relative z-10">
                {loading ? "Signing in..." : "Log In"}
              </span>
            </motion.button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 py-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-400">or continue with</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Social Buttons */}
          <div className="flex items-center justify-center gap-3">
            {["Google", "Apple", "Facebook"].map((provider) => (
              <motion.button
                key={provider}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-12 h-12 rounded-xl border-2 border-gray-200 bg-white flex items-center justify-center"
              >
                <span className="text-xl">
                  {provider === "Google"
                    ? "🔍"
                    : provider === "Apple"
                      ? "🍎"
                      : "👤"}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Create Account Link */}
          <div className="text-center pt-4">
            <Link
              href="/register"
              className="text-sm text-purple-600 underline"
            >
              New to EduQuest? Create Account
            </Link>
          </div>
        </motion.form>
      </div>

      {/* Desktop Left Panel - Purple Brand Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 to-purple-900 relative overflow-hidden items-center justify-center">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="20" cy="20" r="2" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Floating Decorative Elements */}
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-16 text-white opacity-15"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
          </svg>
        </motion.div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
          className="absolute bottom-24 left-20 text-white opacity-20"
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        </motion.div>

        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-16 left-1/4 text-white opacity-10"
        >
          <span className="text-4xl">+</span>
        </motion.div>

        <motion.div
          animate={{ rotate: [0, -360] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-32 right-1/4 text-white opacity-10"
        >
          <span className="text-4xl">&times;</span>
        </motion.div>

        <div className="relative z-10 text-center px-12 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="inline-flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <span
                className="text-3xl font-black text-white"
                style={{ textShadow: "0 2px 10px rgba(0,0,0,0.2)" }}
              >
                EduQuest
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: [0, -8, 0],
            }}
            transition={{
              opacity: { delay: 0.2 },
              scale: { delay: 0.2 },
              y: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              },
            }}
            className="mb-12 relative"
          >
            <div className="absolute inset-0 bg-white rounded-full opacity-20 blur-3xl scale-110" />
            <svg
              width="180"
              height="180"
              viewBox="0 0 100 100"
              className="relative z-10"
            >
              <ellipse
                cx="50"
                cy="55"
                rx="32"
                ry="35"
                fill="white"
                opacity="0.95"
              />
              <ellipse
                cx="50"
                cy="62"
                rx="22"
                ry="25"
                fill="white"
                opacity="0.8"
              />
              <motion.ellipse
                cx="22"
                cy="55"
                rx="12"
                ry="20"
                fill="white"
                opacity={0.85}
                animate={{ rotate: [0, -15, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{ transformOrigin: "22px 55px" }}
              />
              <ellipse
                cx="78"
                cy="55"
                rx="12"
                ry="20"
                fill="white"
                opacity={0.85}
              />
              <circle cx="40" cy="45" r="14" fill="white" />
              <circle cx="60" cy="45" r="14" fill="white" />
              <circle cx="40" cy="45" r="6" fill="#7C3AED" />
              <circle cx="60" cy="45" r="6" fill="#7C3AED" />
              <circle cx="42" cy="43" r="2.5" fill="white" />
              <circle cx="62" cy="43" r="2.5" fill="white" />
              <path d="M 50 50 L 45 57 L 55 57 Z" fill="#FB923C" />
              <ellipse cx="42" cy="88" rx="6" ry="4" fill="#FB923C" />
              <ellipse cx="58" cy="88" rx="6" ry="4" fill="#FB923C" />
            </svg>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-black text-white mb-4"
            style={{ textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}
          >
            Welcome Back!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-white/85"
            style={{ textShadow: "0 1px 5px rgba(0,0,0,0.2)" }}
          >
            Manage your child&apos;s learning journey
          </motion.p>
        </div>
      </div>

      {/* Desktop Right Panel - Form Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-50 items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          {/* Back Button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/"
              className="mb-6 w-11 h-11 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </Link>
          </motion.div>

          {/* Form Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-black text-gray-800 mb-2">
              Parent Login
            </h2>
            <p className="text-sm text-gray-600">Access your dashboard</p>
          </div>

          {/* Info Banner */}
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-xl">ℹ️</span>
              <div>
                <p className="text-sm font-semibold text-blue-800 mb-1">
                  Parent Login Only
                </p>
                <p className="text-xs text-blue-500 leading-relaxed">
                  Children access the app by selecting their profile.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-12 px-4 border-2 border-gray-200 rounded-2xl text-base text-gray-800 bg-white outline-none focus:border-purple-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full h-12 px-4 pr-12 border-2 border-gray-200 rounded-2xl text-base text-gray-800 bg-white outline-none focus:border-purple-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-red-50 border border-red-400"
              >
                <p className="text-sm text-red-500">{error}</p>
              </motion.div>
            )}

            <div className="pt-2">
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={loading ? {} : { scale: 1.02 }}
                whileTap={loading ? {} : { scale: 0.98 }}
                className="relative overflow-hidden w-full h-14 rounded-3xl font-semibold text-base text-white flex items-center justify-center cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  background: loading
                    ? "#9CA3AF"
                    : "linear-gradient(135deg, #7C3AED, #6D28D9)",
                  boxShadow: loading
                    ? "none"
                    : "0 4px 12px rgba(124, 58, 237, 0.3)",
                }}
              >
                {!loading && (
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)",
                    }}
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 2,
                      ease: "easeInOut",
                    }}
                  />
                )}
                <span className="relative z-10">
                  {loading ? "Signing in..." : "Log In"}
                </span>
              </motion.button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 py-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-sm text-gray-400">or continue with</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Social Buttons */}
            <div className="flex items-center justify-center gap-3">
              {["Google", "Apple", "Facebook"].map((provider) => (
                <motion.button
                  key={provider}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-12 h-12 rounded-xl border-2 border-gray-200 bg-white flex items-center justify-center"
                >
                  <span className="text-xl">
                    {provider === "Google"
                      ? "🔍"
                      : provider === "Apple"
                        ? "🍎"
                        : "👤"}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Create Account Link */}
            <div className="text-center pt-4">
              <Link
                href="/register"
                className="text-sm text-purple-600 underline"
              >
                New to EduQuest? Create Account
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
