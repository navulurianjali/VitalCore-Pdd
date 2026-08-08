"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  User, Lock, LogOut, Trash2, Sun, Moon, Monitor,
  Smartphone, Brain, Bell, Shield, ChevronRight,
  CheckCircle, AlertCircle, RefreshCw, Eye, EyeOff,
  Zap, Heart, Users
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";

// ── Settings Row ──────────────────────────────────────────────────────────────
function SettingsRow({
  id,
  icon: Icon,
  label,
  description,
  rightContent,
  onClick,
  danger = false,
}: {
  id?: string;
  icon?: React.ElementType;
  label: string;
  description?: string;
  rightContent?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}) {
  const base = "flex items-center gap-3 px-4 py-3.5 transition-colors";
  const interactive = onClick ? "cursor-pointer hover:bg-foreground/[0.03] active:bg-foreground/5" : "";
  const dangerCls = danger ? "text-rose-500" : "text-foreground";

  return (
    <div id={id} className={`${base} ${interactive}`} onClick={onClick} role={onClick ? "button" : undefined}>
      {Icon && (
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${danger ? "bg-rose-500/10" : "bg-foreground/[0.06]"}`}>
          <Icon className={`h-4 w-4 ${danger ? "text-rose-500" : "text-foreground/70"}`} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium ${dangerCls} leading-tight`}>{label}</div>
        {description && <div className="text-xs text-foreground/45 mt-0.5 font-normal">{description}</div>}
      </div>
      {rightContent && <div className="shrink-0">{rightContent}</div>}
      {onClick && !rightContent && <ChevronRight className="h-4 w-4 text-foreground/30 shrink-0" />}
    </div>
  );
}

// ── Section card ─────────────────────────────────────────────────────────────
function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="px-1 mb-1.5">
        <span className="text-[11px] font-bold uppercase tracking-widest text-foreground/40">{title}</span>
      </div>
      <div className="rounded-2xl border border-foreground/8 bg-[var(--card-bg)] overflow-hidden divide-y divide-foreground/[0.06]">
        {children}
      </div>
    </div>
  );
}

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ id, checked, onChange }: { id: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5.5 rounded-full transition-colors cursor-pointer shrink-0 ${checked ? "bg-primary" : "bg-foreground/20"}`}
      style={{ height: "22px", width: "40px" }}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? "translate-x-[18px]" : "translate-x-0"}`}
      />
    </button>
  );
}

// ── Mode Chip ─────────────────────────────────────────────────────────────────
function ModeChip({
  id,
  label,
  description,
  icon: Icon,
  active,
  onClick,
}: {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      id={id}
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-1.5 p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
        active
          ? "border-primary bg-primary/8 text-primary"
          : "border-foreground/10 text-foreground/60 hover:border-foreground/20 hover:text-foreground/80 hover:bg-foreground/[0.03]"
      }`}
    >
      <Icon className={`h-5 w-5 ${active ? "text-primary" : "text-foreground/50"}`} />
      <span className={`text-xs font-bold ${active ? "text-primary" : "text-foreground/70"}`}>{label}</span>
      <span className="text-[10px] text-foreground/40 leading-snug font-normal">{description}</span>
    </button>
  );
}

// ── Theme Chip ────────────────────────────────────────────────────────────────
function ThemeChip({
  id,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  id: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      id={id}
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-center transition-all cursor-pointer ${
        active
          ? "border-primary bg-primary/8"
          : "border-foreground/10 hover:border-foreground/20 hover:bg-foreground/[0.03]"
      }`}
    >
      <Icon className={`h-4.5 w-4.5 ${active ? "text-primary" : "text-foreground/50"}`} />
      <span className={`text-xs font-semibold ${active ? "text-primary" : "text-foreground/60"}`}>{label}</span>
    </button>
  );
}

export default function SettingsPage() {
  const { profile, updateProfile, signOut } = useAuth();
  const { theme, toggleTheme, activeMode, setActiveMode } = useTheme();
  const router = useRouter();

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // AI Preferences
  const [aiCoachStyle, setAiCoachStyle] = useState(profile?.ai_coach_style || "supportive");
  const [unitSystem, setUnitSystem] = useState(profile?.unit_system || "Metric");
  const [aiSaving, setAiSaving] = useState(false);
  const [aiSaved, setAiSaved] = useState(false);

  // Notifications — stored as JSON in reminder_preferences
  const [notifications, setNotifications] = useState({
    meal: true,
    hydration: true,
    workout: true,
    sleep: true,
  });
  const [notifSaving, setNotifSaving] = useState(false);

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState("");

  // Load saved notification prefs
  useEffect(() => {
    if (profile?.reminder_preferences) {
      try {
        const parsed = JSON.parse(profile.reminder_preferences);
        if (typeof parsed === "object") {
          setNotifications(prev => ({ ...prev, ...parsed }));
        }
      } catch {
        // legacy text value — ignore, keep defaults
      }
    }
    if (profile?.ai_coach_style) setAiCoachStyle(profile.ai_coach_style);
    if (profile?.unit_system) setUnitSystem(profile.unit_system);
  }, [profile]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/login");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    if (newPassword !== confirmPassword) {
      setPwMessage({ type: "error", text: "Passwords do not match." });
      return;
    }
    if (newPassword.length < 8) {
      setPwMessage({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }
    setPwSaving(true);
    setPwMessage(null);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPwMessage({ type: "success", text: "Password updated successfully." });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      setTimeout(() => { setPwMessage(null); setShowPasswordForm(false); }, 3000);
    } catch (err: any) {
      setPwMessage({ type: "error", text: err.message || "Failed to update password." });
    } finally {
      setPwSaving(false);
    }
  };

  const handleSaveAI = async () => {
    setAiSaving(true);
    try {
      await updateProfile({ ai_coach_style: aiCoachStyle, unit_system: unitSystem } as any);
      setAiSaved(true);
      setTimeout(() => setAiSaved(false), 2500);
    } finally {
      setAiSaving(false);
    }
  };

  const handleToggleNotification = async (key: keyof typeof notifications, value: boolean) => {
    const updated = { ...notifications, [key]: value };
    setNotifications(updated);
    setNotifSaving(true);
    try {
      await updateProfile({ reminder_preferences: JSON.stringify(updated) } as any);
    } finally {
      setNotifSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    // Client-side sign out — actual deletion requires a backend service-role endpoint
    if (deleteText !== "DELETE") return;
    await signOut();
    router.push("/auth/login");
  };

  // ── Theme state (system default detection) ────────────────────────────────
  const [systemPrefersDark, setSystemPrefersDark] = useState(false);
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">(
    () => (typeof window !== "undefined" ? (localStorage.getItem("vitalcore-theme-mode") as any) || "system" : "system")
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemPrefersDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const applyThemeMode = useCallback((mode: "light" | "dark" | "system") => {
    setThemeMode(mode);
    if (typeof window !== "undefined") localStorage.setItem("vitalcore-theme-mode", mode);
    const resolved = mode === "system" ? (systemPrefersDark ? "dark" : "light") : mode;
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolved);
    localStorage.setItem("vitalcore-theme", resolved);
  }, [systemPrefersDark]);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl mx-auto pb-12">

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="text-xs text-foreground/45 mt-0.5">Manage how VitalCore looks and behaves</p>
        </div>

        {/* ── ACCOUNT ──────────────────────────────────────────────────────── */}
        <SettingsSection title="Account">
          <SettingsRow
            id="settings-account-info"
            icon={User}
            label={profile?.full_name || "Your Account"}
            description={profile?.email || "Manage your profile information"}
            rightContent={
              <button
                onClick={() => router.push("/profile")}
                className="text-[11px] font-semibold text-primary hover:text-primary/80 cursor-pointer transition-colors"
              >
                Edit Profile
              </button>
            }
          />
          <SettingsRow
            id="settings-change-password"
            icon={Lock}
            label="Change Password"
            description="Update your account password"
            onClick={() => setShowPasswordForm(!showPasswordForm)}
          />

          {/* Password form (inline expansion) */}
          {showPasswordForm && (
            <div className="px-4 pb-4 pt-1 bg-foreground/[0.02]">
              <form onSubmit={handleChangePassword} className="space-y-3">
                {pwMessage && (
                  <div className={`flex items-center gap-1.5 text-xs font-semibold p-2.5 rounded-lg ${
                    pwMessage.type === "success"
                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                  }`}>
                    {pwMessage.type === "success" ? <CheckCircle className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                    {pwMessage.text}
                  </div>
                )}
                <div className="relative">
                  <input
                    id="settings-new-password"
                    type={showPw ? "text" : "password"}
                    placeholder="New password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    className="w-full text-xs px-3 py-2.5 pr-9 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground placeholder-foreground/35 focus:outline-none focus:border-primary/40"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/70 cursor-pointer">
                    {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <input
                  id="settings-confirm-password"
                  type={showPw ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground placeholder-foreground/35 focus:outline-none focus:border-primary/40"
                />
                <div className="flex gap-2">
                  <button type="button" onClick={() => { setShowPasswordForm(false); setPwMessage(null); }}
                    className="flex-1 text-xs font-semibold py-2 rounded-xl border border-foreground/15 text-foreground/60 hover:bg-foreground/5 cursor-pointer transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={pwSaving}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-xl bg-primary text-white hover:bg-primary/90 cursor-pointer transition-colors disabled:opacity-60">
                    {pwSaving ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving…</> : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          )}

          <SettingsRow
            id="settings-logout"
            icon={LogOut}
            label="Sign Out"
            description="Sign out of your VitalCore account"
            onClick={handleSignOut}
          />
        </SettingsSection>

        {/* ── APPEARANCE ───────────────────────────────────────────────────── */}
        <SettingsSection title="Appearance">
          <div className="px-4 py-4">
            <div className="text-xs font-semibold text-foreground/60 mb-3">Theme</div>
            <div className="flex gap-2">
              <ThemeChip id="settings-theme-light" label="Light" icon={Sun} active={themeMode === "light"} onClick={() => applyThemeMode("light")} />
              <ThemeChip id="settings-theme-dark" label="Dark" icon={Moon} active={themeMode === "dark"} onClick={() => applyThemeMode("dark")} />
              <ThemeChip id="settings-theme-system" label="System" icon={Monitor} active={themeMode === "system"} onClick={() => applyThemeMode("system")} />
            </div>
          </div>
        </SettingsSection>

        {/* ── APP EXPERIENCE ────────────────────────────────────────────────── */}
        <SettingsSection title="App Experience">
          <div className="px-4 py-4">
            <div className="text-xs font-semibold text-foreground/60 mb-1">Mode</div>
            <p className="text-[11px] text-foreground/40 mb-3">
              Adjusts your coaching style, pacing, and UI complexity.
            </p>
            <div className="flex gap-2">
              <ModeChip
                id="settings-mode-wellness"
                label="Wellness"
                description="Balanced everyday health"
                icon={Heart}
                active={activeMode === "wellness"}
                onClick={() => setActiveMode("wellness")}
              />
              <ModeChip
                id="settings-mode-performance"
                label="Performance"
                description="Optimised for athletes"
                icon={Zap}
                active={activeMode === "performance"}
                onClick={() => setActiveMode("performance")}
              />
              <ModeChip
                id="settings-mode-elderly"
                label="Elderly"
                description="Larger text, gentle pace"
                icon={Users}
                active={activeMode === "elderly"}
                onClick={() => setActiveMode("elderly")}
              />
            </div>
          </div>
        </SettingsSection>

        {/* ── AI PREFERENCES ────────────────────────────────────────────────── */}
        <SettingsSection title="AI Preferences">
          <div className="px-4 py-4 space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground/60 mb-1.5 block">AI Coach Style</label>
              <select
                id="settings-ai-coach-style"
                value={aiCoachStyle}
                onChange={e => setAiCoachStyle(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-foreground/10 bg-background text-foreground focus:outline-none focus:border-primary/40"
              >
                <option value="supportive">Supportive & Encouraging</option>
                <option value="clinical">Clinical & Precise</option>
                <option value="motivational">High Energy & Motivational</option>
                <option value="gentle">Gentle & Mindful</option>
                <option value="direct">Direct & No-Nonsense</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground/60 mb-1.5 block">Unit System</label>
              <div className="flex gap-2">
                {["Metric", "Imperial"].map(u => (
                  <button
                    key={u}
                    id={`settings-unit-${u.toLowerCase()}`}
                    onClick={() => setUnitSystem(u)}
                    className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      unitSystem === u
                        ? "bg-primary/8 border-primary text-primary"
                        : "border-foreground/10 text-foreground/60 hover:border-foreground/20"
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <button
                id="settings-ai-save"
                onClick={handleSaveAI}
                disabled={aiSaving}
                className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 shadow-sm transition-all cursor-pointer disabled:opacity-60"
              >
                {aiSaving
                  ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving…</>
                  : aiSaved
                    ? <><CheckCircle className="h-3.5 w-3.5" /> Saved</>
                    : "Save Preferences"
                }
              </button>
            </div>
          </div>
        </SettingsSection>

        {/* ── NOTIFICATIONS ─────────────────────────────────────────────────── */}
        <SettingsSection title="Notifications">
          {([
            { key: "meal" as const, label: "Meal Reminders", description: "Reminders to log your meals" },
            { key: "hydration" as const, label: "Hydration Reminders", description: "Drink water alerts throughout the day" },
            { key: "workout" as const, label: "Workout Reminders", description: "Prompts for scheduled workouts" },
            { key: "sleep" as const, label: "Sleep Reminders", description: "Wind-down and bedtime alerts" },
          ]).map(({ key, label, description }) => (
            <SettingsRow
              key={key}
              id={`settings-notif-${key}`}
              icon={Bell}
              label={label}
              description={description}
              rightContent={
                <Toggle
                  id={`toggle-notif-${key}`}
                  checked={notifications[key]}
                  onChange={v => handleToggleNotification(key, v)}
                />
              }
            />
          ))}
        </SettingsSection>

        {/* ── PRIVACY & DATA ────────────────────────────────────────────────── */}
        <SettingsSection title="Privacy & Data">
          <SettingsRow
            id="settings-privacy-info"
            icon={Shield}
            label="Privacy"
            description="Your data is encrypted and never sold to third parties"
            rightContent={<span className="text-[11px] text-foreground/40 font-medium">HIPAA-aligned</span>}
          />
          <SettingsRow
            id="settings-delete-account"
            icon={Trash2}
            label="Delete Account"
            description="Permanently remove your account and all data"
            danger
            onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
          />

          {/* Delete account confirmation inline */}
          {showDeleteConfirm && (
            <div className="px-4 pb-4 pt-1 bg-rose-500/[0.03]">
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 mb-3">
                <p className="text-xs font-semibold text-rose-600 leading-relaxed">
                  This action is permanent. All your health data, logs, and account information will be deleted.
                  Type <strong>DELETE</strong> below to confirm.
                </p>
              </div>
              <input
                id="settings-delete-confirm-input"
                type="text"
                placeholder='Type "DELETE" to confirm'
                value={deleteText}
                onChange={e => setDeleteText(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-rose-500/30 bg-foreground/5 text-foreground placeholder-foreground/35 focus:outline-none focus:border-rose-500/50 mb-3"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeleteText(""); }}
                  className="flex-1 text-xs font-semibold py-2 rounded-xl border border-foreground/15 text-foreground/60 hover:bg-foreground/5 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="settings-delete-confirm-btn"
                  onClick={handleDeleteAccount}
                  disabled={deleteText !== "DELETE"}
                  className="flex-1 text-xs font-bold py-2 rounded-xl bg-rose-500 text-white hover:bg-rose-600 cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Delete My Account
                </button>
              </div>
            </div>
          )}
        </SettingsSection>

        {/* Version footer */}
        <div className="text-center">
          <p className="text-[11px] text-foreground/25 font-medium">VitalCore · Health Edition</p>
        </div>

      </div>
    </DashboardLayout>
  );
}
