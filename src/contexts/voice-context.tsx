
"use client";

import { useToast } from "@/hooks/use-toast";
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { type Screen } from '@/app/page';
import { answerQuestion } from "@/ai/flows/answer-question";

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
  
  const setNavigate = (fn: (screen: Screen) => void) => {
    setNavigateState(() => fn);
  };

  const handleCommand = useCallback(async (command: string) => {
    console.log("Handling command:", command);
    setStatus("processing");

    const lowerCaseCommand = command.toLowerCase();

    if (lowerCaseCommand.includes("detect") || lowerCaseCommand.includes("look") || lowerCaseCommand.includes("scan")) {
      navigate('object-detection');
    } else if (lowerCaseCommand.includes("emergency") || lowerCaseCommand.includes("help") || lowerCaseCommand.includes("sos")) {
      navigate('emergency');
    } else if (lowerCaseCommand.includes("home") || lowerCaseCommand.includes("dashboard")) {
      navigate('dashboard');
    } else if (lowerCaseCommand.includes("cancel") || lowerCaseCommand.includes("stop")) {
        // This is a special command that might be used in other screens (like SOS)
        // We can just speak a confirmation and let the screen handle its state.
        speak("Cancelled.");
        setStatus('idle');
    } else {
        try {
            const { response } = await answerQuestion({ query: command });
            speak(response);
        } catch (error) {
            console.error("Error answering question:", error);
            const errorMessage = "Sorry, I had trouble understanding that.";
            speak(errorMessage);
            toast({ title: "AI Error", description: errorMessage, variant: "destructive" });
        }
    }
  }, [navigate, speak, toast]);


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
        const currentTranscript = event.results[0][0].transcript.trim();
        setTranscript(currentTranscript);
        handleCommand(currentTranscript);
      };

      rec.onerror = (event: any) => {
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
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
            console.error("Speech recognition start error:", error);
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
