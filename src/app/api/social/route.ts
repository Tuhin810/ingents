/* eslint-disable @typescript-eslint/no-explicit-any */
import { generateImageWithGemini } from "@/service/imageGenrate";
import { generateVideoWithGemini } from "@/service/videoGenrate";
import { buildFromUserText } from "@/lib/imagePromptBuilder";
import { NextResponse } from "next/server";
import { detectPlatform } from "@/service/detechPlatform";
import { callPostFunction } from "@/service/callPostFuction/callPostFunction";
import uploadYoutubeVideo from "@/service/ytPost/ytPost";
import { sessionStore } from "@/lib/sessionStore";

type Message = {
  role?: string;
  content?: string;
  imageUrl?: string;
};

type Incoming = {
  messages?: Array<Message>;
  context?: string;
  sessionId?: string; // Add session ID to track conversation
  // optional explicit action from client: 'confirm'|'regenerate'|'cancel'
  action?: 'confirm' | 'regenerate' | 'cancel';
};

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyCDSQvs_QC5EK6bEwWT2v-xN9eKrsPg_9M";

const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

export async function POST(req: Request) {
  try {
    const incoming: Incoming = await req.json().catch(() => ({} as Incoming));
    
    // Extract user ID from token
    const token = req.headers.get("authorization")?.replace("Bearer ", "") || 
                  req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
    
    let userId: string | undefined;
    let fbProjectId: string | undefined;
    
    if (token) {
      try {
        // First try to decode JWT token to get basic user info
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload._id || payload.userId || payload.id;
        console.log("Extracted payload from token:", payload);
        
        // Get detailed user info including Facebook project_id from verify-token API
        try {
          const verifyResponse = await fetch(`${req.url.split('/api/social')[0]}/api/auth/verify-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({}),
          });
          
          if (verifyResponse.ok) {
            const verifyData = await verifyResponse.json();
            const userData = verifyData.data?.user;
            if (userData) {
              fbProjectId = userData.facebook?.project_id;
              console.log("Extracted fbProjectId from verify API:", fbProjectId);
              
              // Use user ID from verify response if available (more reliable)
              if (userData._id || userData.id) {
                userId = userData._id || userData.id;
                console.log("Updated userId from verify API:", userId);
              }
            }
          } else {
            console.warn("Token verification failed, using JWT-only data");
          }
        } catch (verifyErr) {
          console.warn("Failed to fetch user details from verify API:", verifyErr);
        }
      } catch (e) {
        console.warn("Failed to decode token for userId:", e);
      }
    }
    
    // Generate or use provided session ID
    const sessionId = incoming.sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Get session history from server-side store
    const sessionHistory = sessionStore.getSession(sessionId);
    
    // Merge session history with incoming messages
    // Use server `sessionHistory` as the base and append/override with incoming messages.
    // This makes the route tolerant when the client sends only the latest action (like "regenerate")
    // or when the client omits assistant messages.
    const incomingMessages = incoming.messages || [];
    let allMessages: Message[] = [];

    if (sessionHistory.length > 0) {
      // start with server history, then append any incoming messages (client may only send last user action)
      allMessages = [...sessionHistory, ...incomingMessages];
    } else {
      allMessages = incomingMessages;
    }

    // Debug: log session and messages for diagnose if needed
    // (temporary - can be removed later)
    try {
      console.log('SOCIAL_ROUTE DEBUG sessionId=', sessionId);
      // console.log('SOCIAL_ROUTE DEBUG sessionHistory length=', sessionHistory.length);
      // console.log('SOCIAL_ROUTE DEBUG incomingMessages length=', incomingMessages.length);
      // show last 5 messages from sessionHistory for context
      // console.log('SOCIAL_ROUTE DEBUG sessionHistory (last 5)=', sessionHistory.slice(-5));
    } catch (e) {
      // ignore logging errors
    }
    
    if (!allMessages.length) {
      return NextResponse.json(
        { message: "Missing messages in request" },
        { status: 400 }
      );
    }

    const last = allMessages[allMessages.length - 1];
    const userText = (last?.content || "").trim();
    
    if (!userText) {
      return NextResponse.json(
        { message: "Empty user message" },
        { status: 400 }
      );
    }

  const normalized = userText.toLowerCase();
  const explicitAction = (incoming as any).action as ("confirm" | "regenerate" | "cancel") | undefined;

    // QUICK WIN: If the user only sends a short greeting, reply as a Social Media Manager AI
    // and do NOT generate a post. This prevents accidental post generation when the user
    // is simply saying hello.
    const greetingRegex = /^(hi|hello|hey|hi there|hey there|good morning|good afternoon|good evening|greetings|yo|hola|namaste)(\s|!|\.|$)/;
    const isGreeting = userText.length <= 40 && greetingRegex.test(normalized);

    if (isGreeting) {
      const greetingReply = `Hi there! I'm your Social Media Manager AI. I can draft posts, generate images, suggest hashtags, and schedule or post content for your platforms. What would you like to do today?`;

      // Update session with assistant greeting message
      sessionStore.updateSession(sessionId, [...allMessages, { role: "assistant", content: greetingReply }]);

      return NextResponse.json({ reply: greetingReply, sessionId, greeting: true });
    }

    // Check if there's a draft in the conversation history first
    let hasDraft = allMessages.some(
      (m) => m.role === "assistant" && /🪶\s*DRAFT:/i.test(m.content || "")
    );

    // If client-sent messages don't include the draft but server session has it, prefer session history
    if (!hasDraft && sessionHistory.length > 0) {
      const historyHasDraft = sessionHistory.some(
        (m) => m.role === "assistant" && /🪶\s*DRAFT:/i.test(m.content || "")
      );
      if (historyHasDraft) {
        allMessages = sessionHistory; // use authoritative server history
        hasDraft = true;
      }
    }

    // ✅ ACTION 1: POST - User wants to publish the draft (only if draft exists)
    // Use stricter matching: only match if it's a short confirmation message
    // Confirmation: prefer explicit action from client when present
    const isConfirmation = explicitAction === 'confirm' || (
      userText.length < 50 && // Short message
      /(^|\s)(yes|post it|go ahead|looks good|publish|send it|perfect|great|ok|okay|sure)(\s|$|!|\.)/i.test(normalized)
    );

    if (hasDraft && isConfirmation) {
      // Find the most recent assistant message with a draft
      const lastDraftMessage = allMessages
        .slice()
        .reverse()
        .find((m) => m.role === "assistant" && /🪶\s*DRAFT:/i.test(m.content || ""));

      if (!lastDraftMessage) {
        return NextResponse.json({
          message: "No draft found to post. Please ask to generate a post first.",
        });
      }

      // Extract the draft content (remove the "DRAFT:" prefix and confirmation question)
      let draftContent = lastDraftMessage.content || "";
      
      // Remove "DRAFT:" prefix if present
      draftContent = draftContent.replace(/^🪶\s*DRAFT:\s*/i, "");
      
      // Remove the confirmation question at the end
      draftContent = draftContent.replace(/\n\nWould you like to.*$/i, "").trim();
      
      // Get the ORIGINAL platform-specific request (not just the message before the draft)
      // Use multiple fallbacks to be robust:
      // 1) A substantial user message (>20 chars) that isn't an action/confirmation
      // 2) A user message that mentions a platform (facebook/instagram/twitter/linkedin)
      // 3) The last user message before the draft
      // 4) Any user message (first found)
      const userMessages = allMessages.filter((m) => m.role === "user" && m.content);

      // Prefer any substantial user message (length > 20). It's valid even if it mentions 'post'.
      let originalUserMessage = userMessages
        .slice()
        .reverse()
        .find((m) => m.content && m.content.length > 20);

      // Fallback: find a message that explicitly names a platform
      if (!originalUserMessage) {
        originalUserMessage = userMessages
          .slice()
          .reverse()
          .find((m) => /facebook|instagram|twitter|linkedin|x\b/i.test(m.content || ""));
      }

      // Fallback: take the last user message that appears before the draft
      if (!originalUserMessage) {
        const draftIndex = allMessages.findIndex((m) => m === lastDraftMessage);
        originalUserMessage = allMessages
          .slice(0, draftIndex)
          .reverse()
          .find((m) => m.role === "user" && m.content);
      }

      // Final fallback: first user message in the session
      if (!originalUserMessage) {
        originalUserMessage = userMessages[0];
      }

      const originalUserText = originalUserMessage?.content || userText;
      const imageUrl = lastDraftMessage.imageUrl;
      // Extract videoUrl from the draft if present
      // assistant messages may include videoUrl dynamically
      // Use any cast to avoid TypeScript complaints about shape
      const videoUrl = (lastDraftMessage as any)?.videoUrl;

      // If this is a YouTube request and we have a video URL, upload to YouTube
      const isYouTubeRequest = /youtube|yt|youtube\.com/gi.test(originalUserText || "");

      if (isYouTubeRequest && videoUrl) {
        try {
          // Build title: use first sentence of the draft or a short fallback
          const firstSentence = (draftContent.split(/\.|\n/)[0] || "").trim();
          const title = firstSentence ? firstSentence.slice(0, 100) : `New video - ${new Date().toISOString()}`;

          // Description: full draft content
          const description = draftContent;

          // Tags: extract hashtags from draftContent or empty
          const rawTags = (draftContent.match(/#(\w+)/g) || []).map((t) => t.replace(/^#/, "").toLowerCase());
          const tags = rawTags.length ? rawTags : [];

          const privacyStatus = /private|unlisted/i.test(originalUserText) ? (/(unlisted)/i.test(originalUserText) ? 'unlisted' : 'private') : 'public';

          const payload = {
            user_id: userId , // Use extracted userId or fallback to default
            title,
            description,
            tags,
            privacyStatus,
            videoURL: videoUrl,
          };

          const uploadResp = await uploadYoutubeVideo(payload as any);

          const successMessage: Message = {
            role: "assistant",
            content: `✅ Your video has been uploaded to YouTube successfully! ${uploadResp?.url || ''}`,
          };

          // Update session with success message
          sessionStore.updateSession(sessionId, [...allMessages, successMessage]);

          return NextResponse.json({ reply: successMessage.content, sessionId });
        } catch (ytErr) {
          console.error('YouTube upload failed:', ytErr);
          const errorMessage: Message = { role: 'assistant', content: '❌ Failed to upload video to YouTube. Please try again.' };
          sessionStore.updateSession(sessionId, [...allMessages, errorMessage]);
          return NextResponse.json({ reply: errorMessage.content, sessionId });
        }
      }

      // Post using callPostFunction (include videoUrl)
      try {
        await callPostFunction({
          userText: originalUserText,
          reply: draftContent,
          imageUrl,
          videoUrl,
          detectPlatform,
          userId,
          fbProjectId,
        });

        const successMessage: Message = {
          role: "assistant",
          content: "✅ Your post has been published successfully!",
        };

        // Update session with success message
        sessionStore.updateSession(sessionId, [...allMessages, successMessage]);

        return NextResponse.json({
          reply: successMessage.content,
          sessionId, // Return session ID to client
        });
      } catch (postErr) {
        console.error("Failed to publish post:", postErr);
        
        const errorMessage: Message = {
          role: "assistant",
          content: "❌ Failed to publish the post. Please try again.",
        };

        // Update session with error message
        sessionStore.updateSession(sessionId, [...allMessages, errorMessage]);

        return NextResponse.json({
          reply: errorMessage.content,
          sessionId,
        });
      }
    }

    // 🔄 ACTION 2: REGENERATE - User wants a new draft (only if draft exists)
    const isRegenerateRequest = explicitAction === 'regenerate' || (
      userText.length < 100 && // Relatively short message
      /(regenerate|try again|another|change|different|redo|remake|new one|do it again)/i.test(normalized)
    );

    if (hasDraft && isRegenerateRequest) {
      // Find the original user request (skip confirmation messages)
      // Debug log before searching
      try {
        console.log('SOCIAL_ROUTE DEBUG regenerate: allMessages length=', allMessages.length);
        console.log('SOCIAL_ROUTE DEBUG regenerate: last messages=', allMessages.slice(-6));
      } catch (e) {}
      let originalUserMessage = allMessages
        .slice()
        .reverse()
        .find((m) => 
          m.role === "user" && 
          m.content && 
          m.content.length > 20 && // Must be a substantial request
          !/(yes|no|post|cancel|regenerate|try again|change|different|ok|okay|sure)/i.test(m.content)
        );

      // If not found in incoming history, try server sessionHistory
      if (!originalUserMessage && sessionHistory.length > 0) {
        // Session fallback: accept reasonable-length historical user messages
        originalUserMessage = sessionHistory
          .slice()
          .reverse()
          .find((m) => m.role === "user" && m.content && m.content.length > 10);
      }

      if (!originalUserMessage) {
        const noTopicReply = "No previous topic found to regenerate. Please give a topic again.";
        // Update session with informational assistant message
        sessionStore.updateSession(sessionId, [...allMessages, { role: "assistant", content: noTopicReply }]);

        // Provide debug info in response to help diagnose why it couldn't be found
        const userMsgs = allMessages.filter((m) => m.role === 'user').map((m) => m.content).slice(-10);
        const assistantMsgs = allMessages.filter((m) => m.role === 'assistant').map((m) => m.content).slice(-10);

        return NextResponse.json({
          reply: noTopicReply,
          sessionId,
          debug: {
            userMessagesRecent: userMsgs,
            assistantMessagesRecent: assistantMsgs,
            sessionHistoryLength: sessionHistory.length,
            allMessagesLength: allMessages.length,
          },
        }, { status: 400 });
      }

      // Generate new post with the original request
      // Pass the original request for content generation, but maintain full session history
      const newIncoming: Incoming = {
        ...incoming,
        messages: [originalUserMessage], // Use only the original request for generation
        sessionId,
      };
      
      // Pass full allMessages to preserve conversation history (including platform info)
      return await generateNewPost(newIncoming, allMessages, sessionId);
    }

    // ❌ ACTION 3: CANCEL - User wants to cancel (only if draft exists)
    const isCancelRequest = explicitAction === 'cancel' || (
      userText.length < 50 &&
      /(cancel|stop|never mind|forget it|no thanks|discard)/i.test(normalized)
    );

    if (hasDraft && isCancelRequest) {
      const cancelMessage: Message = {
        role: "assistant",
        content: "❌ Okay, I've canceled the post. Let me know if you want to create something else!",
      };

      // Update session with cancel message
      sessionStore.updateSession(sessionId, [...allMessages, cancelMessage]);

      return NextResponse.json({
        reply: cancelMessage.content,
        sessionId,
      });
    }

    // 🆕 DEFAULT ACTION: Generate a new post draft
    return await generateNewPost(incoming, allMessages, sessionId);
    
  } catch (err: unknown) {
    console.error("/api/social error:", err);
    const message = err instanceof Error ? err.message : "Unknown server error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

// 📝 Helper function to generate new post draft
async function generateNewPost(
  incoming: Incoming, 
  allMessages: Message[], 
  sessionId: string
): Promise<NextResponse> {
  const last = incoming.messages![incoming.messages!.length - 1];
  const userText = (last?.content || "").trim();

  // Detect platform from user request
  let platform = "general";
  let limit = "around 300 words";
  const tone = "friendly, professional, creative";
  let style = "clear and engaging";

  if (/facebook/i.test(userText)) {
    platform = "Facebook";
    limit = "under 200 words";
    style = "warm, conversational, community-focused";
  } else if (/instagram/i.test(userText)) {
    platform = "Instagram";
    limit = "around 150 words";
    style = "visual, expressive, with light emojis and engagement hooks";
  } else if (/twitter|x\s/i.test(userText)) {
    platform = "Twitter/X";
    limit = "under 280 characters";
    style = "concise, witty, scroll-stopping";
  } else if (/linkedin/i.test(userText)) {
    platform = "LinkedIn";
    limit = "up to 1000 words";
    style = "professional, insight-driven, informative";
  }

  const companyContext = incoming.context
    ? `\nCompany Details: ${incoming.context}`
    : "";

  // Build conversation context from session history to make AI smarter
  const conversationContext = buildConversationContext(allMessages);

  const systemPrompt = `
You are a professional social media content creator assistant.
Always generate content that is **positive, brand-safe, and non-vulgar**.
Avoid aggression, negativity, or political controversy.
Tailor tone, structure, and word count for the target platform.
Include creative hashtags only when suitable.
Always sound human, engaging, and relevant to the company context if provided.

IMPORTANT: Reference and build upon previous conversation context when relevant.
If the user previously requested specific images, videos, or topics, incorporate that context naturally.

Generate ONLY the post content - do NOT add prefixes like "Here's your post" or "DRAFT:".
Just return the actual post text.

Platform: ${platform}
Word/Character Limit: ${limit}
Tone: ${tone}
Style: ${style}
${companyContext}

Conversation Context:
${conversationContext}
`;

  const contents = [
    { role: "user", parts: [{ text: systemPrompt }] },
    ...incoming.messages!.map((m) => ({
      role: "user",
      parts: [{ text: m.content || "" }],
    })),
  ];

  const resp = await fetch(GEMINI_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
    }),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "(no body)");
    console.error(`Gemini API error ${resp.status}: ${text}`);
    const fallback = "Sorry, I couldn't generate the draft right now. Please try again.";
    // Update session with assistant fallback
    sessionStore.updateSession(sessionId, [...allMessages, { role: "assistant", content: fallback }]);
    return NextResponse.json(
      { reply: fallback, message: "Gemini API error", status: resp.status, body: text, sessionId },
      { status: 502 }
    );
  }

  const data = await resp.json();
  let reply = "";
  
  if (data.candidates?.length > 0) {
    const first = data.candidates[0];
    if (first.content?.parts?.length) {
      reply = first.content.parts.map((p: any) => p.text).join("\n");
    }
  }

  // Use AI to intelligently detect media requests
  let imageUrl: string | undefined;
  let videoUrl: string | undefined;
  
  // AI-powered intent detection for media requests
  const { imageRequested, videoRequested, imageOnly, videoOnly } = await detectMediaIntent(userText);

  // If user wants ONLY image or video, don't generate text post
  if (imageOnly) {
    console.log(`SOCIAL_ROUTE DEBUG image ONLY requested for session=${sessionId} userText=${userText}`);
    try {
      console.log("Image only requested, generating...");
      const prompt = buildFromUserText(userText, incoming.context);
      console.log("Generated image prompt:", prompt);
      
      const generatedImageUrl = await generateImageWithGemini(prompt);
      if (generatedImageUrl) {
        imageUrl = generatedImageUrl;
        console.log("Image generated successfully:", imageUrl);
        
        // Return ONLY the image, no text post
        const imageOnlyMessage: Message = {
          role: "assistant",
          content: "🖼️ Here's your generated image!",
          imageUrl: generatedImageUrl,
        };
        
        sessionStore.updateSession(sessionId, [...allMessages, imageOnlyMessage]);
        
        return NextResponse.json({
          reply: "🖼️ Here's your generated image!",
          imageUrl: generatedImageUrl,
          sessionId,
          imageRequested: true,
          videoRequested: false,
        });
      } else {
        console.log("Image generation returned null");
        const errorMessage = "❌ Sorry, I couldn't generate the image right now. Please try again.";
        sessionStore.updateSession(sessionId, [...allMessages, { role: "assistant", content: errorMessage }]);
        return NextResponse.json({
          reply: errorMessage,
          sessionId,
        });
      }
    } catch (imageErr) {
      console.error("Failed to generate image:", imageErr);
      const errorMessage = "❌ Failed to generate image. Please try again.";
      sessionStore.updateSession(sessionId, [...allMessages, { role: "assistant", content: errorMessage }]);
      return NextResponse.json({
        reply: errorMessage,
        sessionId,
      });
    }
  }

  if (videoOnly) {
    console.log(`SOCIAL_ROUTE DEBUG video ONLY requested for session=${sessionId} userText=${userText}`);
    try {
      console.log("Video only requested, generating...");
      const prompt = buildFromUserText(userText, incoming.context);
      console.log("Generated video prompt:", prompt);

      const generatedVideoUrl = await generateVideoWithGemini(prompt);
      if (generatedVideoUrl) {
        videoUrl = generatedVideoUrl;
        console.log("Video generated successfully:", videoUrl);
        
        // Return ONLY the video, no text post
        const videoOnlyMessage: Message = {
          role: "assistant",
          content: "🎬 Here's your generated video!",
          ...(videoUrl ? { videoUrl } as any : {}),
        };
        
        sessionStore.updateSession(sessionId, [...allMessages, videoOnlyMessage]);
        
        return NextResponse.json({
          reply: "🎬 Here's your generated video!",
          videoUrl: generatedVideoUrl,
          sessionId,
          imageRequested: false,
          videoRequested: true,
        });
      } else {
        console.log("Video generation returned null");
        const errorMessage = "❌ Sorry, I couldn't generate the video right now. Please try again.";
        sessionStore.updateSession(sessionId, [...allMessages, { role: "assistant", content: errorMessage }]);
        return NextResponse.json({
          reply: errorMessage,
          sessionId,
        });
      }
    } catch (videoErr) {
      console.error("Failed to generate video:", videoErr);
      const errorMessage = "❌ Failed to generate video. Please try again.";
      sessionStore.updateSession(sessionId, [...allMessages, { role: "assistant", content: errorMessage }]);
      return NextResponse.json({
        reply: errorMessage,
        sessionId,
      });
    }
  }

  // Continue with normal post generation if not image/video only
  if (imageRequested) {
    console.log(`SOCIAL_ROUTE DEBUG image requested for session=${sessionId} userText=${userText}`);
    
    // Smart context-aware image handling: check if we already have relevant images
    const existingRelevantImage = findRelevantMediaInHistory(allMessages, userText, 'image');
    
    if (existingRelevantImage && shouldReuseExistingMedia(userText, existingRelevantImage)) {
      console.log("Reusing existing relevant image from conversation history");
      imageUrl = existingRelevantImage;
    } else {
      try {
        console.log("Image requested, generating new one...");
        const prompt = buildFromUserText(userText, incoming.context);
        console.log("Generated image prompt:", prompt);
        
        const generatedImageUrl = await generateImageWithGemini(prompt);
        if (generatedImageUrl) {
          imageUrl = generatedImageUrl;
          console.log("Image generated successfully:", imageUrl);
        } else {
          console.log("Image generation returned null");
        }
      } catch (imageErr) {
        console.error("Failed to generate image:", imageErr);
        // Continue without image
      }
    }
  }

  if (videoRequested) {
    console.log(`SOCIAL_ROUTE DEBUG video requested for session=${sessionId} userText=${userText}`);
    
    // Smart context-aware video handling: check if we already have relevant videos
    const existingRelevantVideo = findRelevantMediaInHistory(allMessages, userText, 'video');
    
    if (existingRelevantVideo && shouldReuseExistingMedia(userText, existingRelevantVideo)) {
      console.log("Reusing existing relevant video from conversation history");
      videoUrl = existingRelevantVideo;
    } else {
      try {
        console.log("Video requested, generating new one...");
        const prompt = buildFromUserText(userText, incoming.context);
        console.log("Generated video prompt:", prompt);

        const generatedVideoUrl = await generateVideoWithGemini(prompt);
        if (generatedVideoUrl) {
          videoUrl = generatedVideoUrl;
          console.log("Video generated successfully:", videoUrl);
        } else {
          console.log("Video generation returned null");
        }
      } catch (videoErr) {
        console.error("Failed to generate video:", videoErr);
        // Continue without video
      }
    }
  }


  // Format the response with draft and confirmation question
  const formattedReply = `🪶 DRAFT:\n${reply}\n\nWould you like to **post this**, **regenerate**, or **cancel**?`;

  const assistantMessage: Message = {
    role: "assistant",
    content: formattedReply,
    // include imageUrl and optionally videoUrl on the assistant message so the frontend can render them
    ...(imageUrl ? { imageUrl } : {}),
    ...(videoUrl ? { videoUrl } as any : {}),
  };

  // Update session with the new draft
  // IMPORTANT: Append to allMessages (not incoming.messages) to preserve full conversation history
  // This ensures platform info from original request is maintained for posting
  sessionStore.updateSession(sessionId, [...allMessages, assistantMessage]);

  return NextResponse.json({
    reply: formattedReply,
    imageUrl,
    videoUrl,
    sessionId, // Return session ID to client
    imageRequested: imageRequested || false,
    videoRequested: videoRequested || false,
  });
}

export const runtime = "node";

// 🤖 AI-powered intent detection for media requests
async function detectMediaIntent(userText: string): Promise<{ imageRequested: boolean; videoRequested: boolean; imageOnly: boolean; videoOnly: boolean }> {
  try {
    const intentPrompt = `
Analyze this user request and determine the user's intent:

User request: "${userText}"

Consider these patterns:
- Image/Photo words: "image", "photo", "pic", "picture", "visual", "graphic", "artwork", "illustration", "snapshot"
- Video words: "video", "clip", "footage", "recording", "movie", "animation", "motion", "moving picture"
- Post/Content words: "post", "content", "create", "write", "draft", "share"

Intent types:
1. IMAGE ONLY: User wants ONLY an image (e.g., "generate image of diwali", "create a photo", "show me a picture")
2. VIDEO ONLY: User wants ONLY a video (e.g., "generate video of celebration", "create a clip")
3. POST WITH IMAGE: User wants a text post that includes an image (e.g., "create a Facebook post with image")
4. POST WITH VIDEO: User wants a text post that includes a video (e.g., "create a post with video")
5. TEXT POST ONLY: User wants only text content

Rules:
- If user says "generate/create/make IMAGE" without mentioning "post", it's IMAGE ONLY
- If user says "generate/create/make VIDEO" without mentioning "post", it's VIDEO ONLY  
- If user mentions both "post" AND media, they want post WITH media
- If user only mentions post creation without media words, they want text only

Respond with ONLY a JSON object in this exact format:
{"imageRequested": true/false, "videoRequested": true/false, "imageOnly": true/false, "videoOnly": true/false}
`;

    const resp = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: intentPrompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 150 },
      }),
    });

    if (!resp.ok) {
      console.warn("Intent detection failed, falling back to regex");
      return fallbackMediaDetection(userText);
    }

    const data = await resp.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // Extract JSON from response
    const jsonMatch = reply.match(/\{[^}]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return {
        imageRequested: Boolean(result.imageRequested),
        videoRequested: Boolean(result.videoRequested),
        imageOnly: Boolean(result.imageOnly),
        videoOnly: Boolean(result.videoOnly)
      };
    }
    
    throw new Error("No valid JSON in response");
  } catch (err) {
    console.warn("AI intent detection failed:", err, "- using fallback");
    return fallbackMediaDetection(userText);
  }
}

// 🧠 Helper function to build smart conversation context
function buildConversationContext(messages: Message[]): string {
  if (!messages || messages.length === 0) return "";
  
  const contextParts: string[] = [];
  
  // Look for previous media requests and generations
  const mediaMessages = messages.filter(msg => 
    msg.imageUrl || 
    (msg as any).videoUrl || 
    /image|photo|pic|picture|video|clip|visual/i.test(msg.content || "")
  );
  
  if (mediaMessages.length > 0) {
    const mediaContext = mediaMessages
      .map(msg => {
        const content = msg.content || "";
        const hasImage = msg.imageUrl ? " (with generated image)" : "";
        const hasVideo = (msg as any).videoUrl ? " (with generated video)" : "";
        return `- ${content}${hasImage}${hasVideo}`;
      })
      .join("\n");
    
    contextParts.push(`Previous media requests/generations:\n${mediaContext}`);
  }
  
  // Look for topics, themes, or subjects mentioned
  const topicMessages = messages.filter(msg => 
    msg.role === "user" && 
    msg.content && 
    msg.content.length > 10 &&
    !/^(yes|no|post|cancel|regenerate|ok|sure|looks good)$/i.test(msg.content.trim())
  );
  
  if (topicMessages.length > 0) {
    const recentTopics = topicMessages
      .slice(-3) // Last 3 substantial user messages
      .map(msg => `- ${msg.content}`)
      .join("\n");
    
    contextParts.push(`Recent topics/requests:\n${recentTopics}`);
  }
  
  // Look for platform-specific mentions
  const platformMentions = messages
    .filter(msg => /facebook|instagram|twitter|linkedin|youtube/i.test(msg.content || ""))
    .map(msg => msg.content)
    .slice(-2); // Last 2 platform mentions
  
  if (platformMentions.length > 0) {
    contextParts.push(`Platform context: ${platformMentions.join("; ")}`);
  }
  
  return contextParts.join("\n\n");
}

// 🔍 Helper function to find relevant media in conversation history
function findRelevantMediaInHistory(messages: Message[], currentUserText: string, mediaType: 'image' | 'video'): string | undefined {
  if (!messages || messages.length === 0) return undefined;
  
  // Extract key topics/subjects from current request
  const currentTopics = extractKeyTopics(currentUserText);
  if (currentTopics.length === 0) return undefined;
  
  // Look through recent messages (last 10) for media with similar topics
  const recentMessages = messages.slice(-10);
  
  for (const message of recentMessages.reverse()) {
    const mediaUrl = mediaType === 'image' ? message.imageUrl : (message as any).videoUrl;
    if (!mediaUrl) continue;
    
    // Check if this media was generated for similar topics
    const messageContent = message.content || "";
    const messageTopics = extractKeyTopics(messageContent);
    
    // Look for topic overlap
    const commonTopics = currentTopics.filter(topic => 
      messageTopics.some(msgTopic => 
        topic.toLowerCase() === msgTopic.toLowerCase() ||
        topic.toLowerCase().includes(msgTopic.toLowerCase()) ||
        msgTopic.toLowerCase().includes(topic.toLowerCase())
      )
    );
    
    if (commonTopics.length > 0) {
      console.log(`Found relevant ${mediaType} with common topics:`, commonTopics);
      return mediaUrl;
    }
  }
  
  return undefined;
}

// 🎯 Helper function to extract key topics from text
function extractKeyTopics(text: string): string[] {
  const topics: string[] = [];
  
  // Common topic indicators
  const topicPatterns = [
    // Festivals and celebrations
    /\b(diwali|dussehra|holi|christmas|eid|navratri|ganesh|durga|karva)\b/gi,
    // Seasons and times
    /\b(spring|summer|winter|autumn|monsoon|morning|evening|night)\b/gi,
    // Business terms
    /\b(business|company|startup|technology|innovation|growth|success)\b/gi,
    // Nature and objects
    /\b(sunset|sunrise|mountain|ocean|flowers|trees|city|landscape)\b/gi,
    // Food and lifestyle
    /\b(food|recipe|travel|lifestyle|fitness|health|fashion)\b/gi,
  ];
  
  topicPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      topics.push(...matches.map(m => m.toLowerCase()));
    }
  });
  
  // Also extract quoted terms and capitalize words
  const quotedTerms = text.match(/"([^"]+)"/g);
  if (quotedTerms) {
    topics.push(...quotedTerms.map(q => q.replace(/"/g, '').toLowerCase()));
  }
  
  // Extract capitalized words (likely proper nouns/topics)
  const capitalizedWords = text.match(/\b[A-Z][a-z]+\b/g);
  if (capitalizedWords) {
    topics.push(...capitalizedWords.map(w => w.toLowerCase()));
  }
  
  return [...new Set(topics)]; // Remove duplicates
}

// 🤔 Helper function to determine if existing media should be reused
function shouldReuseExistingMedia(currentUserText: string, existingMediaUrl: string): boolean {
  // Don't reuse if user explicitly asks for "new" or "different"
  if (/\b(new|different|another|fresh|other)\b/i.test(currentUserText)) {
    return false;
  }
  
  // Don't reuse if user asks for specific variations
  if (/\b(style|version|variation|type|kind)\b/i.test(currentUserText)) {
    return false;
  }
  
  // Reuse if user is asking for a post about the same topic
  if (/\b(post|content|share|write|create|draft)\b/i.test(currentUserText)) {
    return true;
  }
  
  return true; // Default to reusing relevant media
}

// Fallback regex-based detection
function fallbackMediaDetection(userText: string): { imageRequested: boolean; videoRequested: boolean; imageOnly: boolean; videoOnly: boolean } {
  const imagePatterns = /\b(image|photo|pic|picture|visual|graphic|artwork|illustration|snapshot|with\s+image)\b/i;
  const videoPatterns = /\b(video|clip|footage|recording|movie|animation|motion|with\s+video)\b/i;
  
  // Simple heuristic for "only" detection
  const imageOnlyPatterns = /\b(generate|create|make|show)\s+(image|photo|pic|picture)\b/i;
  const videoOnlyPatterns = /\b(generate|create|make|show)\s+(video|clip|footage)\b/i;
  const postPatterns = /\b(post|content|draft|share)\b/i;
  
  const imageRequested = imagePatterns.test(userText);
  const videoRequested = videoPatterns.test(userText);
  const imageOnly = imageOnlyPatterns.test(userText) && !postPatterns.test(userText);
  const videoOnly = videoOnlyPatterns.test(userText) && !postPatterns.test(userText);
  
  return {
    imageRequested,
    videoRequested,
    imageOnly,
    videoOnly
  };
}
