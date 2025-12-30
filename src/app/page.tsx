
"use client";

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Home, Scan, AlertTriangle, Settings } from 'lucide-react';
import { VoiceProvider } from '@/contexts/voice-context';
import { DashboardScreen } from '@/components/screens/dashboard';
import { ObjectDetectionScreen } from '@/components/screens/object-detection';
import { EmergencyScreen } from '@/components/screens/emergency';
import { SettingsScreen } from '@/components/screens/settings';
import { VoiceController } from '@/components/voice-controller';
import { useVoice } from '@/contexts/voice-context';

export type Screen = 'dashboard' | 'object-detection' | 'emergency' | 'settings';


function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const { setNavigate } = useVoice();

  const navigate = useCallback((screen: Screen) => {
    setCurrentScreen(screen);
  }, []);

  useEffect(() => {
    if (setNavigate) {
      setNavigate(navigate);
    }
  }, [navigate, setNavigate]);

  const ScreenComponent = useMemo(() => {
    switch (currentScreen) {
      case 'object-detection':
        return ObjectDetectionScreen;
      case 'emergency':
        return EmergencyScreen;
      case 'settings':
        return SettingsScreen;
      case 'dashboard':
      default:
        return DashboardScreen;
    }
  }, [currentScreen]);

  const screenTitle = useMemo(() => {
    switch (currentScreen) {
      case 'object-detection': return "Object Detection";
      case 'emergency': return "Emergency SOS";
      case 'settings': return "Settings";
      case 'dashboard':
      default:
        return "BLIND AID";
    }
  }, [currentScreen])

  return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-950 p-4">
        <div className="relative w-full max-w-sm h-[85vh] max-h-[900px] bg-background rounded-3xl shadow-2xl overflow-hidden border-4 border-gray-700/50">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-700 rounded-b-xl z-20 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-gray-800 mr-4"></div>
            <div className="w-16 h-2 rounded-full bg-gray-800"></div>
          </div>
          
          <header className="absolute top-0 left-0 right-0 z-10 p-4 pt-10 bg-card/80 backdrop-blur-sm">
            <h1 className="text-2xl font-headline text-center font-bold text-primary tracking-wider">{screenTitle}</h1>
          </header>

          <div className="h-full overflow-y-auto pt-24 pb-32">
            <ScreenComponent navigate={setCurrentScreen} />
          </div>
          
          <VoiceController />

          <footer className="absolute bottom-0 left-0 right-0 flex justify-around items-center p-2 border-t bg-card/80 backdrop-blur-sm">
            <NavButton icon={Home} label="Home" screen="dashboard" currentScreen={currentScreen} navigate={setCurrentScreen} />
            <NavButton icon={Scan} label="Detect" screen="object-detection" currentScreen={currentScreen} navigate={setCurrentScreen} />
            <NavButton icon={AlertTriangle} label="SOS" screen="emergency" currentScreen={currentScreen} navigate={setCurrentScreen} />
            <NavButton icon={Settings} label="Settings" screen="settings" currentScreen={currentScreen} navigate={setCurrentScreen} />
          </footer>

        </div>
      </main>
  );
}


export default function App() {
  return (
    <VoiceProvider>
      <AppContent />
    </VoiceProvider>
  )
}

const NavButton = ({ icon: Icon, label, screen, currentScreen, navigate }: { icon: React.ElementType, label: string, screen: Screen, currentScreen: Screen, navigate: (s: Screen) => void }) => (
    <button onClick={() => navigate(screen)} className={`flex flex-col items-center justify-center p-1 rounded-lg transition-all duration-300 w-20 h-16 ${currentScreen === screen ? 'text-primary scale-110' : 'text-muted-foreground hover:text-foreground hover:scale-105'}`}
      aria-label={label}
    >
      <Icon className="w-7 h-7" />
      <span className="text-xs mt-1 font-medium">{label}</span>
    </button>
  )
