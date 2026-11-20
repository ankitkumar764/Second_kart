"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // 1. Full Name Validation
    if (!name.trim() || name.trim().length < 2) {
      setError("Please enter your full name (minimum 2 characters).");
      return;
    }

    if (name.trim().length > 50) {
      setError("Full name cannot exceed 50 characters.");
      return;
    }

    // 2. Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    // 3. Password Validation
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    // 4. Confirm Password Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify both passwords.");
      return;
    }

    setLoading(true);
    const result = await signup({
      name: name.trim(),
      email: email.trim(),
      password,
      confirmPassword,
    });
    setLoading(false);

    if (result.success) {
      setSuccess("Account created successfully! Welcome to SecondCart.");
      setTimeout(() => {
        router.push(callbackUrl);
        router.refresh();
      }, 1200);
    } else {
      setError(result.message || "Failed to create account. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-md bg-white border border-[#E5E5E5] rounded-xl p-6 sm:p-8 shadow-xs">
      {/* Brand & Heading */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-block mb-3">
          <span className="text-2xl font-bold tracking-tight text-[#171717]">
            SecondCart
          </span>
        </Link>
        <h1 className="text-xl font-bold text-[#171717]">Create an account</h1>
        <p className="text-xs text-[#777777] mt-1">
          Join your campus marketplace to buy, sell, and reuse student essentials.
        </p>
      </div>

      {/* Success Feedback Banner */}
      {success && (
        <div
          role="status"
          className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-md flex items-start gap-2.5"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
          <div className="flex-1">
            <p className="font-semibold">{success}</p>
            <p className="text-[11px] text-emerald-700 mt-0.5">Redirecting you to marketplace...</p>
          </div>
        </div>
      )}

      {/* Error Feedback Banner */}
      {error && (
        <div
          role="alert"
          className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md flex items-start gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-4 h-4 shrink-0 mt-0.5"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
          </svg>
          <span className="flex-1">{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label
            htmlFor="signup-name"
            className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1.5"
          >
            Full Name
          </label>
          <input
            id="signup-name"
            type="text"
            required
            disabled={loading || Boolean(success)}
            autoComplete="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Aarav Sharma"
            className="w-full bg-white border border-[#E5E5E5] rounded-md px-3.5 py-2.5 text-sm text-[#171717] placeholder:text-[#777777] focus:outline-hidden focus:border-[#171717] transition-colors disabled:opacity-60"
          />
        </div>

        {/* College Email */}
        <div>
          <label
            htmlFor="signup-email"
            className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1.5"
          >
            Email Address
          </label>
          <input
            id="signup-email"
            type="email"
            required
            disabled={loading || Boolean(success)}
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            placeholder="student@college.edu"
            className="w-full bg-white border border-[#E5E5E5] rounded-md px-3.5 py-2.5 text-sm text-[#171717] placeholder:text-[#777777] focus:outline-hidden focus:border-[#171717] transition-colors disabled:opacity-60"
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="signup-password"
            className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1.5"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              required
              disabled={loading || Boolean(success)}
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              placeholder="At least 6 characters"
              className="w-full bg-white border border-[#E5E5E5] rounded-md pl-3.5 pr-10 py-2.5 text-sm text-[#171717] placeholder:text-[#777777] focus:outline-hidden focus:border-[#171717] transition-colors disabled:opacity-60"
            />
            <button
              type="button"
              disabled={loading || Boolean(success)}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#777777] hover:text-[#171717] transition-colors cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-4 h-4"
                >
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                  <line x1="2" x2="22" y1="2" y2="22" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-4 h-4"
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-[11px] text-[#777777] mt-1">Must be at least 6 characters.</p>
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="signup-confirm-password"
            className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1.5"
          >
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="signup-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              required
              disabled={loading || Boolean(success)}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Re-enter your password"
              className="w-full bg-white border border-[#E5E5E5] rounded-md pl-3.5 pr-10 py-2.5 text-sm text-[#171717] placeholder:text-[#777777] focus:outline-hidden focus:border-[#171717] transition-colors disabled:opacity-60"
            />
            <button
              type="button"
              disabled={loading || Boolean(success)}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#777777] hover:text-[#171717] transition-colors cursor-pointer"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-4 h-4"
                >
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                  <line x1="2" x2="22" y1="2" y2="22" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-4 h-4"
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          {confirmPassword && password !== confirmPassword && (
            <p className="text-[11px] text-red-600 mt-1">Passwords do not match.</p>
          )}
        </div>

        {/* Submit CTA */}
        <button
          type="submit"
          disabled={loading || Boolean(success)}
          className="w-full mt-2 py-2.5 px-4 bg-[#171717] hover:bg-black text-white text-sm font-semibold rounded-md transition-colors disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading && (
            <svg
              className="animate-spin h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          )}
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      {/* Switch to Login Link */}
      <div className="mt-6 pt-6 border-t border-[#E5E5E5] text-center">
        <p className="text-xs text-[#777777]">
          Already have an account?{" "}
          <Link
            href={`/login${callbackUrl !== "/" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
            className="font-semibold text-[#171717] hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-xs text-[#777777]">Loading...</div>}>
        <SignupForm />
      </Suspense>
    </main>
  );
}
