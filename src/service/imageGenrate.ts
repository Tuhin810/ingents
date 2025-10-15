export const generateImageWithGemini = async (prompt: string): Promise<string | null> => {
  try {
    const huggingFaceToken = process.env.HUGGING_FACE_TOKEN || "your-huggingface-token-here";
    
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        headers: {
          Authorization: `Bearer ${huggingFaceToken}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        // HF inference expects { inputs: "your prompt" }
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    if (!response.ok) {
      const txt = await response.text().catch(() => "(no body)");
      console.error("HF image generation error:", response.status, txt);
      return null;
    }

    // Get as ArrayBuffer
    const arrayBuffer = await response.arrayBuffer();

    // Try to upload to S3 and return a public URL. If that fails, fallback to data URL.
    try {
      // Lazy-import the S3 uploader to avoid bundling AWS SDK into edge/runtime bundles
      const { uploadFileToS3Service } = await import("@/service/s3Upload");
      const buffer:any = Buffer.from(arrayBuffer);
      const mimeType = 'image/png'; // HF router returns PNG bytes; use a safe default
      // use a key prefix e.g. 'generated-images'
      const s3Url = await uploadFileToS3Service('generated-images', buffer, mimeType as string);
      if (s3Url) return s3Url;
    } catch (s3Err) {
      console.error('S3 upload failed:', s3Err);
      // continue to build data URL fallback
    }

    // Convert to base64 in a runtime-safe way (Node Buffer or browser btoa)
    let base64: string;
    if (typeof Buffer !== "undefined") {
      base64 = Buffer.from(arrayBuffer).toString("base64");
    } else {
      // Edge / browser fallback
      let binary = "";
      const bytes = new Uint8Array(arrayBuffer);
      const chunkSize = 0x8000;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
      }
      base64 = btoa(binary);
    }

    // Return a data URL the frontend can use directly as an <img src="..."></img>
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.error("Error generating image with Gemini:", error);
    return null;
  }
};


