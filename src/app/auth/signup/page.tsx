"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, ShieldCheck, Mail, Lock, User, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";

// Strict RFC 5322 compliant email regex
const RFC_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export default function SignupPage() {
  const { signUp } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Real-time Validation Checks
  const isEmailValid = RFC_EMAIL_REGEX.test(email.trim());
  const isPasswordLongEnough = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const isPasswordStrong = isPasswordLongEnough && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
  const isConfirmPasswordValid = confirmPassword.length > 0 && confirmPassword === password;
  const isFullNameValid = fullName.trim().length >= 2;
  const isUsernameValid = username.trim().length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);

  const isFormValid = isFullNameValid && isUsernameValid && isEmailValid && isPasswordStrong && isConfirmPasswordValid;

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      fullName: true,
      username: true,
      email: true,
      password: true,
      confirmPassword: true
    });

    if (!isEmailValid) {
      setErrorMsg("Please enter a valid RFC-compliant email address (e.g. user@example.com).");
      return;
    }

    if (!isPasswordStrong) {
      setErrorMsg("Password does not meet required strength criteria.");
      return;
    }

    if (!isConfirmPasswordValid) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (!isFormValid) {
      setErrorMsg("Please correct all form errors before submitting.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const { error } = await signUp(email.trim(), password, fullName.trim(), username.trim());
      if (error) {
        setErrorMsg(error.message);
      } else {
        router.push("/auth/onboarding");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred during secure sign-up.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-background px-4 py-16 relative overflow-hidden auth-page">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.05),transparent_60%)]" />
      
      <div className="w-full max-w-[480px] relative z-10 space-y-6">
        
        {/* Logo Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
            <Activity className="h-5 w-5" />
          </Link>
          <h2 className="auth-subtitle tracking-tight text-center font-bold">Create Your Account</h2>
          <p className="auth-helper text-[12px] flex items-center gap-1 justify-center">
            <ShieldCheck className="h-4 w-4 text-secondary/80" />
            Verified Supabase Healthcare Authentication
          </p>
        </div>

        <GlassCard glowColor="violet" className="border border-foreground/10 shadow-xl p-6">
          
          {errorMsg && (
            <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-[13px] text-rose-400 font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4" noValidate>
            
            {/* Full Name Field */}
            <div className="space-y-1.5">
              <label className="auth-label text-xs font-bold text-foreground/80">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onBlur={() => handleBlur("fullName")}
                  className={`w-full text-xs pl-11 pr-4 py-3 rounded-xl border bg-foreground/5 text-foreground focus:outline-none transition-colors ${
                    touched.fullName && !isFullNameValid
                      ? "border-rose-500/50 focus:border-rose-500"
                      : "border-foreground/10 focus:border-primary"
                  }`}
                  placeholder="John Doe"
                />
              </div>
              {touched.fullName && !isFullNameValid && (
                <p className="text-[11px] text-rose-400 font-medium">Please enter your full name (at least 2 characters).</p>
              )}
            </div>

            {/* Username Field */}
            <div className="space-y-1.5">
              <label className="auth-label text-xs font-bold text-foreground/80">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onBlur={() => handleBlur("username")}
                  className={`w-full text-xs pl-11 pr-4 py-3 rounded-xl border bg-foreground/5 text-foreground focus:outline-none transition-colors ${
                    touched.username && !isUsernameValid
                      ? "border-rose-500/50 focus:border-rose-500"
                      : "border-foreground/10 focus:border-primary"
                  }`}
                  placeholder="johndoe_health"
                />
              </div>
              {touched.username && !isUsernameValid && (
                <p className="text-[11px] text-rose-400 font-medium">Username must be at least 3 alphanumeric characters/underscores.</p>
              )}
            </div>

            {/* RFC Email Field */}
            <div className="space-y-1.5">
              <label className="auth-label text-xs font-bold text-foreground/80">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur("email")}
                  className={`w-full text-xs pl-11 pr-4 py-3 rounded-xl border bg-foreground/5 text-foreground focus:outline-none transition-colors ${
                    touched.email && !isEmailValid
                      ? "border-rose-500/50 focus:border-rose-500"
                      : "border-foreground/10 focus:border-primary"
                  }`}
                  placeholder="name@domain.com"
                />
              </div>
              {touched.email && !isEmailValid && (
                <p className="text-[11px] text-rose-400 font-medium">Invalid email format. Enter a valid email (e.g. user@domain.com).</p>
              )}
            </div>

            {/* Password Field & Requirements Tracker */}
            <div className="space-y-1.5">
              <label className="auth-label text-xs font-bold text-foreground/80">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => handleBlur("password")}
                  className={`w-full text-xs pl-11 pr-4 py-3 rounded-xl border bg-foreground/5 text-foreground focus:outline-none transition-colors ${
                    touched.password && !isPasswordStrong
                      ? "border-rose-500/50 focus:border-rose-500"
                      : "border-foreground/10 focus:border-primary"
                  }`}
                  placeholder="••••••••"
                />
              </div>

              {/* Real-time Password Checklist */}
              {password.length > 0 && (
                <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px]">
                  <div className={`flex items-center gap-1 font-semibold ${isPasswordLongEnough ? "text-emerald-400" : "text-foreground/45"}`}>
                    <CheckCircle className="h-3 w-3" /> Min 8 characters
                  </div>
                  <div className={`flex items-center gap-1 font-semibold ${hasUppercase ? "text-emerald-400" : "text-foreground/45"}`}>
                    <CheckCircle className="h-3 w-3" /> Uppercase letter
                  </div>
                  <div className={`flex items-center gap-1 font-semibold ${hasLowercase ? "text-emerald-400" : "text-foreground/45"}`}>
                    <CheckCircle className="h-3 w-3" /> Lowercase letter
                  </div>
                  <div className={`flex items-center gap-1 font-semibold ${hasNumber ? "text-emerald-400" : "text-foreground/45"}`}>
                    <CheckCircle className="h-3 w-3" /> Number (0-9)
                  </div>
                  <div className={`flex items-center gap-1 font-semibold ${hasSpecialChar ? "text-emerald-400" : "text-foreground/45"} col-span-2`}>
                    <CheckCircle className="h-3 w-3" /> Special character (!@#$%^&*)
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <label className="auth-label text-xs font-bold text-foreground/80">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => handleBlur("confirmPassword")}
                  className={`w-full text-xs pl-11 pr-4 py-3 rounded-xl border bg-foreground/5 text-foreground focus:outline-none transition-colors ${
                    touched.confirmPassword && !isConfirmPasswordValid
                      ? "border-rose-500/50 focus:border-rose-500"
                      : "border-foreground/10 focus:border-primary"
                  }`}
                  placeholder="••••••••"
                />
              </div>
              {touched.confirmPassword && !isConfirmPasswordValid && (
                <p className="text-[11px] text-rose-400 font-medium">Passwords do not match.</p>
              )}
            </div>

            <Button
              variant="primary"
              type="submit"
              isLoading={loading}
              disabled={!isFormValid || loading}
              className="w-full mt-3 font-bold text-xs py-3.5 shadow-lg shadow-primary/25 disabled:opacity-50"
            >
              Create Verified Account
            </Button>

          </form>

          <div className="mt-5 border-t border-foreground/5 pt-4 text-center text-xs text-foreground/60 font-medium">
            Already registered?{" "}
            <Link href="/auth/login" className="font-semibold text-primary hover:underline">
              Log In
            </Link>
          </div>

        </GlassCard>

      </div>
    </div>
  );
}
