import { NextResponse } from "next/server";

type Body = { text?: string };

// Use env var for key in production. Fallback provided for local/dev only.
const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY || "AIzaSyCDSQvs_QC5EK6bEwWT2v-xN9eKrsPg_9M";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as Body;
    const text = (body.text || "").trim();
    if (!text) {
      return NextResponse.json(
        { message: "Missing text in request" },
        { status: 400 }
      );
    }

    // Build contents for the generateContent API
    const contents = [
      {
        role: "user",
        parts: [{ text }],
      },
    ];

    const resp = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: { temperature: 0.2, maxOutputTokens: 512 },
      }),
    });

    if (!resp.ok) {
      const errBody = await resp.text().catch(() => "(no body)");
      console.error("Gemini API error", resp.status, errBody);
      return NextResponse.json(
        { message: "Gemini API error", status: resp.status, body: errBody },
        { status: 502 }
      );
    }

    const data = await resp.json().catch(async (e) => {
      const t = await resp.text().catch(() => "(unreadable body)");
      console.error("Failed to parse Gemini response", e, t);
      throw new Error("Invalid JSON from Gemini");
    });

    // Extract reply (generateContent uses candidates -> content.parts)
    let reply = "";
    type GeminiPart = { text?: string };
    type GeminiCandidate = { content?: { parts?: GeminiPart[] } };
    if (data.candidates && data.candidates.length > 0) {
      const first: GeminiCandidate = data.candidates[0];
      if (
        first.content &&
        first.content.parts &&
        first.content.parts.length > 0
      ) {
        reply = first.content.parts.map((p) => p.text || "").join("\n");
      }
    }

    if (!reply) {
      // fallback: stringify the response for debugging
      reply = JSON.stringify(data, null, 2);
      console.warn("Could not extract assistant reply from Gemini response");
    }

    return NextResponse.json({ reply });
  } catch (err: unknown) {
    console.error("/api/voice error:", err);
    const message = err instanceof Error ? err.message : "Unknown server error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export const runtime = "edge";
