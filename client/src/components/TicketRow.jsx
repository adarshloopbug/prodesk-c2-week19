import React from 'react';
import { 
  Lock, 
  Unlock, 
  Edit3, 
  MapPin, 
  Truck, 
  CheckCircle2
} from 'lucide-react';

export default function TicketRow({
  ticket,
  lockInfo,
  currentSocketId,
  currentAgentName,
  onEditTicket,
  isNewArrival
}) {
  const isLocked = Boolean(lockInfo);
  const isLockedByMe = isLocked && (lockInfo.socketId === currentSocketId || lockInfo.agentName === currentAgentName);
  const isLockedByOther = isLocked && !isLockedByMe;

  // Modern soft pastel badges
  const priorityBadges = {
    Critical: 'bg-rose-50 text-rose-700 border-rose-200',
    High: 'bg-amber-50 text-amber-700 border-amber-200',
    Medium: 'bg-sky-50 text-sky-700 border-sky-200',
    Low: 'bg-slate-100 text-slate-600 border-slate-200'
  };

  const statusBadges = {
    Open: 'bg-blue-50 text-blue-700 border-blue-200',
    'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
    Resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };

  // Row styling per Track A Requirement 2:
  // "The row turns gray... text appears: Locked by [Agent Name]... Edit button strictly disabled"
  let rowStyle = 'bg-white hover:bg-slate-50/90 text-slate-800 border-slate-200';
  if (isLockedByOther) {
    rowStyle = 'bg-slate-100/90 text-slate-500 border-slate-200/90';
  } else if (isLockedByMe) {
    rowStyle = 'bg-sky-50/50 text-slate-900 border-sky-200 shadow-sm';
  }

  return (
    <tr
      className={`border-b h-[72px] transition-colors duration-150 ${rowStyle} ${isNewArrival ? 'ticket-slide-in' : ''}`}
    >
      {/* Ticket ID & Tracking */}
      <td className="py-3 px-4 sm:px-6 whitespace-nowrap align-middle">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-sm text-sky-600">
            #{ticket.id}
          </span>
          {ticket.priority === 'Critical' && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
              URGENT
            </span>
          )}
        </div>
        <div className="text-[11px] font-mono text-slate-400 mt-0.5">
          {ticket.trackingNumber}
        </div>
      </td>

      {/* Truck & Driver Info */}
      <td className="py-3 px-4 whitespace-nowrap align-middle">
        <div className="flex items-center gap-1.5">
          <Truck className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-xs sm:text-sm text-slate-800">
            {ticket.truckNumber}
          </span>
        </div>
        <div className="text-xs text-slate-500 mt-0.5">
          {ticket.driverName}
        </div>
      </td>

      {/* Route & Cargo Incident */}
      <td className="py-3 px-4 max-w-xs sm:max-w-md align-middle">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
          <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
          <span className="truncate">{ticket.route}</span>
        </div>
        <div className="text-xs text-slate-600 mt-0.5 line-clamp-1">
          {ticket.issue}
        </div>
        <div className="text-[11px] text-slate-400 mt-0.5 truncate">
          Cargo: {ticket.freightType}
        </div>
      </td>

      {/* Priority Badge */}
      <td className="py-3 px-4 whitespace-nowrap align-middle">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${
            priorityBadges[ticket.priority] || priorityBadges.Medium
          }`}
        >
          {ticket.priority}
        </span>
      </td>

      {/* Status Badge */}
      <td className="py-3 px-4 whitespace-nowrap align-middle">
        <div className="h-10 flex flex-col justify-center">
          <div>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${
                statusBadges[ticket.status] || statusBadges.Open
              }`}
            >
              {ticket.status === 'Resolved' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
              {ticket.status}
            </span>
          </div>
          {ticket.lastUpdatedBy && (
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">
              By: {ticket.lastUpdatedBy}
            </div>
          )}
        </div>
      </td>

      {/* Concurrency Lock Status Column (Zero Height Jitter) */}
      <td className="py-3 px-4 whitespace-nowrap align-middle">
        <div className="h-10 flex items-center">
          {isLockedByOther ? (
            // LOCKED BY ANOTHER AGENT: Padlock icon + "Locked by [Agent Name]"
            <div className="inline-flex items-center gap-2 bg-amber-50/90 border border-amber-200/90 px-2.5 py-1 rounded-lg">
              <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-amber-900">
                  Locked by {lockInfo.agentName}
                </span>
                <span className="text-[10px] text-amber-700 ml-1.5 font-mono">
                  {lockInfo.lockedAt ? new Date(lockInfo.lockedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
              </div>
            </div>
          ) : isLockedByMe ? (
            // LOCKED BY CURRENT USER (YOU)
            <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-lg">
              <Unlock className="w-3.5 h-3.5 text-sky-700 shrink-0" />
              <div className="text-xs font-semibold text-sky-900">
                Editing (You hold the lock)
              </div>
            </div>
          ) : (
            // UNLOCKED / AVAILABLE
            <div className="inline-flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-medium text-slate-600">Available</span>
            </div>
          )}
        </div>
      </td>

      {/* ACTIONS: Strictly disabled when locked by another agent */}
      <td className="py-3 px-4 sm:px-6 whitespace-nowrap text-right align-middle">
        <div className="h-10 flex items-center justify-end">
          {isLockedByOther ? (
            // STRICTLY DISABLED EDIT BUTTON FOR EVERYONE EXCEPT AGENT HOLDING THE LOCK
            <button
              disabled
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed select-none"
              title={`Locked by ${lockInfo.agentName}. You cannot edit until released.`}
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Edit Disabled</span>
            </button>
          ) : isLockedByMe ? (
            // Current agent holds lock: continue editing
            <button
              onClick={() => onEditTicket(ticket)}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 active:scale-95 text-white shadow-sm transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Continue Edit</span>
            </button>
          ) : (
            // Free ticket: click to lock and edit
            <button
              onClick={() => onEditTicket(ticket)}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200 hover:border-sky-300 shadow-sm transition-all"
            >
              <Edit3 className="w-3.5 h-3.5 text-sky-600" />
              <span>Edit Ticket</span>
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
