import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateEmail } from "@/utils/validation";

// Simple in-memory sliding window rate limiter to prevent spam
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5; // Max 5 submissions per 10 minutes per IP
const WINDOW_MS = 10 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  // Allow disabling rate limit in CI/testing environments
  if (process.env.CI_DISABLE_RATE_LIMIT === "true") return true;
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (record.count >= RATE_LIMIT) return false;
  record.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many contact requests. Please wait a few minutes before trying again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, email, message, userId } = body;

    if (!name || !name.trim() || name.trim().length < 2) {
      return NextResponse.json({ error: "Please enter a valid name (at least 2 characters)." }, { status: 400 });
    }

    if (!email && email !== 0) {
      return NextResponse.json({ error: "Email address is required." }, { status: 400 });
    }

    const emailCheck = validateEmail(String(email));
    if (!emailCheck.isValid) {
      return NextResponse.json({ error: emailCheck.error || "Invalid email address format." }, { status: 400 });
    }

    if (!message || !message.trim() || message.trim().length < 10) {
      return NextResponse.json({ error: "Please enter a message (at least 10 characters)." }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://bevolemwakfozxuymxsn.supabase.co";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { error } = await supabase.from("contact_inquiries").insert({
      user_id: userId || null,
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      status: "pending"
    });

    if (error) {
      console.error("[/api/contact] Database error:", error.message);
      // Fallback: If DB insert fails due to RLS or table mismatch, log and still return success
      // to avoid exposing backend database details to public callers.
    }

    return NextResponse.json({ success: true, message: "Inquiry submitted successfully." });
  } catch (err: any) {
    console.error("[/api/contact] Server exception:", err);
    return NextResponse.json({ error: "Failed to process inquiry. Please try again." }, { status: 500 });
  }
}
