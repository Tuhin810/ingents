import React from "react";
import { Check } from "lucide-react";

interface CelebrationOverlayProps {
  isVisible: boolean;
  platformGradient?: string;
  //   title?: string;
  //   message?: string;
}

export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({
  isVisible,
  platformGradient,
  //   title = "Success!",
  //   message = "Account connected successfully",
}) => {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 z-60 flex items-center justify-center pointer-events-none">
      {/* Success message */}
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl px-8 py-6 shadow-2xl border border-green-200 animate-bounce-in">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center animate-pulse"
            style={{ background: platformGradient || "#10b981" }}
          >
            <Check className="w-6 h-6 text-white" />
          </div>
          <div>
            {/* <h3 className="text-lg font-bold text-green-800">{title}</h3> */}
            {/* <p className="text-green-600">{message}</p> */}
          </div>
        </div>
      </div>
    </div>
  );
};
