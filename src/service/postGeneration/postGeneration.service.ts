/* eslint-disable @typescript-eslint/no-explicit-any */

export type FacebookPostBody = {
  userId: string;
  pageId: string;
  message: string;
};

export type FacebookPostResponse = {
  success: boolean;
  postId?: string;
  message: string;
};

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8989";

export async function postTextToFacebook(
  payload: FacebookPostBody
): Promise<FacebookPostResponse> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/fa/post-text`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`HTTP ${res.status}: ${err}`);
    }

    const data = (await res.json()) as FacebookPostResponse;
    console.log("===>data",data)
    return data;
  } catch (error: unknown) {
    console.error("Facebook postTextToFacebook error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: message || "Failed to post on Facebook",
    };
  }
}

export async function postImageToFacebook(payload: any) {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/fa/post-image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`HTTP ${res.status}: ${err}`);
    }

    const data = await res.json();
    return data;
  } catch (error: unknown) {
    console.error("Facebook post image error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: message || "Failed to post on Facebook",
    };
  }
}

export async function postVideoToFacebook(payload: any) {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/fa/upload-video`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`HTTP ${res.status}: ${err}`);
    }

    const data = await res.json();
    return data;
  } catch (error: unknown) {
    console.error("Facebook post image error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: message || "Failed to post on Facebook",
    };
  }
}
