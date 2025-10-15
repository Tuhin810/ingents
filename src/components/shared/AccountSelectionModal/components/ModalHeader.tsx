import React from "react";
import { LucideIcon } from "lucide-react";

interface ModalHeaderProps {
  platformGradient: string;
  PlatformIcon: LucideIcon;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  platformGradient,
  PlatformIcon,
}) => {
  return (
    <div
      className="relative h-40 flex items-center justify-center overflow-hidden"
      style={{ background: platformGradient }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 2px, transparent 2px), radial-gradient(circle at 80% 80%, white 2px, transparent 2px)",
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      {/* Platform Icon Container */}
      <div className="relative">
        <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-lg flex items-center justify-center border border-white/30 shadow-2xl hover:scale-105 transition-transform duration-300">
          <PlatformIcon className="w-12 h-12 text-white drop-shadow-lg" />
        </div>

        {/* Glow Effect */}
        <div className="absolute inset-0 w-24 h-24 rounded-3xl bg-white/10 blur-xl" />
      </div>
    </div>
  );
};
