
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { useVoice } from "./voice-context";

// These are example UUIDs. Replace them with the actual UUIDs from your ESP32 firmware.
const DEVICE_NAME = "BLIND AID Device";
const BLE_SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const BLE_CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

interface BluetoothContextType {
  connect: () => void;
  disconnect: () => void;
  device: BluetoothDevice | null;
  isConnecting: boolean;
  isSupported: boolean;
  error: string | null;
}

const BluetoothContext = createContext<BluetoothContextType | undefined>(undefined);

export const useBluetooth = () => {
  const context = useContext(BluetoothContext);
  if (!context) {
    throw new Error("useBluetooth must be used within a BluetoothProvider");
  }
  return context;
};

interface BluetoothProviderProps {
  children: ReactNode;
}

export const BluetoothProvider: React.FC<BluetoothProviderProps> = ({ children }) => {
  const [device, setDevice] = useState<BluetoothDevice | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const { toast } = useToast();
  const { speak } = useVoice();


  useEffect(() => {
    if (typeof window !== 'undefined' && 'bluetooth' in navigator) {
      setIsSupported(true);
    }
  }, []);

  const handleDisconnected = useCallback(() => {
    speak("Hardware device disconnected.");
    toast({ title: "Device Disconnected", description: device?.name || "The device has been disconnected." });
    setDevice(null);
  }, [device?.name, speak, toast]);

  const connect = useCallback(async () => {
    if (!isSupported) {
      setError("Web Bluetooth is not supported on this browser.");
      speak("Bluetooth is not supported on this browser. Please use a compatible browser like Chrome or Edge.");
      return;
    }

    setIsConnecting(true);
    setError(null);
    speak("Scanning for nearby hardware devices.");

    try {
      const bleDevice = await navigator.bluetooth.requestDevice({
        filters: [{ name: DEVICE_NAME }],
        optionalServices: [BLE_SERVICE_UUID],
      });

      if (!bleDevice.gatt) {
        throw new Error("GATT server not available.");
      }
      
      speak(`Found ${bleDevice.name}. Connecting.`);
      const server = await bleDevice.gatt.connect();
      
      // --- You can add logic here to interact with services/characteristics ---
      // const service = await server.getPrimaryService(BLE_SERVICE_UUID);
      // const characteristic = await service.getCharacteristic(BLE_CHARACTERISTIC_UUID);
      // console.log("Characteristic found:", characteristic);
      // --------------------------------------------------------------------

      setDevice(bleDevice);
      bleDevice.addEventListener('gattserverdisconnected', handleDisconnected);
      
      speak(`Successfully connected to ${bleDevice.name}.`);
      toast({ title: "Device Connected!", description: `Successfully connected to ${bleDevice.name}` });

    } catch (err: any) {
      if (err.name === 'NotFoundError') {
        setError("No devices found. Make sure your ESP32 is on and advertising.");
        speak("No devices were found. Please make sure your hardware device is turned on and nearby.");
      } else {
        setError(`Connection failed: ${err.message}`);
        speak("An error occurred while connecting to the device.");
      }
      console.error("Bluetooth connection error:", err);
    } finally {
      setIsConnecting(false);
    }
  }, [isSupported, handleDisconnected, speak, toast]);

  const disconnect = useCallback(() => {
    if (device && device.gatt) {
      device.gatt.disconnect();
      // The 'gattserverdisconnected' event will trigger the rest of the cleanup.
    }
  }, [device]);
  
  const value = { connect, disconnect, device, isConnecting, isSupported, error };

  return <BluetoothContext.Provider value={value}>{children}</BluetoothContext.Provider>;
};
