"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ScanLine } from "lucide-react";
import { summarizeNearbyObjects } from "@/ai/flows/summarize-nearby-objects";
import { useVoice } from "@/contexts/voice-context";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import type { Screen } from "@/app/page";
import { useToast } from "@/hooks/use-toast";

interface ScreenProps {
  navigate: (screen: Screen) => void;
}

// Mocked object detection results
const MOCK_OBJECTS = [
    { name: "person", box: [15, 30, 30, 60] },
    { name: "car", box: [50, 60, 45, 35] },
    { name: "traffic light", box: [60, 10, 10, 20] },
    { name: "bench", box: [5, 75, 40, 20] },
];

export const ObjectDetectionScreen: React.FC<ScreenProps> = ({ navigate }) => {
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showBoxes, setShowBoxes] = useState(false);
  const { speak } = useVoice();
  const { toast } = useToast();
  const image = PlaceHolderImages.find(p => p.id === 'street-scene');

  const handleDetection = async () => {
    setIsLoading(true);
    setShowBoxes(false);
    setSummary("");
    speak("Scanning your surroundings.");
    try {
      const objectNames = MOCK_OBJECTS.map(o => o.name);
      const result = await summarizeNearbyObjects({ objects: objectNames });
      setSummary(result.summary);
      setShowBoxes(true);
      speak(`Detection complete. ${result.summary}.`);
    } catch (error) {
      console.error("Error summarizing objects:", error);
      const errorMessage = "Sorry, I couldn't analyze the objects.";
      speak(errorMessage);
      toast({ title: "AI Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
        speak("Object detection ready. Press the Scan button to analyze your surroundings.");
    }, 500);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!image) return <p>Placeholder image not found.</p>;

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Camera View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full aspect-[9/16] rounded-lg overflow-hidden bg-gray-700">
            <Image
              src={image.imageUrl}
              alt={image.description}
              fill
              className="object-cover"
              data-ai-hint={image.imageHint}
              priority
            />
            {showBoxes && MOCK_OBJECTS.map((obj, index) => (
              <div
                key={index}
                className="absolute border-2 border-primary rounded-md flex items-start justify-start animate-in fade-in duration-500"
                style={{
                  top: `${obj.box[1]}%`,
                  left: `${obj.box[0]}%`,
                  width: `${obj.box[2]}%`,
                  height: `${obj.box[3]}%`,
                }}
              >
                <span className="bg-primary text-primary-foreground text-xs font-bold p-1 rounded-br-md rounded-tl-md">{obj.name}</span>
              </div>
            ))}
             {isLoading && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                <ScanLine className="w-24 h-24 text-primary animate-ping" />
                <p className="text-primary font-bold mt-4">Scanning...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Button onClick={handleDetection} disabled={isLoading} className="w-full h-14">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ScanLine className="mr-2 h-4 w-4" />}
        {isLoading ? "Scanning..." : "Scan Surroundings"}
      </Button>

      {summary && (
         <Card>
            <CardHeader>
                <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
                <p>{summary}</p>
            </CardContent>
         </Card>
      )}
    </div>
  );
};
