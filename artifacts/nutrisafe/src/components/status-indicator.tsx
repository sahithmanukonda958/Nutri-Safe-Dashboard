import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { SensorReadingStatus } from "@workspace/api-client-react/src/generated/api.schemas";
import { ShieldCheck, AlertTriangle, ShieldAlert } from "lucide-react";

interface StatusIndicatorProps {
  status?: SensorReadingStatus;
  isLoading?: boolean;
}

export function StatusIndicator({ status = "fresh", isLoading = false }: StatusIndicatorProps) {
  const config = {
    fresh: {
      color: "bg-fresh",
      shadow: "shadow-fresh/40",
      border: "border-fresh/30",
      text: "text-fresh",
      label: "Fresh",
      icon: ShieldCheck,
      pulse: true,
    },
    warning: {
      color: "bg-warning",
      shadow: "shadow-warning/40",
      border: "border-warning/30",
      text: "text-warning",
      label: "Warning",
      icon: AlertTriangle,
      pulse: true,
    },
    spoiled: {
      color: "bg-spoiled",
      shadow: "shadow-spoiled/40",
      border: "border-spoiled/30",
      text: "text-spoiled",
      label: "Spoiled",
      icon: ShieldAlert,
      pulse: false,
    },
  };

  const activeConfig = isLoading ? config.fresh : config[status];
  const Icon = activeConfig.icon;

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-[300px] aspect-square mx-auto">
      {/* Outer pulsing rings */}
      {!isLoading && activeConfig.pulse && (
        <>
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className={cn("absolute inset-0 rounded-full", activeConfig.color, "opacity-20")}
          />
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
            transition={{ duration: 3, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
            className={cn("absolute inset-0 rounded-full", activeConfig.color, "opacity-10")}
          />
        </>
      )}

      {/* Main Circle */}
      <div 
        className={cn(
          "relative z-10 flex flex-col items-center justify-center w-48 h-48 md:w-56 md:h-56 rounded-full border-[8px] bg-card backdrop-blur-sm shadow-2xl transition-all duration-500",
          activeConfig.border,
          activeConfig.shadow,
          isLoading && "animate-pulse opacity-50 border-muted"
        )}
      >
        <Icon className={cn("w-16 h-16 md:w-20 md:h-20 mb-2 transition-colors duration-500", isLoading ? "text-muted" : activeConfig.text)} />
        <span className={cn(
          "font-display font-bold text-2xl md:text-3xl tracking-tight transition-colors duration-500 uppercase",
          isLoading ? "text-muted" : activeConfig.text
        )}>
          {isLoading ? "Loading..." : activeConfig.label}
        </span>
      </div>
    </div>
  );
}
