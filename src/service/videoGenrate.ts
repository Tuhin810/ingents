import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";

// This module generates videos from text prompts using Google GenAI Veo 3.0.
// Per request: audio handling is removed — we only accept a text prompt.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



const apiKey = process.env.GOOGLE_GENAI_API_KEY || "your-google-genai-api-key-here";
if (!apiKey) throw new Error("Missing GOOGLE_GENAI_API_KEY");

const ai = new GoogleGenAI({ apiKey });

const TMP_DIR = path.join(__dirname, "..", "tmp");

/**
 * Generate a video using only a text prompt via Veo 3.0.
 * Audio input/processing intentionally omitted; this function accepts text-only prompts.
 * @param prompt - Text prompt describing the video (e.g. "A funny Diwali celebration video with fireworks")
 * @returns URL of uploaded video on S3
 */
export async function generateVeo3VideoFromPrompt(prompt: string): Promise<string> {
  let outputPath: string | null = null;

  try {
    if (!prompt || prompt.trim().length < 3) {
      throw new Error("❌ Invalid prompt text (too short)");
    }

    console.log("🎬 Generating video with prompt:", prompt);

    // Step 1: Request video generation
    let operation = await ai.models.generateVideos({
      model: "veo-3.0-generate-preview",
      prompt,
    });

    console.log(`🚀 Video generation started: ${operation.name}`);

    // Step 2: Poll for completion
    while (!operation.done) {
      console.log("⏳ Waiting for Veo 3 video to complete...");
      await new Promise((resolve) => setTimeout(resolve, 15000));
      // NOTE: The SDK method name may vary; keep this call aligned with SDK docs
      operation = await ai.operations.getVideosOperation({ operation });
    }

    const videoFile = operation.response?.generatedVideos?.[0]?.video;
    if (!videoFile) throw new Error("❌ No video returned from Veo");

    // Step 3: Download video locally
    outputPath = path.join(TMP_DIR, `veo-output-${uuidv4()}.mp4`);
    await ai.files.download({ file: videoFile, downloadPath: outputPath });

    console.log(`✅ Video downloaded to: ${outputPath}`);

    // Wait until file is fully written
    for (let i = 0; i < 10; i++) {
      if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) break;
      await new Promise((res) => setTimeout(res, 500));
    }

    if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) {
      throw new Error(`❌ Video file not found or incomplete: ${outputPath}`);
    }

    // Step 4: Upload to S3 (dynamic import to avoid static TS resolution issues)
    const s3Key = `veo3-outputs/${path.basename(outputPath)}`;
    let publicUrl: string;
    try {
  const uploader = await import("@/service/s3Uploader");
  publicUrl = await uploader.uploadToS3(outputPath, s3Key);
      console.log(`☁️ Uploaded to S3: ${publicUrl}`);
    } catch (uploadErr) {
      console.error("S3 upload failed for video:", uploadErr);
      throw uploadErr;
    }

    return publicUrl;
  } catch (err) {
    console.error("❌ Video generation failed:", err);
    throw err;
  } finally {
    // Step 5: Cleanup
    if (outputPath && fs.existsSync(outputPath)) {
      try {
        fs.unlinkSync(outputPath);
        console.log(`🧹 Deleted temp video: ${outputPath}`);
      } catch (cleanupErr) {
        console.warn("Failed to delete temp video:", cleanupErr);
      }
    }
  }
}

// Backwards-compatible wrapper for existing code that imports generateVideoWithGemini
export async function generateVideoWithGemini(prompt: string): Promise<string | null> {
  try {
    const url = await generateVeo3VideoFromPrompt(prompt);
    return url || null;
  } catch (err) {
    console.error("generateVideoWithGemini error:", err);
    return null;
  }
}