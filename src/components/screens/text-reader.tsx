"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileText, Play } from "lucide-react";
import { describeImage } from "@/ai/flows/describe-image-in-detail";
import { useVoice } from "@/contexts/voice-context";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import type { Screen } from "@/app/page";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

interface ScreenProps {
  navigate: (screen: Screen) => void;
}

export const TextReaderScreen: React.FC<ScreenProps> = ({ navigate }) => {
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { speak } = useVoice();
  const { toast } = useToast();
  const image = PlaceHolderImages.find(p => p.id === 'text-document');

  const handleReadText = async () => {
    if (!image) return;
    setIsLoading(true);
    setDescription("");
    speak("Analyzing the image for text.");

    try {
        const response = await fetch(image.imageUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
            try {
                const base64data = reader.result as string;
                const result = await describeImage({ photoDataUri: base64data });
                setDescription(result.description);
                speak(`I've analyzed the image. Here's what I found: ${result.description}`);
            } catch(e) {
                throw e;
            } finally {
                setIsLoading(false);
            }
        };

    } catch (error) {
      console.error("Error describing image:", error);
      const errorMessage = "Sorry, I couldn't read the text from the image.";
      speak(errorMessage);
      toast({ title: "AI Error", description: errorMessage, variant: "destructive" });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
        speak("Text reader ready. Press the 'Read Text' button to analyze an image.");
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
          </div>
        </CardContent>
      </Card>
      
      <Button onClick={handleReadText} disabled={isLoading} className="w-full h-14">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
        {isLoading ? "Reading..." : "Read Text from Image"}
      </Button>

      {description && (
         <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recognized Text</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => speak(description)} aria-label="Read text aloud">
                    <Play />
                </Button>
            </CardHeader>
            <CardContent>
                <Textarea readOnly value={description} className="h-32 bg-background" />
            </CardContent>
         </Card>
      )}
    </div>
  );
};
