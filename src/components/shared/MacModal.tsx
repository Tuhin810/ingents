"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MicIcon } from "lucide-react";
// removed unused imports

interface MacModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MacModal({ isOpen, onClose }: MacModalProps) {
  // const aiAgents = [ ... ];
  // kept for future use — commented out to avoid unused variable lint

  // ensure portal only renders on client
  const [mounted, setMounted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState("en-US");
  const [isSupported, setIsSupported] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [assistantReply, setAssistantReply] = useState("");
  // speakEnabled kept for future UI toggle; setter intentionally unused
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [speakEnabled, _setSpeakEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = React.useRef<AudioContext | null>(null);
  // keep a ref to the latest transcript so callbacks can access it
  const transcriptRef = React.useRef<string>("");
  // remember last payload we sent to avoid duplicate API calls
  const lastSentRef = React.useRef<string>("");
  // Use DOM SpeechRecognition types when available
  const recognitionRef = React.useRef<SpeechRecognition | null>(null);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!assistantReply) return;
    if (!speakEnabled) return;

    const playViaEleven = async () => {
      console.log("first");
      try {
        setIsPlaying(true);
        // request TTS audio from our proxy
        const ttsRes = await fetch("/api/voice/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: assistantReply }),
        });
        if (!ttsRes.ok) {
          // try to read server message to show a helpful error
          const txt = await ttsRes.text().catch(() => "(no body)");
          console.error("TTS proxy returned non-OK:", ttsRes.status, txt);
          setError(`TTS error: ${ttsRes.status} ${txt}`);
          throw new Error("TTS failed");
        }

        const blob = await ttsRes.blob();
        const url = URL.createObjectURL(blob);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = url;
        } else {
          audioRef.current = new Audio(url);
        }
        audioRef.current.onended = () => {
          setIsPlaying(false);
          try {
            URL.revokeObjectURL(url);
          } catch {}
        };
        audioRef.current.play().catch(() => setIsPlaying(false));
      } catch (err) {
        setIsPlaying(false);
        console.error("playViaEleven error:", err);
        // fallback to speechSynthesis
        try {
          if (typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
            const utter = new SpeechSynthesisUtterance(assistantReply);
            utter.lang = lang;
            window.speechSynthesis.speak(utter);
          }
        } catch {
          // ignore
        }
      }
    };

    playViaEleven();
  }, [assistantReply, speakEnabled, lang]);

  useEffect(() => {
    // feature detect
    // Feature detection using typed shape to avoid `any`
    type SRClass = new () => SpeechRecognition;
    const win = window as unknown as {
      webkitSpeechRecognition?: SRClass;
      SpeechRecognition?: SRClass;
    };
    const SRCtor = win.webkitSpeechRecognition || win.SpeechRecognition;
    if (!SRCtor) {
      setIsSupported(false);
      return;
    }

    // create a single instance and keep in ref
    const r = new SRCtor();
    r.interimResults = true;
    r.continuous = false; // we'll restart manually if needed
    r.lang = lang;

    r.onresult = (ev: SpeechRecognitionEvent) => {
      let interimText = "";
      let finalText = transcript;
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const res = ev.results[i];
        if ((res as SpeechRecognitionResult).isFinal) {
          finalText +=
            ((res as SpeechRecognitionResult)[0]?.transcript || "").trim() +
            " ";
        } else {
          interimText += (res as SpeechRecognitionResult)[0]?.transcript || "";
        }
      }
      setTranscript(finalText.trim());
      setInterim(interimText.trim());
    };

    r.onerror = () => {
      setError("speech recognition error");
      setIsListening(false);
    };

    r.onend = () => {
      // stop listening state when recognition ends
      setIsListening(false);

      // Sometimes on certain browsers the final onresult fires *just* before
      // onend and React state/ref may not yet be updated synchronously.
      // We attempt an immediate send; if empty we retry shortly once.
      const attemptSend = (label: string) => {
        const finalText = (transcriptRef.current || "").trim();
        console.log(`[speech] onend ${label} finalText=`, finalText);
        if (finalText && finalText !== lastSentRef.current) {
          void sendTranscriptAsync(finalText);
          return true;
        }
        return false;
      };

      const sentNow = attemptSend("immediate");
      if (!sentNow) {
        // retry once after a short delay in case the ref updates late
        setTimeout(() => {
          attemptSend("retry");
        }, 150);
      }
    };

    recognitionRef.current = r;

    return () => {
      try {
        recognitionRef.current?.stop?.();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, isSupported]);

  // keep transcriptRef in sync with state
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  // extracted send function so it can be used from onend and the Send button
  async function sendTranscriptAsync(text?: string) {
    const payload = (text || transcript || "").trim();
    if (!payload) return;
    if (payload === lastSentRef.current) {
      console.log("[speech] skip duplicate send", payload);
      return;
    }
    setIsSending(true);
    setError(null);
    setAssistantReply("");
    try {
      console.log("===== Sending transcript:", { payload });
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: payload }),
      });
      const json = await res.json();
      const reply = json && json.reply ? String(json.reply) : "";
      console.log("===== Received reply:", { reply });
      setAssistantReply(reply);
      lastSentRef.current = payload;
    } catch (err: unknown) {
      setError(String(err));
    } finally {
      setIsSending(false);
    }
  }

  const modal = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur"
            onClick={onClose}
          />

          {/* Modal - Centered */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 400,
              duration: 0.3,
            }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="bg-white h-[75vh] overflow-hidden backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 
            overflow-hidden max-w-2xl w-full "
            >
              <div className="">
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="flex items-center justify-center flex-col space-y-4"
                >
                  <video
                    autoPlay={true}
                    loop={true}
                    muted={true}
                    className="h-96  "
                    src="https://res.cloudinary.com/diecfwnp9/video/upload/v1758717691/original-f3ba952f70b42737e63565e8ca9c28f3_il7fo7.mp4"
                  ></video>
                  {/* Voice recording UI: animated bars + status */}
                  <div className=" flex flex-col items-center">
                    {/* Status + Controls */}
                    <div className="bg-black/80 -mt-16 mb-5 text-white text-xs rounded-full px-3 py-1">
                      {isSupported
                        ? isListening
                          ? "Listening..."
                          : "Click the mic to start"
                        : "Speech not supported"}
                    </div>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex items-center space-x-2">
                        {/* <button
                          onClick={() => {
                            try {
                              recognitionRef.current?.stop?.();
                            } catch {
                              // ignore
                            }
                            setIsListening(false);
                          }}
                          className="px-3 py-1 rounded-md bg-gray-200 text-xs"
                        >
                          Stop
                        </button> */}
                      </div>
                    </div>

                    {!isListening ? (
                      <>
                        <button
                          onClick={() => {
                            if (!isSupported) return;
                            setError(null);
                            try {
                              // Unlock audio playback on user gesture so later
                              // programmatic .play() calls are allowed by browser
                              try {
                                if (typeof window !== "undefined") {
                                  interface Win extends Window {
                                    AudioContext?: typeof AudioContext;
                                    webkitAudioContext?: typeof AudioContext;
                                  }
                                  const w = window as unknown as Win;
                                  const AC =
                                    w.AudioContext || w.webkitAudioContext;
                                  if (AC && !audioCtxRef.current) {
                                    audioCtxRef.current = new AC();
                                  }
                                  const ctx = audioCtxRef.current;
                                  if (ctx && ctx.state === "suspended") {
                                    void ctx.resume().catch(() => {});
                                  }
                                  // play a tiny silent buffer to fully unlock
                                  if (audioCtxRef.current) {
                                    try {
                                      const buf =
                                        audioCtxRef.current.createBuffer(
                                          1,
                                          1,
                                          audioCtxRef.current.sampleRate
                                        );
                                      const src =
                                        audioCtxRef.current.createBufferSource();
                                      src.buffer = buf;
                                      src.connect(
                                        audioCtxRef.current.destination
                                      );
                                      src.start(0);
                                      setTimeout(() => {
                                        try {
                                          src.stop();
                                        } catch {
                                          /* ignore */
                                        }
                                      }, 50);
                                    } catch {
                                      /* ignore unlock errors */
                                    }
                                  }
                                }
                              } catch {
                                /* ignore */
                              }

                              const r = recognitionRef.current;
                              if (!r)
                                throw new Error(
                                  "SpeechRecognition unavailable"
                                );
                              r.lang = lang;
                              r.start();
                              setIsListening(true);
                            } catch (err: unknown) {
                              setError(String(err));
                            }
                          }}
                          className="p-4 cursor-pointer  rounded-full
                           bg-black/80  text-white text-lg hover:bg-black/70 hover:shadow-xl shadow-lg"
                        >
                          <MicIcon className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Animated bars (only while listening) */}
                        <div className="w-56 h-12 bg rounded-2xl flex items-center -mt-8 justify-center px-4">
                          <div className="flex items-end space-x-1 h-8">
                            {Array.from({ length: 20 }).map((_, i) => (
                              <motion.div
                                key={i}
                                className="bg-black/90 rounded-sm w-1"
                                animate={
                                  isListening
                                    ? {
                                        height: [
                                          4 + (i % 6),
                                          18 - (i % 6),
                                          4 + (i % 6),
                                        ],
                                        opacity: [0.6, 1, 0.6],
                                      }
                                    : { height: 4, opacity: 0.6 }
                                }
                                transition={{
                                  repeat: isListening ? Infinity : 0,
                                  duration: 0.9,
                                  delay: i * 0.03,
                                  ease: "easeInOut",
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Language selector + transcript area */}
                    <div className="mt-4 w-full px-6 fixed bottom-0 pb-6 bg-transparent">
                      <div className="flex items-center justify-between mb-2">
                        <select
                          value={lang}
                          onChange={(e) => setLang(e.target.value)}
                          className="px-3 py-1 rounded-full bg-gray-100 text-xs"
                        >
                          <option value="en-US">English (US)</option>
                          <option value="en-GB">English (UK)</option>
                          <option value="es-ES">Spanish</option>
                          <option value="fr-FR">French</option>
                          <option value="hi-IN">Hindi</option>
                        </select>

                        <div className="flex items-center space-x-2">
                          {isPlaying ? (
                            <div className="text-xs text-green-600 ml-2">
                              Playing…
                            </div>
                          ) : null}
                          <button
                            onClick={() => {
                              setTranscript("");
                              setInterim("");
                              setError(null);
                              setAssistantReply("");
                            }}
                            className="px-3 py-1 rounded-full bg-gray-100 text-xs"
                          >
                            Clear
                          </button>

                          {isSending ? (
                            <div className="px-3 py-1 rounded-full bg-gray-200 text-xs">
                              Thinking...
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="text-center bg-white/90 rounded-md p-3 min-h-[64px] text-sm text-black">
                        {error ? (
                          <div className="text-red-600 text-xs">{error}</div>
                        ) : (
                          <>
                            <div className="text-sm text-gray-700">
                              {interim}
                            </div>
                            <div className="text-sm text-black">
                              {transcript || (
                                <span className="text-gray-400"></span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* speak assistantReply when it's updated and speakEnabled */}
                    {typeof window !== "undefined" ? null : null}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
  // speak assistant reply when updated (hook must run unconditionally)

  if (!mounted) return null;
  return createPortal(modal, document.body);
}
