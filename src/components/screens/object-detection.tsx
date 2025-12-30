"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ScanLine } from "lucide-react";
import { describeImage } from "@/ai/flows/describe-image-in-detail";
import { useVoice } from "@/contexts/voice-context";
import type { Screen } from "@/app/page";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface ScreenProps {
  navigate: (screen: Screen) => void;
}

export const ObjectDetectionScreen: React.FC<ScreenProps> = ({ navigate }) => {
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { speak } = useVoice();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const getCameraPermission = async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setHasCameraPermission(true);
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings to use this app.',
          });
        }
      } else {
        setHasCameraPermission(false);
      }
    };

    getCameraPermission();

    const timeoutId = setTimeout(() => {
      speak("Object detection ready. Press the Scan button to analyze your surroundings.");
    }, 500);
    
    return () => {
        clearTimeout(timeoutId);
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDetection = async () => {
    if (!videoRef.current) return;
    setIsLoading(true);
    setDescription("");
    speak("Scanning your surroundings.");

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/jpeg');
        
        try {
            const result = await describeImage({ photoDataUri: dataUri });
            setDescription(result.description);
            speak(`Detection complete. ${result.description}.`);
        } catch (error) {
            console.error("Error describing image:", error);
            const errorMessage = "Sorry, I couldn't analyze the scene.";
            speak(errorMessage);
            toast({ title: "AI Error", description: errorMessage, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    } else {
        setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Camera View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full aspect-[9/16] rounded-lg overflow-hidden bg-gray-700">
             <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
             {isLoading && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                <ScanLine className="w-24 h-24 text-primary animate-ping" />
                <p className="text-primary font-bold mt-4">Scanning...</p>
              </div>
            )}
            {hasCameraPermission === false && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                    <Alert variant="destructive" className="w-auto">
                        <AlertTitle>Camera Access Required</AlertTitle>
                        <AlertDescription>
                            Please allow camera access to use this feature.
                        </AlertDescription>
                    </Alert>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Button onClick={handleDetection} disabled={isLoading || !hasCameraPermission} className="w-full h-14">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ScanLine className="mr-2 h-4 w-4" />}
        {isLoading ? "Scanning..." : "Scan Surroundings"}
      </Button>

      {description && (
         <Card>
            <CardHeader>
                <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
                <p>{description}</p>
            </CardContent>
         </Card>
      )}
    </div>
  );
};
