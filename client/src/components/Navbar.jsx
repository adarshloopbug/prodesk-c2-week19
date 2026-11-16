import React, { useState } from 'react';
import { 
  Truck, 
  Users, 
  PlusCircle, 
  ChevronDown, 
  ShieldCheck, 
  Cpu
} from 'lucide-react';

const PRESET_AGENTS = [
  { name: 'Marcus Thorne', role: 'Director of Support Ops', tag: 'Director' },
  { name: 'Sarah Jenkins', role: 'Senior Freight Specialist', tag: 'Agent A' },
  { name: 'David Rodriguez', role: 'Logistics Coordinator', tag: 'Agent B' },
  { name: 'Elena Rostova', role: 'Fleet Telematics Engineer', tag: 'Fleet Lead' },
  { name: 'Caleb Evans', role: 'Dispatch Support', tag: 'Agent C' }
];

export default function Navbar({
  agentName,
  onChangeAgent,
  isConnected,
  socketId,
  connectedAgents,
  onOpenNewTicket,
  onToggleSimulator
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showRoster, setShowRoster] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200/90 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo & Ops Center */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-sm shadow-sky-600/20">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-slate-900 text-base sm:text-lg">
                  RapidDispatch
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                  Dallas Ops Hub
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Live Ops Helpdesk &bull; Real-Time Multi-Agent Operations
              </p>
            </div>
          </div>

          {/* Center: Live Socket Status & Presence */}
          <div className="hidden md:flex items-center gap-3 bg-slate-50 px-3.5 py-1.5 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span className={`text-xs font-semibold ${isConnected ? 'text-emerald-700' : 'text-rose-700'}`}>
                {isConnected ? 'WebSocket Sync: Active' : 'Disconnected'}
              </span>
            </div>

            <div className="h-3.5 w-px bg-slate-200" />

            {/* Connected Agents Roster Toggle */}
            <div className="relative">
              <button 
                onClick={() => setShowRoster(!showRoster)}
                className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium transition-colors"
                title="View Connected Support Agents"
              >
                <Users className="w-3.5 h-3.5 text-sky-600" />
                <span>{connectedAgents.length} Agents Online</span>
              </button>

              {showRoster && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-50">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 pb-1 border-b border-slate-100 flex justify-between items-center">
                    <span>Active Support Desks</span>
                    <span className="text-emerald-600 font-mono font-bold">{connectedAgents.length}</span>
                  </div>
                  <ul className="space-y-1 max-h-48 overflow-y-auto">
                    {connectedAgents.map((agent) => (
                      <li key={agent.id} className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="font-medium text-slate-800 truncate flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          {agent.name} {agent.name === agentName && <span className="text-sky-600 text-[10px] font-bold">(You)</span>}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {agent.id ? agent.id.substring(0, 5) : ''}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Right Action Controls: Agent Switcher, New Ticket & Test Suite */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Agent Persona Switcher */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 border border-sky-200 flex items-center justify-center font-bold text-xs shrink-0">
                  {agentName ? agentName.charAt(0) : 'A'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="font-semibold text-slate-900 leading-tight">{agentName}</div>
                  <div className="text-[10px] text-sky-600 leading-tight">Switch Persona</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50">
                  <div className="px-2 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    Switch Active Support Agent
                  </div>
                  <div className="py-1 space-y-1">
                    {PRESET_AGENTS.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => {
                          onChangeAgent(preset.name);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          agentName === preset.name
                            ? 'bg-sky-50 text-sky-900 font-semibold border border-sky-200'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <div className="font-medium text-slate-900">{preset.name}</div>
                          <div className="text-[10px] text-slate-500">{preset.role}</div>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                          {preset.tag}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Create Ticket Button */}
            <button
              onClick={onOpenNewTicket}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">New Ticket</span>
            </button>

            {/* Test Suite Toggle */}
            <button
              onClick={onToggleSimulator}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition-colors"
              title="Test Collision & Ghost Disconnect Handlers"
            >
              <Cpu className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden lg:inline">Test Suite</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
