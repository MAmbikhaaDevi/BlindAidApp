
"use client";

import { useToast } from "@/hooks/use-toast";
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { type Screen } from '@/app/page';

interface IWindow extends Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
}

type VoiceStatus = "idle" | "listening" | "processing" | "speaking";

interface VoiceContextType {
  status: VoiceStatus;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string, onEnd?: () => void) => void;
  isSupported: boolean;
  setNavigate: (fn: (screen: Screen) => void) => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error("useVoice must be used within a VoiceProvider");
  }
  return context;
};

interface VoiceProviderProps {
  children: ReactNode;
}

export const VoiceProvider: React.FC<VoiceProviderProps> = ({ children }) => {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [recognition, setRecognition] = useState<any | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [navigate, setNavigateState] = useState<(screen: Screen) => void>(() => () => {});
  const { toast } = useToast();

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) {
        if (onEnd) onEnd();
        if (status === 'speaking') setStatus("idle");
        return;
    };
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => {
      setStatus("speaking");
    }
    utterance.onend = () => {
      setStatus("idle");
      if (onEnd) onEnd();
    };
    utterance.onerror = (e) => {
      // This error is often a browser quirk and not a critical app error.
      // The retry logic below handles it.
      setStatus("idle");
      if (onEnd) onEnd();
      
      // Fallback for some browsers that error out for no reason
      if (!window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
          setTimeout(() => window.speechSynthesis.speak(utterance), 100);
      }
    };

    window.speechSynthesis.cancel();
    setTimeout(() => window.speechSynthesis.speak(utterance), 50);
  }, [status]);

  const handleCommand = useCallback((command: string) => {
    console.log("Handling command:", command);

    if (command.includes("detect") || command.includes("look") || command.includes("scan")) {
      navigate('object-detection');
      speak("Navigating to Object Detection.");
    } else if (command.includes("emergency") || command.includes("help") || command.includes("sos")) {
      navigate('emergency');
      speak("Navigating to Emergency SOS.");
    } else if (command.includes("home") || command.includes("dashboard")) {
      navigate('dashboard');
      speak("Returning to dashboard.");
    } else {
      const spokenResponse = `Sorry, I didn't understand the command '${command}'.`;
      toast({ title: "Unknown Command", description: `You said: "${command}"`});
      speak(spokenResponse);
      return; 
    }
  }, [navigate, toast, speak]);

  const setNavigate = useCallback((fn: (screen: Screen) => void) => {
    setNavigateState(() => fn);
  }, []);

  useEffect(() => {
    const SpeechRecognition = (window as IWindow).SpeechRecognition || (window as IWindow).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.lang = 'en-US';
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      
      rec.onstart = () => {
        setStatus("listening");
        setTranscript("");
      };

      rec.onresult = (event: any) => {
        const currentTranscript = event.results[0][0].transcript.toLowerCase().trim();
        setTranscript(currentTranscript);
        setStatus("processing");
        handleCommand(currentTranscript);
      };

      rec.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
            toast({
                title: "Voice Error",
                description: `Could not understand. Error: ${event.error}`,
                variant: "destructive",
            });
        }
        setStatus("idle");
      };

      rec.onend = () => {
        if (status === 'listening') { // Ended without result
          setStatus("idle");
        }
      };

      setRecognition(rec);
    } else {
      setIsSupported(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleCommand]); 


  const startListening = useCallback(() => {
    if (recognition && (status === "idle" || status === "speaking")) {
      window.speechSynthesis.cancel(); // Stop any speaking
      try {
        recognition.start();
      } catch (error) {
        if((error as Error).name === 'InvalidStateError') {
          // It's already started, do nothing.
        } else {
            setStatus("idle");
        }
      }
    }
  }, [recognition, status]);

  const stopListening = useCallback(() => {
    if (recognition && status === "listening") {
      recognition.stop();
    }
  }, [recognition, status]);

  const value = { status, transcript, startListening, stopListening, speak, isSupported, setNavigate };

  return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>;
};
