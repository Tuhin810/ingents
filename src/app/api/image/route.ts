
import { NextResponse } from "next/server";

// For now, we'll use a placeholder image.
// In a real application, you would use a text-to-image model like DALL-E, Midjourney, or an open-source alternative.
const generateImage = async (prompt: string): Promise<string> => {

  console.log(`Generating image for prompt: ${prompt}`);
  // Placeholder image URL
  return Promise.resolve(`https://source.unsplash.com/500x500/?${encodeURIComponent(prompt)}`);
};

export async function POST(req: Request) {
    console.log("====>image gen api called")
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { message: "Missing prompt in request" },
        { status: 400 }
      );
    }

    const imageUrl = await generateImage(prompt);

    return NextResponse.json({ imageUrl });
  } catch (err: unknown) {
    console.error("/api/image error:", err);
    const message = err instanceof Error ? err.message : "Unknown server error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export const runtime = "edge";
