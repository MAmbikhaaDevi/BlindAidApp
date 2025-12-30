"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation as NavigationIcon, ArrowRight, Flag } from "lucide-react";
import { useVoice } from "@/contexts/voice-context";
import type { Screen } from "@/app/page";

interface ScreenProps {
  navigate: (screen: Screen) => void;
}

const steps = [
    "Starting route. Proceed straight for 200 feet.",
    "Turn left onto Main Street.",
    "Continue on Main Street for a quarter mile. You will pass a coffee shop on your right.",
    "Obstacle ahead: Construction on sidewalk. Please cross to the other side of the street.",
    "In 100 feet, turn right onto Park Avenue.",
    "Your destination is on the left.",
    "You have arrived."
];

export const NavigationScreen: React.FC<ScreenProps> = ({ navigate }) => {
  const [currentStep, setCurrentStep] = useState(-1);
  const [isNavigating, setIsNavigating] = useState(false);
  const { speak } = useVoice();

  const handleNavigation = () => {
    if (isNavigating) {
      // Stop navigation
      setIsNavigating(false);
      setCurrentStep(-1);
      speak("Navigation stopped.");
    } else {
      // Start navigation
      setIsNavigating(true);
      setCurrentStep(0);
      speak(steps[0]);
    }
  };

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      speak(steps[next]);
    } else {
      setIsNavigating(false);
      speak("You have reached the end of the route.");
    }
  }

  useEffect(() => {
    if(currentStep === -1) {
        const timeoutId = setTimeout(() => {
            speak("Navigation mode. Press the button to begin.");
        }, 500);
        return () => clearTimeout(timeoutId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  return (
    <div className="p-4 space-y-4 text-center">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            <MapPin className="text-primary" />
            <span>GPS Navigation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="min-h-[150px] flex items-center justify-center">
            {isNavigating ? (
                <div className="space-y-4">
                    <p className="text-lg font-bold text-foreground">{steps[currentStep]}</p>
                    <p className="text-sm text-muted-foreground">Step {currentStep + 1} of {steps.length}</p>
                </div>
            ) : (
                <p className="text-muted-foreground">Navigation has not started.</p>
            )}
        </CardContent>
      </Card>

      <Button onClick={handleNavigation} className="w-full h-14">
        <NavigationIcon className="mr-2 h-4 w-4" />
        {isNavigating ? "Stop Navigation" : "Start Mock Navigation"}
      </Button>

      {isNavigating && currentStep < steps.length -1 && (
        <Button onClick={handleNextStep} variant="secondary" className="w-full">
            Next Step <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}

      {isNavigating && currentStep === steps.length -1 && (
        <div className="flex items-center justify-center gap-2 p-4 text-primary font-bold">
            <Flag />
            <span>Destination Reached</span>
        </div>
      )}
    </div>
  );
};
