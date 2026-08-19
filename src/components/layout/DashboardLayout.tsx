"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  LayoutDashboard,
  Brain,
  Utensils,
  Moon,
  Users,
  Settings,
  User,
  Activity,
  Menu,
  X,
  Dumbbell,
  Sparkles,
  Calendar,
  CheckSquare,
  Sun,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, profile, loading, signOut } = useAuth();
  const { theme, toggleTheme, activeMode } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Route guard
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth/login");
      } else if (profile && profile.onboarding_completed === false && pathname !== "/auth/onboarding") {
        router.push("/auth/onboarding");
      }
    }
  }, [user, profile, loading, router, pathname]);

  const navGroups = useMemo(() => [
    {
      label: "Main",
      links: [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Future Health Lab", href: "/future-lab", icon: Sparkles, highlight: true },
        { name: "AI Coach", href: "/ai-coach", icon: Brain, highlight: true },
        { name: "Fitness", href: "/fitness", icon: Dumbbell, highlight: true },
      ]
    },
    {
      label: "Health Management",
      links: [
        { name: "Health History", href: "/history", icon: Calendar, highlight: true },
        { name: "Calorie Tracker", href: "/calorie-tracker", icon: Utensils, highlight: true },
        { name: "Sleep", href: "/sleep", icon: Moon },
        { name: "Healthy Habits", href: "/challenges", icon: CheckSquare },
      ]
    }
  ], []);

  const footerLinks = useMemo(() => [
    { name: "Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
  ], []);

  // Sidebar content (shared for desktop & mobile drawer)
  const sidebarContent = useMemo(() => (
    <div className="flex flex-col h-full bg-[var(--card-bg)]">
      {/* Logo / Brand (Visible in Desktop sidebar) */}
      <div className="hidden lg:flex items-center gap-3 px-6 py-6 shrink-0">
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
          <Activity className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-lg text-[var(--foreground)]">VitalCore AI</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6 scrollbar-none">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            {group.label !== "Main" && (
              <p className="px-3 pb-2 text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider">
                {group.label}
              </p>
            )}
            <div className="space-y-1">
              {group.links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-full text-[14px] transition-all duration-200 ${
                      isActive
                        ? "bg-primary text-white font-medium shadow-sm shadow-primary/20"
                        : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)]/50"
                    }`}
                  >
                    <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? "text-white" : "opacity-70"}`} />
                    <span className="truncate">{link.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer links */}
      <div className="px-4 py-4 space-y-1 shrink-0 mt-auto border-t border-[var(--border)]">
        {footerLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-full text-[14px] transition-all duration-200 ${
                isActive
                  ? "bg-primary text-white font-medium"
                  : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)]/50"
              }`}
            >
              <Icon className="h-[18px] w-[18px] shrink-0 opacity-70" />
              <span>{link.name}</span>
            </Link>
          );
        })}
        
        {/* User Profile Mini */}
        <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center gap-3 px-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs shrink-0 text-primary">
            {profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="overflow-hidden min-w-0 flex-1">
            <p className="text-xs font-semibold text-[var(--foreground)] truncate leading-tight">{profile?.full_name || "User"}</p>
            <button
              onClick={async () => {
                setMobileSidebarOpen(false);
                await signOut();
                router.push("/");
                router.refresh();
              }}
              className="text-[11px] text-[var(--muted)] hover:text-red-500 flex items-center gap-1 mt-0.5 transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [pathname, profile?.full_name, mobileSidebarOpen, navGroups, footerLinks, router, signOut]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[var(--background)]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
          <span className="text-sm text-[var(--muted)]">Loading VitalCore AI...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--background)]">

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-[var(--border)] bg-[var(--card-bg)] shrink-0 select-none">
        {sidebarContent}
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Mobile / Tablet Header Bar */}
        <header className="lg:hidden flex h-14 items-center justify-between px-4 border-b border-[var(--border)] bg-[var(--card-bg)] shrink-0 z-30">
          <div className="flex items-center gap-3">
            <button
              id="mobile-menu-btn"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-[var(--muted-bg)] text-[var(--foreground)] border border-[var(--border)] transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileSidebarOpen ? <X className="h-5 w-5 text-primary" /> : <Menu className="h-5 w-5 text-[var(--foreground)]" />}
            </button>

            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center shrink-0">
                <Activity className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-base text-[var(--foreground)] tracking-tight">
                VitalCore <span className="text-primary font-extrabold">AI</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-[var(--muted-bg)] text-[var(--foreground)] border border-[var(--border)] transition-colors cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="h-4.5 w-4.5 text-amber-400" /> : <Moon className="h-4.5 w-4.5 text-indigo-600" />}
            </button>

            <Link
              href="/profile"
              className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary shrink-0"
              title="My Profile"
            >
              {profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
            </Link>
          </div>
        </header>

        {/* Mobile / Tablet Left Slide-in Drawer */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex">
              {/* Semi-transparent Backdrop Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/5 dark:bg-black/10 backdrop-blur-[2px]"
                onClick={() => setMobileSidebarOpen(false)}
              />

              {/* Left Drawer Panel */}
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 250 }}
                className="relative flex flex-col w-72 max-w-[80vw] h-full bg-[var(--card-bg)] border-r border-[var(--border)] z-50 shadow-2xl overflow-hidden"
              >
                {/* Drawer Header with Close Button */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <Activity className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-bold text-base text-[var(--foreground)] tracking-tight">VitalCore AI</span>
                  </div>
                  <button
                    onClick={() => setMobileSidebarOpen(false)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-[var(--muted-bg)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Sidebar Navigation */}
                <div className="flex-1 overflow-y-auto">
                  {sidebarContent}
                </div>
              </motion.aside>
            </div>
          )}
        </AnimatePresence>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>

      </div>
    </div>
  );
};
export default DashboardLayout;
