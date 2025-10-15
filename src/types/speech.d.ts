// Minimal SpeechRecognition type declarations for TypeScript
// These are intentionally small and only include the members used in the app.
export {};

declare global {
  interface SpeechRecognitionEvent {
    resultIndex: number;
    results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionResultList {
    [index: number]: SpeechRecognitionResult;
    length: number;
    item(index: number): SpeechRecognitionResult | null;
  }

  interface SpeechRecognitionResult {
    isFinal: boolean;
    [index: number]: { transcript: string };
  }

  interface SpeechRecognition extends EventTarget {
    interimResults: boolean;
    continuous: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onresult: ((ev: SpeechRecognitionEvent) => void) | null;
    onerror: ((ev: Event) => void) | null;
    onend: (() => void) | null;
  }

  interface Window {
    webkitSpeechRecognition?: {
      new (): SpeechRecognition;
    };
    SpeechRecognition?: {
      new (): SpeechRecognition;
    };
  }
}
