import React, { useState } from 'react';
import { 
  Search, 
  Lock, 
  CheckCircle, 
  Layers, 
  AlertCircle
} from 'lucide-react';
import TicketRow from './TicketRow';

export default function TicketBoard({
  tickets,
  locks,
  currentSocketId,
  currentAgentName,
  onEditTicket,
  newTicketIds
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showOnlyLocked, setShowOnlyLocked] = useState(false);

  // Stats calculation
  const totalCount = tickets.length;
  const lockedCount = Object.keys(locks).length;
  const criticalCount = tickets.filter(t => t.priority === 'Critical').length;
  const resolvedCount = tickets.filter(t => t.status === 'Resolved').length;

  // Filter tickets
  const filteredTickets = tickets.filter((t) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      t.id.toString().includes(q) ||
      (t.truckNumber && t.truckNumber.toLowerCase().includes(q)) ||
      (t.driverName && t.driverName.toLowerCase().includes(q)) ||
      (t.route && t.route.toLowerCase().includes(q)) ||
      (t.issue && t.issue.toLowerCase().includes(q)) ||
      (t.trackingNumber && t.trackingNumber.toLowerCase().includes(q));

    if (!matchesSearch) return false;
    if (filterPriority !== 'ALL' && t.priority !== filterPriority) return false;
    if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
    if (showOnlyLocked && !locks[t.id]) return false;

    return true;
  });

  return (
    <div className="space-y-5">
      {/* Real-Time Live Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Active */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-sm hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>ACTIVE TICKETS</span>
            <Layers className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
            {totalCount}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            Active dispatch incidents
          </div>
        </div>

        {/* Real-time Locked Tickets */}
        <div className="bg-white border border-amber-200 rounded-xl p-4 shadow-sm bg-amber-50/20">
          <div className="flex items-center justify-between text-amber-700 text-xs font-medium">
            <span>CURRENTLY LOCKED</span>
            <Lock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-900 mt-1 tabular-nums">
            {lockedCount}
          </div>
          <div className="text-xs text-amber-700/80 mt-0.5">
            Collision shields active
          </div>
        </div>

        {/* Critical Breakdowns */}
        <div className="bg-white border border-rose-200 rounded-xl p-4 shadow-sm bg-rose-50/20">
          <div className="flex items-center justify-between text-rose-700 text-xs font-medium">
            <span>CRITICAL INCIDENTS</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-900 mt-1 tabular-nums">
            {criticalCount}
          </div>
          <div className="text-xs text-rose-700/80 mt-0.5">
            Urgent road calls
          </div>
        </div>

        {/* Resolved */}
        <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-sm bg-emerald-50/20">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-medium">
            <span>RESOLVED TODAY</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-900 mt-1 tabular-nums">
            {resolvedCount}
          </div>
          <div className="text-xs text-emerald-700/80 mt-0.5">
            Cleared for transit
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets by ID (e.g. 105), Truck #, Driver, Route, or Cargo..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
          />
        </div>

        {/* Filter Dropdowns & Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Priority filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="Critical">Critical Only</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium</option>
          </select>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          {/* Locked only toggle */}
          <button
            onClick={() => setShowOnlyLocked(!showOnlyLocked)}
            className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-colors ${
              showOnlyLocked
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Locked ({lockedCount})</span>
          </button>
        </div>
      </div>

      {/* Main Ticket Board Table with Stable Row Heights */}
      <div className="bg-white border border-slate-200/90 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed min-w-[950px]">
            <colgroup>
              <col style={{ width: '12%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '27%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '12%' }} />
            </colgroup>
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500 h-10">
                <th className="py-2.5 px-4 sm:px-6">Ticket ID</th>
                <th className="py-2.5 px-4">Truck & Driver</th>
                <th className="py-2.5 px-4">Route & Incident</th>
                <th className="py-2.5 px-4">Priority</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Lock State</th>
                <th className="py-2.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.length > 0 ? (
                filteredTickets.map((ticket) => (
                  <TicketRow
                    key={ticket.id}
                    ticket={ticket}
                    lockInfo={locks[ticket.id]}
                    currentSocketId={currentSocketId}
                    currentAgentName={currentAgentName}
                    onEditTicket={onEditTicket}
                    isNewArrival={newTicketIds.has(ticket.id)}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-medium">No support tickets match the selected filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Stable Footer Info Banner Below Table (Completely Stable, Zero Jitter) */}
        <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 select-none">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="font-medium text-slate-600">
              Continuous WebSocket Feed &bull; 0s Polling Policy Enforced
            </span>
          </div>
          <div className="text-slate-500 tabular-nums">
            Showing {filteredTickets.length} of {tickets.length} total dispatch incidents
          </div>
        </div>
      </div>
    </div>
  );
}
