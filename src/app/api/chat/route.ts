import { NextRequest, NextResponse } from "next/server";
import { generateLocalAICoachResponse } from "@/services/aiCoachEngine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages = [], profile = {}, metrics = {} } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "Messages array is required." }, { status: 400 });
    }

    const lastUserMessage = [...messages].reverse().find((m: any) => m.sender === "user")?.text || "";

    const responseText = generateLocalAICoachResponse(lastUserMessage, profile, metrics);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const words = responseText.split(" ");
        for (let i = 0; i < words.length; i++) {
          const chunk = (i === 0 ? "" : " ") + words[i];
          controller.enqueue(encoder.encode(chunk));
          // Micro delay to simulate smooth streaming UI feel
          await new Promise((res) => setTimeout(res, 12));
        }
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform"
      }
    });
  } catch (error: any) {
    console.error("AI Coach API Route Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
