import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/usePWAInstall';

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-amber-500/90 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-slate-950 shadow-lg border border-amber-300 animate-bounce">
      <WifiOff className="w-4 h-4" />
      <span>Modo Offline — Seus dados continuam salvos no aparelho!</span>
    </div>
  );
};
