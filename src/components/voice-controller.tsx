"use client";

import { useVoice } from "@/contexts/voice-context";
import { Mic, MicOff, Loader, Bot } from "lucide-react";

export function VoiceController() {
  const { status, transcript, startListening, isSupported } = useVoice();

  const getStatusInfo = () => {
    switch (status) {
      case "listening":
        return { icon: <Mic className="animate-pulse text-destructive" />, text: "Listening..." };
      case "processing":
        return { icon: <Loader className="animate-spin" />, text: "Processing..." };
      case "speaking":
        return { icon: <Bot />, text: "Speaking..." };
      case "idle":
      default:
        return { icon: <Mic />, text: "Tap to Speak" };
    }
  };

  const { icon, text } = getStatusInfo();

  if (!isSupported) {
    return (
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-center">
         <div className="w-20 h-20 rounded-full bg-destructive flex items-center justify-center text-destructive-foreground">
          <MicOff />
        </div>
        <p className="text-sm text-destructive-foreground bg-destructive px-2 py-1 rounded">Voice not supported</p>
      </div>
    );
  }

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-center pointer-events-none">
      <button
        onClick={startListening}
        disabled={status !== "idle"}
        className="w-24 h-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg transition-transform duration-200 active:scale-95 disabled:opacity-50 pointer-events-auto"
        aria-label="Activate voice command"
      >
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary">
          {icon}
        </div>
      </button>
      <div className="min-h-[2.5rem] bg-black/30 backdrop-blur-sm rounded-full px-4 py-2 text-center">
        <p className="text-sm font-medium text-white">{transcript ? `"${transcript}"` : text}</p>
      </div>
    </div>
  );
}
