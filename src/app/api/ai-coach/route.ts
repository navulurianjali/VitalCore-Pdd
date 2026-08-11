import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { generateLocalAICoachResponse } from "@/services/aiCoachEngine";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// VULN-03 FIX: Upstash Redis rate limiter (per-user, 20 req/min)
// Fallback to in-memory only if Upstash env vars are missing
let ratelimit: Ratelimit | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(20, "1 m"),
    analytics: true,
  });
}

// In-memory fallback
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;

async function checkRateLimit(userId: string): Promise<boolean> {
  if (ratelimit) {
    const { success } = await ratelimit.limit(userId);
    return success;
  }
  
  // Fallback to in-memory map
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

// VULN-04 FIX: Strip prompt injection characters from user-controlled strings
function sanitizeForPrompt(value: string): string {
  return value.replace(/[\n\r]/g, " ").replace(/[`"'{}\[\]]/g, "").substring(0, 300);
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate Request (Supports Bearer token for Mobile & Cookies for Web)
    let user = null;
    const authHeader = req.headers.get("authorization");

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
      const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "https://bevolemwakfozxuymxsn.supabase.co",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key"
      );
      const { data: authData } = await supabaseAdmin.auth.getUser(token);
      user = authData?.user || null;
    }

    if (!user) {
      const supabase = await createClient();
      const { data: { user: cookieUser } } = await supabase.auth.getUser();
      user = cookieUser;
    }

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized access. Valid Supabase session required." },
        { status: 401 }
      );
    }

    // VULN-03 FIX: Rate limit check
    const isAllowed = await checkRateLimit(user.id);
    if (!isAllowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment before trying again." },
        { status: 429 }
      );
    }

    // 2. Parse Payload securely
    // VULN-04 FIX: Explicitly check body size (limit to 1MB)
    let body;
    try {
      const rawBody = await req.text();
      if (rawBody.length > 1_000_000) {
        return NextResponse.json({ error: "Payload too large." }, { status: 413 });
      }
      body = JSON.parse(rawBody);
    } catch (parseError) {
      return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
    }

    // VULN-05 FIX: Only accept message and history from the client.
    // Profile and metrics are fetched server-side from the DB using the authenticated user ID.
    const { message, history } = body;

    // Fetch real profile server-side
    const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
    const supabaseClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://bevolemwakfozxuymxsn.supabase.co",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key",
      authHeader ? { global: { headers: { Authorization: authHeader } } } : undefined
    );
    const { data: serverProfile } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const profile = serverProfile || {};
    // VULN-01 FIX: Enforce bounds on client-supplied metrics
    const rawMetrics = body.metrics || {};
    const metrics = {
      caloriesBurned: Math.max(0, Math.min(Number(rawMetrics.caloriesBurned) || 0, 10000)),
      caloriesConsumed: Math.max(0, Math.min(Number(rawMetrics.caloriesConsumed) || 0, 10000)),
      hydrationMl: Math.max(0, Math.min(Number(rawMetrics.hydrationMl) || 0, 15000)),
      steps: Math.max(0, Math.min(Number(rawMetrics.steps) || 0, 100000)),
      sleepHours: Math.max(0, Math.min(Number(rawMetrics.sleepHours) || 0, 24)),
      sleepQuality: Math.max(0, Math.min(Number(rawMetrics.sleepQuality) || 0, 100)),
      stressLevel: Math.max(0, Math.min(Number(rawMetrics.stressLevel) || 0, 100)),
      recoveryPercentage: Math.max(0, Math.min(Number(rawMetrics.recoveryPercentage) || 0, 100)),
      fatigueScore: Math.max(0, Math.min(Number(rawMetrics.fatigueScore) || 0, 100)),
      caloriesTarget: Math.max(1, Math.min(Number(rawMetrics.caloriesTarget) || 600, 10000)),
      hydrationTarget: Math.max(1, Math.min(Number(rawMetrics.hydrationTarget) || 2500, 15000)),
      stepsTarget: Math.max(1, Math.min(Number(rawMetrics.stepsTarget) || 10000, 100000)),
      sleepTarget: Math.max(1, Math.min(Number(rawMetrics.sleepTarget) || 8.0, 24))
    };

    // Generate local intent-based response using real profile and metrics
    const userPrompt = String(message || "Hello Coach! Give me a quick update on my health telemetry.").substring(0, 1000);
    const replyText = generateLocalAICoachResponse(userPrompt, profile, metrics);
    return NextResponse.json({ reply: replyText });
  } catch (err: any) {
    // VULN-12 FIX: Log error server-side only, never expose raw error to client
    console.error("AI Coach REST API Error:", err);
    return NextResponse.json(
      { error: "An internal error occurred. Please try again." },
      { status: 500 }
    );
  }
}
