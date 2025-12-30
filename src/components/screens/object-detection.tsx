"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ScanLine, Tag } from "lucide-react";
import { identifyObjectsInImage } from "@/ai/flows/identify-objects";
import { useVoice } from "@/contexts/voice-context";
import type { Screen } from "@/app/page";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface ScreenProps {
  navigate: (screen: Screen) => void;
}

export const ObjectDetectionScreen: React.FC<ScreenProps> = ({ navigate }) => {
  const [detectedObjects, setDetectedObjects] = useState<string[]>([]);
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
    setDetectedObjects([]);
    speak("Scanning your surroundings.");

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/jpeg');
        
        try {
            const result = await identifyObjectsInImage({ photoDataUri: dataUri });
            setDetectedObjects(result.objects);
            const summary = `I see ${result.objects.length} objects. They are: ${result.objects.join(', ')}.`;
            speak(`Detection complete. ${summary}`);
        } catch (error) {
            console.error("Error identifying objects:", error);
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
    <div className="p-4 space-y-4 fade-in">
      <Card>
        <CardContent className="p-2">
          <div className="relative w-full aspect-[9/16] rounded-lg overflow-hidden bg-gray-900">
             <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
             {isLoading && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                <ScanLine className="w-24 h-24 text-primary animate-pulse" style={{ animationDuration: '2s'}} />
                <p className="text-primary font-bold mt-4 text-lg tracking-wider">Scanning...</p>
              </div>
            )}
            {hasCameraPermission === false && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4">
                    <Alert variant="destructive">
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
      
      <Button onClick={handleDetection} disabled={isLoading || !hasCameraPermission} className="w-full h-16 text-lg">
        {isLoading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <ScanLine className="mr-2 h-6 w-6" />}
        {isLoading ? "Scanning..." : "Scan Surroundings"}
      </Button>

      {detectedObjects.length > 0 && (
         <Card className="fade-in">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag />
                  Detected Objects
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2">
                  {detectedObjects.map((obj, index) => (
                    <Badge key={index} variant="secondary" className="text-base px-3 py-1">{obj}</Badge>
                  ))}
                </div>
            </CardContent>
         </Card>
      )}
    </div>
  );
};
