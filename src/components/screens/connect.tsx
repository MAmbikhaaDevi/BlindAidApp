
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bluetooth, BluetoothConnected, BluetoothSearching, XCircle } from "lucide-react";
import { useVoice } from "@/contexts/voice-context";
import { useBluetooth } from "@/contexts/bluetooth-context";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import type { Screen } from "@/app/page";

interface ScreenProps {
  navigate: (screen: Screen) => void;
}

export const ConnectScreen: React.FC<ScreenProps> = ({ navigate }) => {
  const { speak } = useVoice();
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
        speak("You are connected to a device. You can disconnect if you wish.");
      } else {
        speak("Connect to a hardware device. Say 'scan for devices' to begin pairing.");
      }
    }, 500);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device, isSupported]);

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
        <Button onClick={disconnect} variant="destructive" className="w-full h-16 text-lg">
          Disconnect
        </Button>
      )}

      <Card>
        <CardHeader>
          <CardTitle>What is this?</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            This feature allows BLIND AID to connect with external hardware, like an ESP32 microcontroller, to provide physical feedback or read from sensors.
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
};
