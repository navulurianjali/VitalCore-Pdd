"use client";

import React, { useState } from "react";
import { Mail, MessageSquare, ShieldCheck } from "lucide-react";
import confetti from "canvas-confetti";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/context/AuthContext";

export default function ContactPage() {
  const { profile } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setSubmitting(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          userId: profile?.id || null
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit inquiry.");
      }

      setSubmitted(true);
      setName("");
      setEmail("");
      setMessage("");

      // Success confetti
      confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.8 },
        colors: ["#8b5cf6", "#10b981"],
      });
    } catch (err: any) {
      console.error("Contact submission error:", err);
      setErrorMsg(err.message || "Failed to submit inquiry.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background pt-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        
        {/* Title */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">Connect with VitalCore Support</h1>
          <p className="text-xs text-foreground/60 font-semibold">preventative engineering support</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 border-t border-foreground/5 pt-10">
          
          {/* Info Side column */}
          <div className="md:col-span-5 space-y-6">
            <h2 className="text-lg font-bold">Biomedical Assistance</h2>
            <p className="text-xs text-foreground/75 leading-relaxed font-medium">
              Have questions regarding data integrations, HIPAA inspired policies, or toggle operations on the Elderly visual scaling profile? Write to our team.
            </p>
            
            <div className="space-y-4 text-xs font-semibold text-foreground/80">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <span>support@vitalcore.ai</span>
              </div>
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-secondary" />
                <span>Instant Developer Chat Console</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-accent" />
                <span>GDPR Data Erasure Request Portal</span>
              </div>
            </div>
          </div>

          {/* Form container Column */}
          <div className="md:col-span-7">
            {submitted ? (
              <GlassCard glowColor="emerald" className="p-8 text-center space-y-4">
                <div className="h-12 w-12 rounded-full bg-secondary/15 flex items-center justify-center text-secondary mx-auto">
                  ✓
                </div>
                <h3 className="text-base font-bold">Inquiry Broadcasted Successfully</h3>
                <p className="text-xs text-foreground/70 leading-relaxed font-medium">
                  Your message has been safely logged in our secure system. An engineering or clinical coach supervisor will follow up with you shortly.
                </p>
                <Button variant="glass" size="sm" onClick={() => setSubmitted(false)}>
                  Send Another Message
                </Button>
              </GlassCard>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {errorMsg && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-xs font-semibold">
                    {errorMsg}
                  </div>
                )}

                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground">Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs px-4 py-3 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground placeholder-foreground/45 focus:outline-none focus:border-primary/50"
                    placeholder="Enter name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground">Secure Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs px-4 py-3 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground placeholder-foreground/45 focus:outline-none focus:border-primary/50"
                    placeholder="name@company.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground">Detailed Inquiry</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full text-xs px-4 py-3 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground placeholder-foreground/45 focus:outline-none focus:border-primary/50"
                    placeholder="What questions can we answer for you?"
                  />
                </div>

                <Button variant="primary" type="submit" isLoading={submitting} className="w-full py-3.5">
                  Submit Encrypted Inquiry
                </Button>

              </form>
            )}
          </div>

        </div>

      </div>
      <Footer />
    </div>
  );
}
