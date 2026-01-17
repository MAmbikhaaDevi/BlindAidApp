"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileText, Camera, SwitchCamera } from "lucide-react";
import { readTextFromImage } from "@/ai/flows/read-text-from-image";
import { useVoice } from "@/contexts/voice-context";
import type { Screen } from "@/app/page";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface ScreenProps {
  navigate: (screen: Screen) => void;
}

export const ReadTextScreen: React.FC<ScreenProps> = ({ navigate }) => {
  const [readResult, setReadResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { speak, action, setAction, toast } = useVoice();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [cameraFacingMode, setCameraFacingMode] = useState<"user" | "environment">("environment");

  const handleReadText = useCallback(async () => {
    if (!videoRef.current || !hasCameraPermission || isLoading) return;
    
    setIsLoading(true);
    setReadResult(null);
    speak("Reading text.");

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext('2d');

    if (context) {
      if (cameraFacingMode === 'user') {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
      }
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUri = canvas.toDataURL('image/jpeg');
      
      try {
        const result = await readTextFromImage({ photoDataUri: dataUri });
        const foundText = result.text.trim();
        if (foundText && foundText.toLowerCase() !== "no text found.") {
            setReadResult(foundText);
            speak(`I found the following text: ${foundText}`);
        } else {
            setReadResult("No text found in the image.");
            speak("No text found in the image.");
        }
      } catch (error) {
          console.error("Error reading text:", error);
          const errorMessage = "Sorry, I couldn't read the text. Please try again.";
          
          let toastDescription = "An unknown error occurred. Please check the console for details.";
          if (error instanceof Error) {
            if (error.message.toLowerCase().includes('api key')) {
                toastDescription = "The AI service isn't set up. Please add the GEMINI_API_KEY as a secret to your deployment environment.";
            } else {
                toastDescription = `Details: ${error.message}`;
            }
          }
          
          speak(errorMessage);
          toast({ 
            title: "Analysis Error", 
            description: toastDescription, 
            variant: "destructive" 
          });
      } finally {
          setIsLoading(false);
      }
    } else {
        setIsLoading(false);
        speak("Could not process the image.");
        toast({ title: "Error", description: "Could not process image from camera.", variant: "destructive"});
    }
  }, [cameraFacingMode, hasCameraPermission, isLoading, speak, toast]);


  useEffect(() => {
    if (action === 'readText') {
      handleReadText();
      setAction(null);
    }
  }, [action, handleReadText, setAction]);
  
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
  }, []);

  const getCameraPermission = useCallback(async (facingMode: "user" | "environment") => {
    stopCameraStream();
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facingMode } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        streamRef.current = stream;
        setHasCameraPermission(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        if (facingMode === 'environment') {
            toast({
                title: 'Rear Camera Error',
                description: "Could not access rear camera. Trying front camera.",
            });
            setCameraFacingMode('user'); 
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
  }, [stopCameraStream, toast]);

  useEffect(() => {
    getCameraPermission(cameraFacingMode);
    
    return () => {
        stopCameraStream();
    };
  }, [cameraFacingMode, getCameraPermission, stopCameraStream]);
  
  useEffect(() => {
    // Only speak the intro if no action is pending
    if (!action) {
      const timeoutId = setTimeout(() => {
        speak("Ready to read text. Say 'read text' to analyze what the camera sees.");
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action]);

  const toggleCamera = () => {
    setCameraFacingMode(prev => prev === "user" ? "environment" : "user");
    speak(cameraFacingMode === 'user' ? 'Switching to back camera' : 'Switching to front camera');
  };

  return (
    <div className="p-4 space-y-4 fade-in">
      <Card>
        <CardContent className="p-2">
          <div className="relative w-full aspect-[9/16] md:aspect-video rounded-lg overflow-hidden bg-gray-900">
             <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline style={{ transform: cameraFacingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)' }}/>
             {isLoading && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                <FileText className="w-24 h-24 text-primary animate-pulse" style={{ animationDuration: '2s'}} />
                <p className="text-primary font-bold mt-4 text-lg tracking-wider">Reading...</p>
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
      
      <Button onClick={handleReadText} disabled={isLoading || !hasCameraPermission} className="w-full h-16 text-lg">
        {isLoading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <FileText className="mr-2 h-6 w-6" />}
        {isLoading ? "Reading..." : "Read Text"}
      </Button>

      {readResult && !isLoading && (
         <Card className="fade-in">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <FileText />
                  Text Found
                </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg whitespace-pre-wrap">{readResult}</p>
            </CardContent>
         </Card>
      )}
    </div>
  );
};
