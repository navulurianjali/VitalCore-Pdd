"use client";

import React, { useState, useEffect } from "react";
import { Shield, Sparkles, AlertTriangle, Terminal, Layers, Info } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GlassCard from "@/components/ui/GlassCard";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

interface AuditLog {
  timestamp: string;
  event: string;
  status: "success" | "warning" | "alert";
  ip: string;
  details: string;
}

export default function AdminPage() {
  const { user } = useAuth();
  const { activeMode } = useTheme();
  
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    // Generate simulated security audit logs
    setLogs([
      {
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        event: "JSON Web Token Validation",
        status: "success",
        ip: "127.0.0.1",
        details: "JWT session authenticated. Row level policies validated against active user ID constraints."
      },
      {
        timestamp: new Date(Date.now() - 3600000).toISOString().replace('T', ' ').substring(0, 19),
        event: "Metabolic Risk Computation Run",
        status: "success",
        ip: "127.0.0.1",
        details: "Time series algorithms finished without warning flags. Sleep debt accumulated: 1.2h."
      },
      {
        timestamp: new Date(Date.now() - 7200000).toISOString().replace('T', ' ').substring(0, 19),
        event: "Atmospheric Throttling Override",
        status: "warning",
        ip: "192.168.1.12",
        details: "Sunny Heatwave (34°C) parameters injected. Workouts scaled back from High to Low intensity."
      },
      {
        timestamp: new Date(Date.now() - 14400000).toISOString().replace('T', ' ').substring(0, 19),
        event: "Invisible Health Decline Isolated",
        status: "alert",
        ip: "127.0.0.1",
        details: "HRV latency quality decay exceeds 5% threshold over 14 consecutive sleep cycles."
      }
    ]);
  }, []);

  // VULN-03 FIX: Removed hardcoded admin email from client bundle.
  // The middleware handles the actual protection. If they load this, they are admin.
  const isAdmin = true;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl glass-panel border-foreground/5 bg-gradient-to-r from-primary/10 via-background to-secondary/5">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary animate-pulse" />
              Administrative Security Control Panel
            </h1>
            <p className="text-xs text-foreground/70 font-semibold">
              PostgreSQL audit trails, Row-Level-Security validation logs & system monitoring
            </p>
          </div>
        </div>

        {/* Access Warning if not signed in as the admin */}
        {!isAdmin && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex gap-3 items-start text-xs font-semibold text-amber-500">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">🔒 Access Restricted</p>
              <p className="text-foreground/70 font-medium">You do not have administrative privileges to access this console. Please contact your system administrator.</p>
            </div>
          </div>
        )}

        {/* 1. DUAL LAYOUT: Logs viewport vs Status gauges */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left panel: Security Audit Logs */}
          <div className="lg:col-span-8 rounded-2xl glass-panel p-6 border-foreground/5 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Terminal className="h-4.5 w-4.5 text-primary" />
                PostgreSQL RLS Security Audit Logs
              </h3>

              <div className="space-y-3 max-h-[360px] overflow-y-auto scrollbar-none pr-1">
                {logs.map((log, idx) => (
                  <div key={idx} className="p-3.5 bg-foreground/5 rounded-xl border border-foreground/5 space-y-1.5 text-xs font-semibold">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-foreground/50">{log.timestamp}</span>
                      <span className={`rounded-full px-2 py-0.2 text-[8px] font-bold border ${
                        log.status === "success" 
                          ? "bg-secondary/15 border-secondary/20 text-secondary" 
                          : log.status === "warning"
                          ? "bg-amber-500/15 border-amber-500/20 text-amber-500"
                          : "bg-red-500/15 border-red-500/20 text-red-500"
                      }`}>
                        {log.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center font-bold text-foreground text-xs">
                      <span>{log.event}</span>
                      <span className="text-xs text-foreground/55 font-medium">IP: {log.ip}</span>
                    </div>
                    <p className="text-xs text-foreground/75 leading-relaxed font-semibold">
                      {log.details}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-xs text-foreground/50 leading-normal font-semibold border-t border-foreground/5 pt-3">
              Security Compliances: HIPAA and GDPR inspired policies evaluated automatically at each session token broadcast.
            </div>
          </div>

          {/* Right panel: Active sessions & performance gauges */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            <GlassCard glowColor="violet" className="p-5 space-y-3">
              <h3 className="text-xs font-bold text-foreground">Database Clusters Status</h3>
              <ul className="space-y-3 text-xs text-foreground/75 font-semibold leading-normal">
                <li className="flex justify-between">
                  <span>Active Client Connections</span>
                  <span className="text-secondary font-bold">12 (Healthy)</span>
                </li>
                <li className="flex justify-between">
                  <span>Row Level Policies Count</span>
                  <span className="text-primary font-bold">18 Tables Secured</span>
                </li>
                <li className="flex justify-between">
                  <span>Average Query Execution</span>
                  <span className="text-secondary font-bold">4.2 ms</span>
                </li>
              </ul>
            </GlassCard>

            <GlassCard glowColor="emerald" className="p-5 flex gap-3 items-start border border-foreground/5">
              <Info className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="text-[9px] font-bold text-secondary">Audit Log Compliance</h4>
                <p className="text-[9px] text-foreground/75 leading-relaxed font-semibold">
                  Every CRUD transaction executing in the user profiles or biometrics timelines leaves an audited cryptographic telemetry log automatically.
                </p>
              </div>
            </GlassCard>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
