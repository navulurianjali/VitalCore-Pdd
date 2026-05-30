"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Activity, Send } from "lucide-react";
import confetti from "canvas-confetti";
import Button from "../ui/Button";

export const Footer: React.FC = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setSubscribed(true);
    setEmail("");

    // Trigger premium success confetti
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.85 },
      colors: ["#8b5cf6", "#10b981", "#f59e0b", "#ec4899"],
    });
  };

  return (
    <footer className="glass-panel border-t border-foreground/5 bg-background/80 py-16 relative z-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                <Activity className="h-4.5 w-4.5" />
              </div>
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                VitalCore
              </span>
            </div>
            <p className="text-xs text-foreground/60 leading-relaxed">
              Predictive AI wellness intelligence that identifies risks, optimizes biological age, and protects high-demand lifestyles.
            </p>
            <p className="text-xs text-foreground/40 leading-relaxed font-medium">
              HIPAA & GDPR Inspired Security Infrastructure.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-foreground mb-4">Platform</h4>
            <ul className="space-y-2 text-xs text-foreground/75">
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/features" className="hover:text-primary transition-colors">Preventative AI</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-xs font-bold text-foreground mb-4">Safety & Legal</h4>
            <ul className="space-y-2 text-xs text-foreground/75">
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">GDPR Compliance</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">HIPAA Statements</Link></li>
            </ul>
          </div>

          {/* Newsletter Form */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-foreground">Intelligence Digests</h4>
            <p className="text-xs text-foreground/60 leading-relaxed">
              Subscribe to receive preventative healthcare recommendations and AI wellness science updates.
            </p>

            {subscribed ? (
              <div className="rounded-xl bg-secondary/10 border border-secondary/15 px-3 py-2.5 text-xs text-secondary font-medium">
                ✓ Welcome! You are now subscribed to VitalCore Digests.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter secure email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground placeholder-foreground/45 focus:outline-none focus:border-primary/50"
                />
                <Button variant="primary" type="submit" className="p-2.5 rounded-xl shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            )}
          </div>

        </div>

        <div className="mt-12 border-t border-foreground/5 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-foreground/50 font-medium">
          <span>&copy; {new Date().getFullYear()} VitalCore Inc. All rights reserved.</span>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <span className="hover:text-primary cursor-pointer transition-all">Twitter / X</span>
            <span className="hover:text-primary cursor-pointer transition-all">LinkedIn</span>
            <span className="hover:text-primary cursor-pointer transition-all">GitHub</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
