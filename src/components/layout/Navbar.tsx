"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Sun, Moon, Sparkles, User, LogOut, Menu, X } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import Button from "../ui/Button";

export const Navbar: React.FC = () => {
  const { theme, toggleTheme, activeMode, setActiveMode } = useTheme();
  const { user, profile, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modeDropdownOpen, setModeDropdownOpen] = useState(false);

  const isDashboard = Boolean(user) && pathname !== "/";
  const showAuthButtons = !user && pathname !== "/auth/onboarding";

  const publicNavLinks = [
    { name: "Features", href: "/features" },
    { name: "How it Works", href: "/#how-it-works" },
    { name: "Android App", href: "/#android" },
    { name: "FAQ", href: "/#faq" },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[72px] items-center justify-between">
          
          {/* Left Header Section (Desktop & Mobile) */}
          <div className="flex items-center gap-3 md:w-[250px]">
            {/* Mobile Hamburger on LEFT */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex md:hidden h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card-bg)] text-foreground/80 hover:text-foreground cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5 text-primary" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-primary text-white shadow-md shadow-primary/20 transition-all duration-300">
                <Activity className="h-5 w-5" />
              </div>
              <span className="text-[22px] font-bold tracking-tight text-[var(--foreground)]">
                VitalCore
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Centered */}
          {!isDashboard && (
            <div className="hidden md:flex flex-1 items-center justify-center gap-8">
              {publicNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[14px] font-medium transition-colors hover:text-[var(--foreground)] ${
                    pathname === link.href ? "text-[var(--foreground)]" : "text-[var(--muted)]"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          )}

          {/* Desktop Right Header Panel */}
          <div className="hidden md:flex items-center justify-end md:w-[250px] gap-6">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center text-[var(--foreground)] hover:text-primary transition-colors cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-[18px] w-[18px] text-indigo-600" />}
            </button>

            {showAuthButtons ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/auth/login"
                  className="text-[14px] font-medium text-[var(--foreground)] hover:text-primary transition-colors px-4 py-2 rounded-lg border border-foreground/10 hover:border-primary/30"
                >
                  Log In
                </Link>
                <Link href="/auth/signup">
                  <Button variant="primary" size="md" className="px-6 rounded-lg font-semibold shadow-sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                {user && (
                  <div className="relative">
                    <button
                      onClick={() => setModeDropdownOpen(!modeDropdownOpen)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span className="capitalize">{activeMode}</span>
                    </button>

                    <AnimatePresence>
                      {modeDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setModeDropdownOpen(false)} />
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute right-0 mt-2 w-48 rounded-xl bg-[var(--card-bg)] border border-[var(--border)] p-1.5 shadow-2xl z-20"
                          >
                            {(["wellness", "performance", "elderly"] as const).map((m) => (
                              <button
                                key={m}
                                onClick={() => {
                                  setActiveMode(m);
                                  setModeDropdownOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-xs capitalize font-medium transition-all cursor-pointer ${
                                  activeMode === m
                                    ? "bg-primary text-white"
                                    : "hover:bg-[var(--muted-bg)] text-[var(--foreground)]"
                                }`}
                              >
                                {m} Mode
                              </button>
                            ))}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {user && pathname !== "/dashboard" && pathname !== "/auth/onboarding" && (
                  <Link href="/dashboard">
                    <Button variant="glass" size="sm" className="flex items-center gap-1.5 px-4 rounded-lg">
                      <User className="h-[14px] w-[14px]" />
                      <span>Dashboard</span>
                    </Button>
                  </Link>
                )}

                <button
                  onClick={handleSignOut}
                  className="text-[var(--muted)] hover:text-red-500 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
                  title="Log Out"
                >
                  <LogOut className="h-[18px] w-[18px]" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Right Controls */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card-bg)] text-foreground/80 cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="h-4.5 w-4.5 text-amber-400" /> : <Moon className="h-4.5 w-4.5 text-indigo-600" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Slide-in Left Drawer Panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Left Drawer Panel */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="relative flex flex-col w-72 max-w-[80vw] h-full bg-[var(--card-bg)] border-r border-[var(--border)] z-50 shadow-2xl overflow-y-auto"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Activity className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-bold text-base text-[var(--foreground)]">VitalCore</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-[var(--muted-bg)] text-[var(--muted)] transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-1.5 px-4 py-4 flex-1">
                {!isDashboard &&
                  publicNavLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground/80 hover:bg-[var(--muted-bg)] hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  ))}

                <div className="border-t border-[var(--border)] my-3 pt-3">
                  <div className="px-3 py-1 text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-2">
                    Engine Mode:
                  </div>
                  <div className="grid grid-cols-3 gap-1 px-1">
                    {(["wellness", "performance", "elderly"] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => setActiveMode(m)}
                        className={`py-1.5 text-xs capitalize rounded-lg font-semibold transition-all cursor-pointer ${
                          activeMode === m ? "bg-primary text-white" : "bg-[var(--muted-bg)] text-[var(--foreground)]"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[var(--border)] my-3 pt-3 flex flex-col gap-2">
                  {showAuthButtons ? (
                    <>
                      <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="glass" className="w-full">Log In</Button>
                      </Link>
                      <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="primary" className="w-full">Sign Up</Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      {user && pathname !== "/dashboard" && (
                        <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="primary" className="w-full">Dashboard</Button>
                        </Link>
                      )}
                      <Button variant="glass" onClick={handleSignOut} className="w-full">
                        <LogOut className="h-4 w-4 mr-2" /> Log Out
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </nav>
  );
};
export default Navbar;
