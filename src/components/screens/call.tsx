
"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone } from "lucide-react";
import { useVoice } from "@/contexts/voice-context";
import type { Screen } from "@/app/page";

interface ScreenProps {
  navigate: (screen: Screen) => void;
}

export const CallScreen: React.FC<ScreenProps> = ({ navigate }) => {
  const { speak, toast } = useVoice();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
        speak("Emergency call screen. Say 'call' followed by a contact's name.");
    }, 500);
    return () => clearTimeout(timeoutId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCall = (contactName: string, phoneNumber: string) => {
    speak(`Calling ${contactName}.`);
    // Web browsers cannot initiate actual phone calls for security reasons.
    // We can show a toast notification to simulate the action.
    toast({
        title: `Calling ${contactName}`,
        description: `Dialing ${phoneNumber}... (This is a simulation)`,
    });
  }

  return (
    <div className="p-4 space-y-6 text-center fade-in">
      <div className="flex flex-col items-center text-primary">
        <Phone className="w-20 h-20" />
        <h2 className="text-3xl font-headline font-bold mt-2">EMERGENCY CALL</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Emergency Contacts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
            <button className="w-full text-left" onClick={() => handleCall('Jane Doe', '555-123-4567')}>
                <div className="flex items-center justify-between p-3 rounded-md bg-card hover:bg-primary/10 transition-colors">
                    <span>Jane Doe</span>
                    <Phone className="w-5 h-5 text-primary" />
                </div>
            </button>
             <button className="w-full text-left" onClick={() => handleCall('Emergency Services', '911')}>
                <div className="flex items-center justify-between p-3 rounded-md bg-card hover:bg-primary/10 transition-colors">
                    <span>Emergency Services</span>
                    <Phone className="w-5 h-5 text-primary" />
                </div>
            </button>
        </CardContent>
      </Card>
    </div>
  );
};
