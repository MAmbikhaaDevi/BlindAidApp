"use client";
import type { Screen } from "@/app/page";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Scan, Settings, User } from "lucide-react";
import { useVoice } from "@/contexts/voice-context";
import { useEffect } from "react";

interface ScreenProps {
  navigate: (screen: Screen) => void;
}

export const DashboardScreen: React.FC<ScreenProps> = ({ navigate }) => {
  const { speak } = useVoice();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      speak("Welcome to BLIND AID. You are on the dashboard. You can say 'Detect objects' or 'Emergency'.");
    }, 500);
    return () => clearTimeout(timeoutId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const features = [
    { title: "Detect Objects", description: "Identify objects in your surroundings.", icon: Scan, screen: "object-detection" },
    // { title: "Settings", description: "Customize your experience.", icon: Settings, screen: "settings" },
  ];

  return (
    <div className="p-4 space-y-4 fade-in">
       <Card className="bg-card/50 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="bg-primary/20 text-primary p-3 rounded-full">
              <User className="w-8 h-8" />
            </div>
            <div>
              <CardTitle className="font-headline text-2xl">Hello, User!</CardTitle>
              <CardDescription>What would you like to do?</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {features.map((feature, index) => (
          <button key={feature.title} onClick={() => navigate(feature.screen as Screen)} className="text-left" style={{ animationDelay: `${index * 100}ms`}}>
            <Card className="h-full hover:bg-primary/10 hover:border-primary transition-all duration-300 transform hover:scale-105">
              <CardHeader>
                <div className="flex items-center text-left gap-4">
                  <div className="p-4 bg-primary/20 text-primary rounded-full">
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-headline">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
};
