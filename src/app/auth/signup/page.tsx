"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, ShieldCheck, Mail, Lock, User, CheckCircle, AlertCircle, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";
import Input from "@/components/ui/Input";
import { validateEmail, validatePassword } from "@/utils/validation";

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
  const emailValidation = validateEmail(email);
  const passwordValidation = validatePassword(password);
  
  const isEmailValid = emailValidation.isValid;
  const isPasswordStrong = passwordValidation.isValid;
  const isConfirmPasswordValid = confirmPassword.length > 0 && confirmPassword === password;
  const isFullNameValid = fullName.trim().length >= 2;
  const isUsernameValid = username.trim().length >= 3 && /^[a-zA-Z0-9_]+$/.test(username.trim());

  const isFormValid = isFullNameValid && isUsernameValid && isEmailValid && isPasswordStrong && isConfirmPasswordValid;

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const getStrengthBarColor = (score: number) => {
    switch (score) {
      case 1: return "bg-rose-500";
      case 2: return "bg-amber-500";
      case 3: return "bg-blue-500";
      case 4: return "bg-emerald-500";
      default: return "bg-foreground/10";
    }
  };

  const getStrengthLabel = (score: number) => {
    switch (score) {
      case 1: return "Weak";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Strong & Secure";
      default: return "Enter password";
    }
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
      setErrorMsg(emailValidation.error || "Please enter a valid email address.");
      return;
    }

    if (!isPasswordStrong) {
      setErrorMsg(passwordValidation.error || "Password does not meet required strength criteria.");
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
      setErrorMsg(err.message || "An unexpected error occurred during sign-up.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden auth-page min-h-screen">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.06),transparent_65%)]" />
      
      <div className="w-full max-w-[480px] relative z-10 space-y-6">
        
        {/* VitalCore Branding & Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center justify-center gap-2.5 group hover:opacity-95 transition-opacity">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform">
              <Activity className="h-5 w-5" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-[var(--foreground)]">
              VitalCore
            </span>
          </Link>

          <div className="space-y-1">
            <h1 className="auth-subtitle tracking-tight text-center font-bold text-2xl text-[var(--foreground)]">
              Create Your Account
            </h1>
            <p className="auth-helper text-[13px] flex items-center gap-1.5 justify-center text-[var(--muted)]">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Verified Healthcare Authentication
            </p>
          </div>
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
            <Input
              name="fullName"
              data-testid="fullname-input"
              label="Full Name"
              icon={User}
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onBlur={() => handleBlur("fullName")}
              error={touched.fullName && !isFullNameValid ? "Please enter your full name (at least 2 characters)." : undefined}
              placeholder="John Doe"
            />

            {/* Username Field */}
            <Input
              name="username"
              data-testid="username-input"
              label="Username"
              icon={User}
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onBlur={() => handleBlur("username")}
              error={touched.username && !isUsernameValid ? "Username must be at least 3 alphanumeric characters or underscores." : undefined}
              placeholder="johndoe_health"
            />

            {/* Email Field */}
            <Input
              name="email"
              data-testid="signup-email-input"
              label="Email Address"
              icon={Mail}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur("email")}
              error={touched.email && !isEmailValid ? (emailValidation.error || "Please enter a valid email address.") : undefined}
              placeholder="user@domain.com"
            />

            {/* Password Field & Requirements Tracker */}
            <div className="space-y-2">
              <Input
                name="password"
                data-testid="signup-password-input"
                label="Password"
                icon={Lock}
                type="password"
                showPasswordToggle={true}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur("password")}
                placeholder="••••••••"
              />

              {/* Strength Meter Bar */}
              {password.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-foreground/70">
                    <span>Password Strength:</span>
                    <span className={passwordValidation.score >= 4 ? "text-emerald-400" : "text-amber-400"}>
                      {getStrengthLabel(passwordValidation.score)}
                    </span>
                  </div>

                  <div className="w-full bg-foreground/10 h-1.5 rounded-full overflow-hidden flex gap-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full flex-1 rounded-full transition-all duration-300 ${
                          step <= passwordValidation.score ? getStrengthBarColor(passwordValidation.score) : "bg-foreground/10"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Real-time Password Requirements Checklist */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px]">
                    <div className={`flex items-center gap-1 font-semibold ${passwordValidation.hasMinLength ? "text-emerald-400" : "text-foreground/45"}`}>
                      <CheckCircle className="h-3 w-3" /> Min 8 characters
                    </div>
                    <div className={`flex items-center gap-1 font-semibold ${passwordValidation.hasUpper ? "text-emerald-400" : "text-foreground/45"}`}>
                      <CheckCircle className="h-3 w-3" /> Uppercase letter (A-Z)
                    </div>
                    <div className={`flex items-center gap-1 font-semibold ${passwordValidation.hasLower ? "text-emerald-400" : "text-foreground/45"}`}>
                      <CheckCircle className="h-3 w-3" /> Lowercase letter (a-z)
                    </div>
                    <div className={`flex items-center gap-1 font-semibold ${passwordValidation.hasNumber ? "text-emerald-400" : "text-foreground/45"}`}>
                      <CheckCircle className="h-3 w-3" /> Number (0-9)
                    </div>
                    <div className={`flex items-center gap-1 font-semibold ${passwordValidation.hasSpecial ? "text-emerald-400" : "text-foreground/45"} col-span-2`}>
                      <CheckCircle className="h-3 w-3" /> Special character (!@#$%^&*)
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <Input
              name="confirmPassword"
              data-testid="confirm-password-input"
              label="Confirm Password"
              icon={Lock}
              type="password"
              showPasswordToggle={true}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => handleBlur("confirmPassword")}
              error={touched.confirmPassword && !isConfirmPasswordValid ? "Passwords do not match." : undefined}
              placeholder="••••••••"
            />

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
            <Link href="/login" className="font-semibold text-primary hover:underline font-bold">
              Log In
            </Link>
          </div>

        </GlassCard>

      </div>
    </div>
  );
}
