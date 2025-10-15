import { NextResponse } from "next/server";

// Lightweight in-memory LRU cache (per runtime instance) to avoid re‑synthesizing identical phrases.
// NOTE: This resets on cold start; don't rely on it for persistence.
const MAX_CACHE_ITEMS = 40;
type CacheEntry = { buffer: Buffer; contentType: string; at: number };
const cache = new Map<string, CacheEntry>();

function cacheGet(key: string) {
  const v = cache.get(key);
  if (v) v.at = Date.now();
  return v || null;
}
function cacheSet(key: string, buffer: Buffer, contentType: string) {
  if (cache.size >= MAX_CACHE_ITEMS) {
    let oldestKey: string | undefined;
    let oldest = Infinity;
    for (const [k, v] of cache.entries()) {
      if (v.at < oldest) {
        oldest = v.at;
        oldestKey = k;
      }
    }
    if (oldestKey) cache.delete(oldestKey);
  }
  cache.set(key, { buffer, contentType, at: Date.now() });
}

function toArrayBuffer(buf: Buffer): ArrayBuffer {
  const slice = buf.buffer.slice(
    buf.byteOffset,
    buf.byteOffset + buf.byteLength
  );
  // Create a true ArrayBuffer copy to avoid SharedArrayBuffer type issues
  const copy = new Uint8Array(slice.byteLength);
  copy.set(new Uint8Array(slice));
  return copy.buffer;
}

type Body = { text?: string; voice?: string };

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as Body;
    const original = (body.text || "").trim();
    if (!original) {
      return NextResponse.json({ message: "Missing text" }, { status: 400 });
    }

    // ElevenLabs API key - you can add this to your .env file
    const apiKey = "sk_8f2fea42310641f159bdd189d636f0bd4b1caeff75bbf6aa"; // Replace with your actual key
    if (!apiKey) {
      console.error("/api/voice/tts missing ELEVENLABS_API_KEY env var");
      return NextResponse.json(
        { message: "Missing ELEVENLABS_API_KEY in env" },
        { status: 500 }
      );
    }

    const MAX_INPUT_CHARS = 500;
    const normalized = original.replace(/\s+/g, " ").trim();
    const truncated =
      normalized.length > MAX_INPUT_CHARS
        ? normalized.slice(0, MAX_INPUT_CHARS) + "…"
        : normalized;

    const voiceId =  "21m00Tcm4TlvDq8ikWAM"; 
    const cacheKey = `${voiceId}::${truncated}`;
    const cached = cacheGet(cacheKey);
    if (cached) {
      const ab = toArrayBuffer(cached.buffer);
      return new Response(ab, {
        headers: { "Content-Type": cached.contentType, "X-TTS-Cache": "HIT" },
      });
    }

    const start = Date.now();
    console.log(
      "ElevenLabs TTS start chars=",
      truncated.length,
      "truncated?",
      truncated.endsWith("…") && normalized.length > truncated.length
    );

    // Call ElevenLabs API
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text: truncated,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      })
    });

    const latency = Date.now() - start;
    console.log("ElevenLabs TTS latency ms:", latency);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", response.status, errorText);
      return NextResponse.json(
        { message: "ElevenLabs API error", status: response.status, body: errorText },
        { status: 502 }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(audioBuffer);
    const contentType = "audio/mpeg";

    console.log("Audio buffer length:", buffer.length);
    
    cacheSet(cacheKey, buffer, contentType);
    const ab = toArrayBuffer(buffer);
    
    return new Response(ab, {
      headers: {
        "Content-Type": contentType,
        "X-TTS-Cache": "MISS",
        "X-TTS-Latency": String(latency),
      },
    });
  } catch (err: unknown) {
    console.error("/api/voice/tts error:", err);
    const message = err instanceof Error ? err.message : "Unknown server error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export const runtime = "nodejs";
