"use client";
import type { Screen } from "@/app/page";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Scan, FileText, Map, AlertTriangle, Settings, User } from "lucide-react";
import { useVoice } from "@/contexts/voice-context";
import { useEffect } from "react";

interface ScreenProps {
  navigate: (screen: Screen) => void;
}

export const DashboardScreen: React.FC<ScreenProps> = ({ navigate }) => {
  const { speak } = useVoice();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      speak("Welcome to Visionary Assistant. You are on the dashboard. You can say 'Detect objects', 'Read text', 'Navigate', or 'Emergency'.");
    }, 500);
    return () => clearTimeout(timeoutId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const features = [
    { title: "Detect Objects", description: "Identify objects in your surroundings.", icon: Scan, screen: "object-detection" },
    { title: "Read Text", description: "Read documents, signs, and more.", icon: FileText, screen: "text-reader" },
    { title: "Navigation", description: "Get step-by-step directions.", icon: Map, screen: "navigation" },
    { title: "Settings", description: "Customize your experience.", icon: Settings, screen: "settings" },
  ];

  return (
    <div className="p-4 space-y-4">
       <Card className="bg-card/50">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="bg-primary/20 text-primary p-3 rounded-full">
              <User className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="font-headline">Hello, User!</CardTitle>
              <CardDescription>What would you like to do?</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {features.map((feature) => (
          <button key={feature.title} onClick={() => navigate(feature.screen as Screen)} className="text-left">
            <Card className="h-full hover:bg-primary/10 hover:border-primary transition-all">
              <CardHeader>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="p-3 bg-primary/20 text-primary rounded-full">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-base font-headline">{feature.title}</CardTitle>
                </div>
              </CardHeader>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
};
