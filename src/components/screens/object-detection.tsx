"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ScanLine, Camera, SwitchCamera, ListTree } from "lucide-react";
import { identifyAndDescribeObjects, type IdentifyAndDescribeObjectsOutput } from "@/ai/flows/identify-and-describe-objects";
import { useVoice } from "@/contexts/voice-context";
import type { Screen } from "@/app/page";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ScreenProps {
  navigate: (screen: Screen) => void;
}

type IdentifiedObject = IdentifyAndDescribeObjectsOutput['objects'][0];

export const ObjectDetectionScreen: React.FC<ScreenProps> = ({ navigate }) => {
  const [detectedObjects, setDetectedObjects] = useState<IdentifiedObject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { speak } = useVoice();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [cameraFacingMode, setCameraFacingMode] = useState<"user" | "environment">("environment");

  const stopCameraStream = () => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
  };

  const getCameraPermission = useCallback(async (facingMode: "user" | "environment") => {
    stopCameraStream(); // Stop any existing stream
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facingMode } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
        setHasCameraPermission(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        // If the desired camera fails, try the other one
        if (facingMode === 'environment') {
            toast({
                title: 'Rear Camera Error',
                description: "Could not access rear camera. Trying front camera.",
            });
            setCameraFacingMode('user'); // This will trigger the useEffect to try again
        } else {
            toast({
                variant: 'destructive',
                title: 'Camera Access Denied',
                description: 'Please enable camera permissions in your browser settings to use this app.',
            });
        }
      }
    } else {
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Not Supported',
        description: 'Your browser does not support camera access.',
      });
    }
  }, [toast]);


  useEffect(() => {
    getCameraPermission(cameraFacingMode);
    
    return () => {
        stopCameraStream();
    };
  // We only want to re-run this when cameraFacingMode changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraFacingMode]);
  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      speak("Object detection ready. Press the Scan button to analyze your surroundings.");
    }, 500);
    return () => clearTimeout(timeoutId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleCamera = () => {
    setCameraFacingMode(prev => prev === "user" ? "environment" : "user");
    speak(cameraFacingMode === 'user' ? 'Switching to back camera' : 'Switching to front camera');
  };

  const handleDetection = async () => {
    if (!videoRef.current || !hasCameraPermission) return;
    setIsLoading(true);
    setDetectedObjects([]);
    speak("Scanning your surroundings.");

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
      if (cameraFacingMode === 'user') {
        // Flip the image horizontally for front camera
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
      }
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUri = canvas.toDataURL('image/jpeg');
      
      try {
        const result = await identifyAndDescribeObjects({ photoDataUri: dataUri });
        setDetectedObjects(result.objects);
        const summary = result.objects.length > 0
          ? `I found ${result.objects.length} objects. The main objects are: ${result.objects.map(o => o.name).slice(0,3).join(', ')}.`
          : "I could not identify any objects in the scene.";
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
             <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline style={{ transform: cameraFacingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)' }}/>
             {isLoading && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                <ScanLine className="w-24 h-24 text-primary animate-pulse" style={{ animationDuration: '2s'}} />
                <p className="text-primary font-bold mt-4 text-lg tracking-wider">Scanning...</p>
              </div>
            )}
            {hasCameraPermission === false && (
                <div className="absolute inset-0 bg-black/80 flex flex-col gap-4 items-center justify-center p-4 text-center">
                    <Camera className="w-16 h-16 text-destructive"/>
                    <Alert variant="destructive">
                        <AlertTitle>Camera Access Required</AlertTitle>
                        <AlertDescription>
                            Please allow camera access to use this feature. You may need to grant permission in your browser settings.
                        </AlertDescription>
                    </Alert>
                </div>
            )}
             <Button onClick={toggleCamera} size="icon" className="absolute top-3 right-3 rounded-full w-12 h-12 bg-black/50 hover:bg-black/75 backdrop-blur-sm" aria-label="Switch camera">
                <SwitchCamera className="w-6 h-6"/>
            </Button>
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
                <CardTitle className="flex items-center gap-2 text-primary">
                  <ListTree />
                  Detected Objects
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    {detectedObjects.map((obj, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger className="text-lg font-semibold">{obj.name}</AccordionTrigger>
                            <AccordionContent className="text-base text-muted-foreground">
                                {obj.description}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
         </Card>
      )}
    </div>
  );
};
