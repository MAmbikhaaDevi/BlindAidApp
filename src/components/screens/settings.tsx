
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import type { Screen } from "@/app/page";
import { useVoice } from "@/contexts/voice-context";
import { useEffect } from "react";

interface ScreenProps {
  navigate: (screen: Screen) => void;
}

export const SettingsScreen: React.FC<ScreenProps> = ({ navigate }) => {
    const { toast } = useToast();
    const { speak } = useVoice();

    const handleSave = () => {
        toast({
            title: "Settings Saved",
            description: "Your preferences have been updated.",
        });
        speak("Settings saved successfully.");
    }
    
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            speak("Settings page. You can adjust voice speed, language, and emergency contacts.");
        }, 500);
        return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

  return (
    <div className="p-4 space-y-6 fade-in">
        <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-2 md:gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Voice Settings</CardTitle>
                    <CardDescription>Customize the assistant's voice.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="voice-speed">Voice Speed</Label>
                        <Slider defaultValue={[50]} max={100} step={10} id="voice-speed" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Slower</span>
                            <span>Faster</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="language">Language & Voice</Label>
                        <Select defaultValue="en-us">
                            <SelectTrigger id="language">
                                <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en-us">English (US) - Default</SelectItem>
                                <SelectItem value="en-gb">English (UK) - Female</SelectItem>
                                <SelectItem value="es-es">Español - Male</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Emergency Contacts</CardTitle>
                    <CardDescription>Manage your emergency contacts.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="contact1-name">Contact 1 Name</Label>
                        <Input id="contact1-name" defaultValue="Jane Doe" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="contact1-phone">Contact 1 Phone</Label>
                        <Input id="contact1-phone" type="tel" defaultValue="555-123-4567" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="contact2-name">Contact 2 Name</Label>
                        <Input id="contact2-name" defaultValue="Emergency Services" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="contact2-phone">Contact 2 Phone</Label>
                        <Input id="contact2-phone" type="tel" defaultValue="911" />
                    </div>
                </CardContent>
            </Card>
        </div>

        <Button onClick={handleSave} className="w-full h-12 text-lg">
            Save Settings
        </Button>
    </div>
  );
};
