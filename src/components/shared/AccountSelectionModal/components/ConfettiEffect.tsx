import confetti from "canvas-confetti";

interface ConfettiEffectProps {
  platformColor?: string;
  onComplete?: () => void;
}

export const useConfettiEffect = () => {
  const fireConfetti = ({ platformColor, onComplete }: ConfettiEffectProps) => {
    const colors = [
      platformColor || "#3b82f6",
      "#10b981",
      "#f59e0b",
      "#8b5cf6",
      "#ef4444",
    ];

    // Multiple bursts for better effect
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: colors,
      shapes: ["square", "circle"],
      scalar: 1.2,
    });

    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { x: 0.25, y: 0.7 },
        colors: colors,
        shapes: ["square", "circle"],
        scalar: 0.8,
      });
    }, 200);

    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { x: 0.75, y: 0.7 },
        colors: colors,
        shapes: ["square", "circle"],
        scalar: 0.8,
      });
    }, 400);

    // Call onComplete after all confetti is fired
    if (onComplete) {
      setTimeout(onComplete, 600);
    }
  };

  return { fireConfetti };
};
