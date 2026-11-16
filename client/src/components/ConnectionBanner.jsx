import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function ConnectionBanner({ isConnected, onManualReconnect }) {
  if (isConnected) {
    return null;
  }

  return (
    <aside 
      role="alert" 
      aria-live="assertive"
      className="sticky top-0 z-50 bg-rose-600 text-white px-4 py-3 shadow-md border-b border-rose-700"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm font-medium">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-rose-700 rounded-lg shrink-0">
            <WifiOff className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight">
              Connection Lost: Reconnecting...
            </span>
            <span className="text-rose-100 text-xs sm:text-sm block sm:inline sm:ml-2">
              Warning: Real-time ticket locking is paused. Any unsaved edits may not be saved to RapidDispatch servers.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onManualReconnect}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-rose-700 hover:bg-rose-50 active:scale-95 rounded-lg text-xs font-bold shadow-sm transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reconnect Now</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
