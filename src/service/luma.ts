// services/luma.ts
import axios from "axios";

const API_KEY = process.env.LUMA_API_KEY!;
const API_URL = "https://api.lumalabs.ai/dream-machine/v1/generations";
const POLL_INTERVAL = 3000;
const MAX_POLLS = 20;
console.log(API_KEY);
export async function generateLumaVideoFromText(
  prompt: string
): Promise<string> {
  const res = await axios.post(
    API_URL,
    {
      prompt,
      model: "ray-2",
      resolution: "540p",
      duration: "5s",
      aspect_ratio: "16:9",
    },
    {
      headers: {
        Authorization: `Bearer luma-72d3ec34-c0ab-4c3a-b1e0-df3ebe189221-b9587367-15e0-4cbf-8bc3-21dd814aa00d`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );
  console.log(res);
  const generationId = res.data.id;

  // Poll until video is ready
  for (let i = 0; i < MAX_POLLS; i++) {
    const pollRes = await axios.get(`${API_URL}/${generationId}`, {
      headers: {
        Authorization: `Bearer luma-72d3ec34-c0ab-4c3a-b1e0-df3ebe189221-b9587367-15e0-4cbf-8bc3-21dd814aa00d`,
      },
    });

    const status = pollRes.data;
    if (status.state === "completed" || status.state === "succeeded") {
      const videoUrl = status.assets?.video || status.assets?.[0]?.url;
      if (!videoUrl) throw new Error("Video succeeded but no URL found");
      return videoUrl;
    }

    if (status.state === "failed") {
      throw new Error(status.failure_reason || "Luma generation failed");
    }

    await new Promise((r) => setTimeout(r, POLL_INTERVAL));
  }

  throw new Error("Luma video generation timed out");
}
