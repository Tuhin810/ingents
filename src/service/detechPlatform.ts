/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  postImageToFacebook,
  postTextToFacebook,
} from "./postGeneration/postGeneration.service";

type SocialPlatform =
  | "facebook"
  | "linkedin"
  | "instagram"
  | "twitter"
  | "youtube"
  | "unknown";

export function detectPlatform(
  prompt: string,
  text: any,
  imageUrl?: any,
  videoUrl?: any,
  userId?: string,
  fbProjectId?: string,
): SocialPlatform {
  const payload :any= {
    userId: userId , // Use provided userId or fallback to default
    pageId: fbProjectId,
    message: text,
  };
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes("facebook") || lowerPrompt.includes("fb")) {
    if (imageUrl) {
      const payload = {
        userId: userId , // Use provided userId or fallback to default
        pageId: fbProjectId,
        imageUrl,
        caption: text,
      };
      console.log("====>paylaod for fb",payload)
      postImageToFacebook(payload);
    } else {
       console.log("====>paylaod for fb 2",payload)
      postTextToFacebook(payload);
    }
    return "facebook";
  }

  if (lowerPrompt.includes("linkedin") || lowerPrompt.includes("li")) {
    return "linkedin";
  }
  if (lowerPrompt.includes("youtube") || lowerPrompt.includes("yt")) {
    
    console.log("====>yt api called")
    return "youtube";
  }

  if (lowerPrompt.includes("instagram") || lowerPrompt.includes("insta")) {
    return "instagram";
  }

  if (
    lowerPrompt.includes("twitter") ||
    lowerPrompt.includes("x.com") ||
    lowerPrompt.includes("tweet")
  ) {
    return "twitter";
  }

  return "unknown";
}
