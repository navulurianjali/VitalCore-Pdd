"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Sun, Moon, Sparkles, User, LogOut, Menu, X, Settings } from "lucide-react";
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

  const isDashboard = pathname.startsWith("/dashboard") || 
                      pathname === "/ai-coach" || 
                      pathname === "/nutrition" || 
                      pathname === "/sleep" || 
                      pathname === "/recovery" || 
                      pathname === "/timeline" || 
                      pathname === "/challenges" || 
                      pathname === "/community" ||
                      pathname === "/settings" ||
                      pathname === "/profile" ||
                      pathname === "/admin";

  const publicNavLinks = [
    { name: "About", href: "/about" },
    { name: "Features", href: "/features" },
    { name: "Contact", href: "/contact" },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20 transition-all duration-300 group-hover:rotate-12">
                <Activity className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                VitalCore
              </span>
              <span className="hidden sm:inline-block rounded-full bg-secondary/15 px-2 py-0.5 text-xs font-semibold text-secondary">
                Wellness
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {!isDashboard && (
            <div className="hidden md:flex items-center gap-6">
              {publicNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname === link.href ? "text-primary" : "text-foreground/75"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          )}

          {/* Right Header Panel */}
          <div className="hidden md:flex items-center gap-4">
            
            {/* Mode Switcher Selector */}
            <div className="relative">
              <Button
                variant="glass"
                size="sm"
                onClick={() => setModeDropdownOpen(!modeDropdownOpen)}
                className="flex items-center gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5 text-secondary" />
                <span className="capitalize">{activeMode} Mode</span>
              </Button>

              <AnimatePresence>
                {modeDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setModeDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 rounded-xl glass-panel bg-background p-1.5 shadow-2xl z-20"
                    >
                      {(["wellness", "performance", "elderly"] as const).map((m) => (
                        <button
                          key={m}
                          onClick={() => {
                            setActiveMode(m);
                            setModeDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs capitalize font-medium transition-all ${
                            activeMode === m
                              ? "bg-primary text-white"
                              : "hover:bg-foreground/5 text-foreground/80"
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

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-xl glass-panel border-foreground/5 hover:bg-foreground/5 transition-all text-foreground/80"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            {/* User Session Info Buttons */}
            {(!user || pathname === "/" || pathname === "/auth/onboarding") ? (
              <div className="flex items-center gap-2">
                <Link href="/auth/login">
                  <Button variant="glass" size="sm">Log In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="primary" size="sm">Get Started</Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/dashboard">
                  <Button variant="glass" size="sm" className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Button>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex h-9 w-9 items-center justify-center rounded-xl glass-panel border-foreground/5 hover:bg-red-500/10 hover:text-red-500 transition-all text-foreground/80"
                  title="Log Out"
                >
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Icon */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-xl glass-panel text-foreground/80"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-xl glass-panel text-foreground/80"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-panel border-t border-foreground/5 bg-background overflow-hidden"
          >
            <div className="space-y-1.5 px-4 py-4">
              {!isDashboard &&
                publicNavLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 text-base font-medium text-foreground/80 hover:bg-foreground/5"
                  >
                    {link.name}
                  </Link>
                ))}

              <div className="border-t border-foreground/5 my-3 pt-3">
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-sm font-semibold">Active Engine Mode:</span>
                  <div className="flex gap-1">
                    {(["wellness", "performance", "elderly"] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => setActiveMode(m)}
                        className={`px-2.5 py-1 text-xs capitalize rounded-md font-semibold transition-all ${
                          activeMode === m ? "bg-primary text-white" : "bg-foreground/5 text-foreground/75"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-foreground/5 my-3 pt-3 flex flex-col gap-2">
                {(!user || pathname === "/" || pathname === "/auth/onboarding") ? (
                  <>
                    <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="glass" className="w-full">Log In</Button>
                    </Link>
                    <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="primary" className="w-full">Get Started</Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="primary" className="w-full">Dashboard</Button>
                    </Link>
                    <Button variant="glass" onClick={handleSignOut} className="w-full">
                      <LogOut className="h-4 w-4 mr-2" /> Log Out
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
export default Navbar;
