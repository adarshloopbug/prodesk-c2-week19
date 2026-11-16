import React from 'react';
import { 
  ShieldAlert, 
  WifiOff, 
  Wifi, 
  ExternalLink, 
  RotateCcw, 
  Laptop, 
  Lock, 
  Unlock,
  X
} from 'lucide-react';

export default function SimulateCollisionPanel({
  onClose,
  onLockTicket,
  onUnlockTicket,
  onSimulateGhostDisconnect,
  onSimulateNetworkLoss,
  onSimulateReconnect,
  onResetDemo,
  isConnected,
  currentAgentName,
  locks
}) {
  const isTicket105Locked = Boolean(locks[105]);
  const lockInfo105 = locks[105];

  return (
    <div className="bg-white border border-slate-300 rounded-2xl p-5 shadow-lg animate-in slide-in-from-top-4 duration-150">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              Architecture Verification Suite
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-semibold uppercase">
                Prodesk IT Testing Tools
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Interactive test scenarios for Marcus Thorne (Director of Support Operations)
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {/* Scenario 1: The Race Condition (Ticket #105) */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-sky-800 uppercase tracking-wide">
              <span>Test 1: Agent Collision Shield</span>
              <span className="font-mono text-slate-500 font-bold">#105</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Marcus Thorne's core pain point: Agent A & Agent B trying to edit Ticket #105 at the same time.
            </p>

            <div className="mt-3 p-2.5 rounded-lg bg-white border border-slate-200 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Status of Ticket #105:</span>
                {isTicket105Locked ? (
                  <span className="text-amber-800 font-semibold flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    <Lock className="w-3 h-3 text-amber-700" /> Locked by {lockInfo105.agentName}
                  </span>
                ) : (
                  <span className="text-emerald-800 font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <Unlock className="w-3 h-3 text-emerald-700" /> Unlocked
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            {!isTicket105Locked ? (
              <button
                onClick={() => onLockTicket(105, currentAgentName)}
                className="w-full py-2 px-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
              >
                🔒 Lock Ticket #105 as "{currentAgentName}"
              </button>
            ) : (
              <button
                onClick={() => onUnlockTicket(105)}
                className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
              >
                🔓 Release Lock on Ticket #105
              </button>
            )}

            {/* Second Window button for live dual-agent test */}
            <button
              onClick={() => window.open(window.location.href, '_blank', 'width=1000,height=800')}
              className="w-full py-1.5 px-3 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 border border-slate-200 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
              <span>Open 2nd Agent Window (Live Sync Test)</span>
            </button>
          </div>
        </div>

        {/* Scenario 2: The Ghost Disconnect Handler (The Ultimate Test) */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-rose-800 uppercase tracking-wide">
              <span>Test 2: Ghost Disconnect Handler</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-semibold font-mono">SENIOR LEVEL</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              "What happens if an agent locks a ticket and closes their laptop lid without unlocking?"
            </p>

            <div className="mt-2 text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
              The server's <code className="text-rose-700 font-mono font-semibold">socket.on('disconnect')</code> searches the in-memory Map, immediately unlocks the ticket, and broadcasts the release.
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => onSimulateGhostDisconnect(105)}
              className="w-full py-2.5 px-3 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Laptop className="w-4 h-4" />
              <span>Simulate Laptop Lid Close (Drop Socket)</span>
            </button>
            <p className="text-[11px] text-center text-slate-500">
              Locks Ticket #105, severs the socket, and tests server auto-release.
            </p>
          </div>
        </div>

        {/* Scenario 3: Graceful Degradation & Network Dropped Banner */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-amber-800 uppercase tracking-wide">
              <span>Test 3: Graceful Degradation</span>
              <span className="font-mono text-slate-500 font-semibold">Track A #3</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Edge Case: Wi-Fi loss or network drop. Detects socket disconnect and displays sticky red warning banner.
            </p>

            <div className="mt-3 flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 text-xs">
              <span className="text-slate-500">Socket Connection:</span>
              <span className={`font-semibold ${isConnected ? 'text-emerald-700' : 'text-rose-700'}`}>
                {isConnected ? 'ONLINE' : 'DISCONNECTED'}
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            {isConnected ? (
              <button
                onClick={onSimulateNetworkLoss}
                className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <WifiOff className="w-3.5 h-3.5" />
                <span>Simulate Wi-Fi Loss (Trigger Banner)</span>
              </button>
            ) : (
              <button
                onClick={onSimulateReconnect}
                className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <Wifi className="w-3.5 h-3.5" />
                <span>Restore Network Connection</span>
              </button>
            )}

            <button
              onClick={onResetDemo}
              className="w-full py-1.5 px-3 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1 border border-slate-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Demo State & Clear All Locks</span>
            </button>
          </div>
        </div>
      </div>

      {/* Backend Connection Config (For Render / Railway / Custom WebSocket server) */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
        <div className="text-left">
          <span className="font-bold text-slate-800">Deployment Architecture & Remote WebSocket Server:</span>
          <p className="text-slate-500 text-[11px] mt-0.5">
            On Vercel, peer-to-peer cross-tab sync is active automatically. To link to a hosted Node/Express backend:
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="https://your-backend.onrender.com"
            defaultValue={typeof window !== 'undefined' ? localStorage.getItem('rapiddispatch_backend_url') || '' : ''}
            id="backend-url-input"
            className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 w-full sm:w-64 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
          />
          <button
            type="button"
            onClick={() => {
              const val = document.getElementById('backend-url-input')?.value?.trim();
              if (val) {
                localStorage.setItem('rapiddispatch_backend_url', val);
              } else {
                localStorage.removeItem('rapiddispatch_backend_url');
              }
              window.location.reload();
            }}
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors shadow-sm"
          >
            Save & Connect
          </button>
        </div>
      </div>
    </div>
  );
}
