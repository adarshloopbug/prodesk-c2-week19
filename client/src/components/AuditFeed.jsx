import React from 'react';
import { Terminal, ShieldCheck, Lock, Unlock, AlertTriangle, Sparkles } from 'lucide-react';

export default function AuditFeed({ logs }) {
  const getBadge = (eventType) => {
    switch (eventType) {
      case 'TICKET_LOCKED':
        return (
          <span className="text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1">
            <Lock className="w-2.5 h-2.5 text-amber-700" /> LOCKED
          </span>
        );
      case 'TICKET_UNLOCKED':
        return (
          <span className="text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1">
            <Unlock className="w-2.5 h-2.5 text-emerald-700" /> UNLOCKED
          </span>
        );
      case 'GHOST_DISCONNECT_RECOVERY':
        return (
          <span className="text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1">
            <AlertTriangle className="w-2.5 h-2.5 text-rose-700" /> GHOST RECOVERY
          </span>
        );
      case 'RESOLUTION_SAVED':
        return (
          <span className="text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1">
            <ShieldCheck className="w-2.5 h-2.5 text-sky-700" /> RESOLVED
          </span>
        );
      case 'TICKET_CREATED':
        return (
          <span className="text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-blue-700" /> NEW TICKET
          </span>
        );
      default:
        return (
          <span className="text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-semibold">
            {eventType}
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-sky-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Real-Time Audit Trail (WebSocket Events)
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
          Live Operational Telemetry
        </span>
      </div>

      {/* Fixed height container to completely prevent vertical layout shift or text jittering below */}
      <div className="mt-3 h-52 overflow-y-auto space-y-2 pr-1 font-sans">
        {logs.length > 0 ? (
          logs.map((log) => (
            <div
              key={log.id}
              className={`p-2.5 rounded-lg border text-xs leading-relaxed transition-colors ${
                log.eventType === 'GHOST_DISCONNECT_RECOVERY'
                  ? 'bg-rose-50/50 border-rose-200 text-rose-950'
                  : log.eventType === 'TICKET_LOCKED'
                  ? 'bg-amber-50/40 border-amber-200 text-amber-950'
                  : 'bg-slate-50/80 border-slate-200/80 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div>{getBadge(log.eventType)}</div>
                <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-xs text-slate-800 font-medium">
                {log.message}
              </p>
            </div>
          ))
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs">
            Waiting for live WebSocket events...
          </div>
        )}
      </div>
    </div>
  );
}
