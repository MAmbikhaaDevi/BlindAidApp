"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, Phone, ShieldOff } from "lucide-react";
import { useVoice } from "@/contexts/voice-context";
import type { Screen } from "@/app/page";
import { Progress } from "@/components/ui/progress";

interface ScreenProps {
  navigate: (screen: Screen) => void;
}

export const EmergencyScreen: React.FC<ScreenProps> = ({ navigate }) => {
  const [sosState, setSosState] = useState<"idle" | "counting" | "sent">("idle");
  const [progress, setProgress] = useState(0);
  const { speak } = useVoice();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (sosState === "counting") {
      speak("SOS will be sent in 5 seconds. Say 'cancel' or press the cancel button to stop.");
      timerRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            if(timerRef.current) clearInterval(timerRef.current);
            setSosState("sent");
            speak("SOS sent to emergency contacts and location shared.");
            return 100;
          }
          return prev + 20;
        });
      }, 1000);
      return () => {
        if(timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [sosState, speak]);
  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
        speak("Emergency screen. Say 'activate S O S' to start the countdown.");
    }, 500);
    return () => clearTimeout(timeoutId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activateSos = () => {
    if (sosState === "idle") {
      setSosState("counting");
      setProgress(0);
    }
  };

  const cancelSos = () => {
    if(timerRef.current) clearInterval(timerRef.current);
    setSosState("idle");
    setProgress(0);
    speak("SOS cancelled.");
  };

  return (
    <div className="p-4 space-y-6 text-center">
      <div className="flex flex-col items-center text-destructive">
        <AlertTriangle className="w-20 h-20" />
        <h2 className="text-3xl font-headline font-bold mt-2">EMERGENCY SOS</h2>
      </div>

      {sosState === "idle" && (
        <Button onClick={activateSos} variant="destructive" className="w-full h-24 text-2xl">
          <AlertTriangle className="mr-4 h-8 w-8" />
          Activate SOS
        </Button>
      )}

      {sosState === "counting" && (
        <div className="space-y-4">
            <p className="text-lg animate-pulse">Sending SOS in {5 - progress/20}...</p>
            <Progress value={progress} className="w-full" />
            <Button onClick={cancelSos} variant="secondary" className="w-full h-16 text-xl">
                <ShieldOff className="mr-2 h-6 w-6" />
                Cancel
            </Button>
        </div>
      )}

      {sosState === "sent" && (
        <div className="space-y-4">
            <Card className="bg-green-600 text-white">
                <CardHeader>
                    <CardTitle>SOS Sent</CardTitle>
                    <CardDescription className="text-green-200">Emergency contacts have been notified with your location.</CardDescription>
                </CardHeader>
            </Card>
             <Button onClick={() => navigate('dashboard')} variant="secondary" className="w-full">
                Return to Dashboard
            </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Emergency Contacts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded-md bg-card">
                <span>Jane Doe</span>
                <Phone className="w-4 h-4" />
            </div>
             <div className="flex items-center justify-between p-2 rounded-md bg-card">
                <span>Emergency Services</span>
                <Phone className="w-4 h-4" />
            </div>
        </CardContent>
      </Card>
    </div>
  );
};
