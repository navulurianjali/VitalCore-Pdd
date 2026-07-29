import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!groqKey && !geminiKey) {
      return NextResponse.json(
        { error: "Neither GROQ_API_KEY nor GEMINI_API_KEY is configured on the server." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { messages = [], profile = {}, metrics = {} } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "Messages array is required." }, { status: 400 });
    }

    // Personalized system prompt for health coaching
    const systemPrompt = `You are VitaCore AI Coach, an elite longevity, nutrition, and human performance health scientist.
User Profile:
- Name: ${profile?.full_name || "Explorer"}
- Active Mode: ${profile?.active_mode || "wellness"}
- Primary Goal: ${profile?.fitness_goal || "Healthy Lifestyle"}
- Biological Age: ${profile?.biological_age || profile?.age || 25}
- Biometrics: ${profile?.weight_kg || 68} kg | ${profile?.height_cm || 170} cm
- Medical Conditions: ${profile?.chronic_conditions || profile?.medical_conditions || "None"}
- Allergies: ${profile?.allergies || "None"}

Live Daily Telemetry:
- Calories Consumed: ${metrics?.caloriesConsumed || 0} / ${profile?.calorie_goal || 2000} kcal
- Macros: Protein ${metrics?.proteinG || 0}g | Carbs ${metrics?.carbsG || 0}g | Fat ${metrics?.fatG || 0}g
- Active Workout Burn: ${metrics?.caloriesBurned || 0} kcal
- Hydration: ${metrics?.hydrationMl || 0} / ${profile?.water_goal || 2500} ml
- Steps: ${metrics?.steps || 0} / ${profile?.step_goal || 10000}
- Sleep Last Night: ${metrics?.sleepHours || 0} hours (Quality: ${metrics?.sleepQuality || 0}/100)
- Recovery Score: ${metrics?.recoveryPercentage || 85}%
- Fatigue Index: ${metrics?.fatigueScore || 20}/100 | Stress Level: ${metrics?.stressLevel || 30}/100 | Mood: ${metrics?.mood || "good"}

Instructions:
1. Provide concise, highly actionable, encouraging advice tailored specifically to the user's biometrics and daily numbers.
2. Format response cleanly using Markdown (bold key numbers, use bullet points).
3. Keep answers focused, practical, and empathetic.`;

    // 1. TRY GROQ AI PROVIDER FIRST (Llama-3.3-70b-Versatile)
    if (groqKey) {
      try {
        const groqMessages = [
          { role: "system", content: systemPrompt },
          ...messages.map((m: any) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text
          }))
        ];

        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${groqKey}`,
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: groqMessages,
            temperature: 0.7,
            max_tokens: 1024,
            stream: true
          })
        });

        if (groqRes.ok && groqRes.body) {
          const encoder = new TextEncoder();
          const decoder = new TextDecoder();

          const stream = new ReadableStream({
            async start(controller) {
              const reader = groqRes.body!.getReader();
              let buffer = "";

              try {
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;

                  buffer += decoder.decode(value, { stream: true });
                  const lines = buffer.split("\n");
                  buffer = lines.pop() || "";

                  for (const line of lines) {
                    const trimmed = line.trim();
                    if (trimmed.startsWith("data: ")) {
                      const dataStr = trimmed.slice(6).trim();
                      if (dataStr === "[DONE]") continue;
                      try {
                        const parsed = JSON.parse(dataStr);
                        const content = parsed.choices?.[0]?.delta?.content;
                        if (content) {
                          controller.enqueue(encoder.encode(content));
                        }
                      } catch (e) {
                        // Ignore JSON parse errors on partial chunks
                      }
                    }
                  }
                }
              } catch (err) {
                controller.error(err);
              } finally {
                controller.close();
              }
            }
          });

          return new Response(stream, {
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Cache-Control": "no-cache, no-transform"
            }
          });
        } else {
          const groqErr = await groqRes.text();
          console.warn("Groq API failed, falling back to Gemini:", groqErr);
        }
      } catch (groqErr) {
        console.warn("Groq API exception, falling back to Gemini:", groqErr);
      }
    }

    // 2. FALLBACK TO GOOGLE GEMINI 2.5 FLASH PROVIDER
    if (geminiKey) {
      const contents: any[] = [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Understood. I am online as your VitaCore AI Coach." }] }
      ];

      for (const msg of messages) {
        contents.push({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.text }]
        });
      }

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${geminiKey}`;

      const geminiResponse = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
        })
      });

      if (geminiResponse.ok && geminiResponse.body) {
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        const stream = new ReadableStream({
          async start(controller) {
            const reader = geminiResponse.body!.getReader();
            let buffer = "";
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";
                for (const line of lines) {
                  if (line.startsWith("data: ")) {
                    const dataStr = line.slice(6).trim();
                    if (dataStr === "[DONE]") continue;
                    try {
                      const parsed = JSON.parse(dataStr);
                      const chunkText = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                      if (chunkText) controller.enqueue(encoder.encode(chunkText));
                    } catch (e) {}
                  }
                }
              }
            } catch (err) {
              controller.error(err);
            } finally {
              controller.close();
            }
          }
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache, no-transform"
          }
        });
      }
    }

    return NextResponse.json(
      { error: "All AI providers unavailable." },
      { status: 503 }
    );
  } catch (error: any) {
    console.error("AI Coach API Route Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
