import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  Save, 
  AlertTriangle, 
  Truck, 
  MapPin, 
  ShieldCheck
} from 'lucide-react';

export default function TicketEditModal({
  ticket,
  lockInfo,
  currentAgentName,
  currentSocketId,
  isOpen,
  onClose,
  onSave
}) {
  const [resolution, setResolution] = useState(ticket?.resolution || '');
  const [status, setStatus] = useState(ticket?.status || 'In Progress');
  const [customerNotified, setCustomerNotified] = useState(true);

  useEffect(() => {
    if (ticket) {
      setResolution(ticket.resolution || '');
      setStatus(ticket.status || 'In Progress');
    }
  }, [ticket]);

  if (!isOpen || !ticket) return null;

  const isHeldByMe = lockInfo && (lockInfo.socketId === currentSocketId || lockInfo.agentName === currentAgentName);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ticketId: ticket.id,
      resolution,
      status,
      customerNotified
    });
  };

  const handleCancel = () => {
    onClose(ticket.id);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 border border-sky-200 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Ticket #{ticket.id} &bull; {ticket.truckNumber}
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-200/70 text-slate-700">
                  {ticket.trackingNumber}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                RapidDispatch Resolution Terminal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Real-Time Lock Status Badge */}
            {isHeldByMe ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                Lock Secured by You
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                Locked by {lockInfo?.agentName || 'Other'}
              </span>
            )}

            <button
              onClick={handleCancel}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
              title="Close and Release Lock (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5">
            {/* Ticket Context Card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  Route: <strong className="text-slate-800">{ticket.route}</strong>
                </span>
                <span>Driver: <strong className="text-slate-800">{ticket.driverName}</strong></span>
              </div>

              <div>
                <span className="text-xs font-medium text-slate-500">Reported Freight Issue:</span>
                <p className="text-sm font-medium text-rose-900 mt-1 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                  {ticket.issue}
                </p>
              </div>

              <div className="text-xs text-slate-500">
                Cargo Manifest: <span className="text-slate-700 font-medium">{ticket.freightType}</span>
              </div>
            </div>

            {/* Resolution Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Action Taken & Dispatch Resolution Notes
                </label>
                <textarea
                  rows={4}
                  required
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Detail roadside service, towing ETA, driver relief, or shipper updates..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent font-sans resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Status Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Ticket Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                  >
                    <option value="In Progress">In Progress (Dispatching)</option>
                    <option value="Resolved">Resolved (Cleared for Transit)</option>
                    <option value="Open">Open (Pending Action)</option>
                  </select>
                </div>

                {/* Customer Notification Checkbox */}
                <div className="flex items-center sm:pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 select-none">
                    <input
                      type="checkbox"
                      checked={customerNotified}
                      onChange={(e) => setCustomerNotified(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                    <span>Transmit EDI & email confirmation to shipper</span>
                  </label>
                </div>
              </div>
            </div>

            {/* In-Memory Lock Notice */}
            <div className="flex items-center gap-2 text-xs text-sky-900 bg-sky-50 p-3 rounded-lg border border-sky-200">
              <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
              <span>
                <strong>Race Condition Shield Active:</strong> Ticket is locked exclusively under your session ({currentAgentName}). Other support agents cannot overwrite your changes.
              </span>
            </div>
          </div>

          {/* Modal Footer (Save & Close) */}
          <div className="px-6 py-4 bg-slate-50/90 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-medium border border-slate-200 transition-colors"
            >
              Close & Release Lock
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Resolution & Unlock</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
