
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bluetooth, BluetoothConnected, BluetoothSearching, XCircle, Wifi } from "lucide-react";
import { useVoice } from "@/contexts/voice-context";
import { useBluetooth } from "@/contexts/bluetooth-context";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import type { Screen } from "@/app/page";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useToast } from "@/hooks/use-toast";

interface ScreenProps {
  navigate: (screen: Screen) => void;
}

export const ConnectScreen: React.FC<ScreenProps> = ({ navigate }) => {
  const { speak } = useVoice();
  const { toast } = useToast();
  const {
    connect,
    disconnect,
    device,
    isConnecting,
    isSupported,
    error,
  } = useBluetooth();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!isSupported) {
        speak("Bluetooth is not supported on this browser. Please use Chrome or Edge to connect a device.");
      } else if (device) {
        speak("You are connected to a device. You can configure Wi-Fi or disconnect.");
      } else {
        speak("Connect to a hardware device. Say 'scan for devices' to begin pairing.");
      }
    }, 500);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device, isSupported]);

  const handleSendWifi = () => {
    // In a real application, this would send the credentials over BLE
    speak("Sending Wi-Fi credentials to the device.");
    toast({
      title: "Wi-Fi Credentials Sent",
      description: "Your device should now attempt to connect to the Wi-Fi network. (This is a simulation)",
    });
  }

  const getStatusIcon = () => {
    if (device) return <BluetoothConnected className="w-20 h-20 text-green-500" />;
    if (isConnecting) return <BluetoothSearching className="w-20 h-20 text-primary animate-pulse" />;
    return <Bluetooth className="w-20 h-20 text-muted-foreground" />;
  };

  const getStatusText = () => {
    if (device) return `Connected to: ${device.name}`;
    if (isConnecting) return "Scanning for devices...";
    return "No device connected";
  };

  return (
    <div className="p-4 space-y-6 text-center fade-in">
      <div className="flex flex-col items-center">
        {getStatusIcon()}
        <h2 className="text-2xl font-headline font-bold mt-4">{getStatusText()}</h2>
      </div>

      {!isSupported && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Bluetooth Not Supported</AlertTitle>
          <AlertDescription>
            Your browser does not support Web Bluetooth. Please use Google Chrome or Microsoft Edge.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isSupported && !device && (
        <Button onClick={connect} disabled={isConnecting} className="w-full h-16 text-lg">
          {isConnecting ? "Scanning..." : "Scan for Devices"}
        </Button>
      )}

      {isSupported && device && (
         <div className="grid grid-cols-1 gap-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Wifi /> Configure Wi-Fi</CardTitle>
                    <CardDescription>Send Wi-Fi credentials to your connected device.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-left">
                    <div className="space-y-2">
                        <Label htmlFor="ssid">Wi-Fi Name (SSID)</Label>
                        <Input id="ssid" placeholder="Your Wi-Fi Network Name" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" placeholder="Your Wi-Fi Password" />
                    </div>
                    <Button onClick={handleSendWifi} className="w-full">Send to Device</Button>
                </CardContent>
            </Card>
            <Button onClick={disconnect} variant="destructive" className="w-full h-16 text-lg">
                Disconnect
            </Button>
        </div>
      )}
    </div>
  );
};
