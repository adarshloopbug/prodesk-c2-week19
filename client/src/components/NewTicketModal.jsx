import React, { useState } from 'react';
import { X, PlusCircle, Sparkles } from 'lucide-react';

const PRESET_TEMPLATES = [
  {
    title: 'Dallas I-35 Engine Stall',
    truckNumber: 'TRK-5510',
    driverName: 'Billie Vance',
    route: 'Dallas Hub -> Austin, TX',
    freightType: 'Beverage Pallets (42,000 lbs)',
    issue: 'Alternator failure on I-35 South near Waxahachie. Electrical cut out.',
    priority: 'Critical'
  },
  {
    title: 'Fort Worth Reefer Temp High',
    truckNumber: 'TRK-9901',
    driverName: 'Oscar Diaz',
    route: 'Fort Worth, TX -> Kansas City, MO',
    freightType: 'Frozen Poultry (Zero Degrees Target)',
    issue: 'Reefer unit displaying high temp sensor warning: internal temp spiked to 22°F.',
    priority: 'Critical'
  },
  {
    title: 'Houston Port Customs Discrepancy',
    truckNumber: 'TRK-3211',
    driverName: 'Samantha Ray',
    route: 'Dallas Hub -> Port of Houston',
    freightType: 'Industrial Pump Assemblies (Export)',
    issue: 'Weigh station inspection hold due to carrier bill of lading discrepancy.',
    priority: 'High'
  }
];

export default function NewTicketModal({
  isOpen,
  onClose,
  onCreateTicket,
  currentAgentName
}) {
  const [truckNumber, setTruckNumber] = useState('TRK-5510');
  const [driverName, setDriverName] = useState('Billie Vance');
  const [route, setRoute] = useState('Dallas Hub -> Austin, TX');
  const [freightType, setFreightType] = useState('High-Value Consumer Electronics');
  const [issue, setIssue] = useState('Engine stall on I-35 Southbound near Waxahachie.');
  const [priority, setPriority] = useState('Critical');

  if (!isOpen) return null;

  const handleApplyPreset = (template) => {
    setTruckNumber(template.truckNumber);
    setDriverName(template.driverName);
    setRoute(template.route);
    setFreightType(template.freightType);
    setIssue(template.issue);
    setPriority(template.priority);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateTicket({
      truckNumber,
      driverName,
      route,
      freightType,
      issue,
      priority,
      createdBy: currentAgentName
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div className="px-6 py-4 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Dispatch New Support Ticket
              </h3>
              <p className="text-xs text-slate-500">
                Will broadcast immediately to all connected support desks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {/* Quick Template Buttons */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Quick Freight Scenarios
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {PRESET_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.title}
                    type="button"
                    onClick={() => handleApplyPreset(tmpl)}
                    className="p-2.5 text-left bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-lg text-xs transition-colors"
                  >
                    <div className="font-semibold text-slate-900">{tmpl.title}</div>
                    <div className="text-slate-500 text-[11px] font-mono mt-0.5">{tmpl.truckNumber}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Truck Number
                </label>
                <input
                  type="text"
                  required
                  value={truckNumber}
                  onChange={(e) => setTruckNumber(e.target.value)}
                  placeholder="TRK-XXXX"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Driver Name
                </label>
                <input
                  type="text"
                  required
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="Driver Full Name"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Route (Origin & Destination)
                </label>
                <input
                  type="text"
                  required
                  value={route}
                  onChange={(e) => setRoute(e.target.value)}
                  placeholder="Dallas, TX -> Location"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Priority Level
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500 font-medium"
                >
                  <option value="Critical">Critical (Immediate Breakdown / Temp Loss)</option>
                  <option value="High">High (Impending Delay / Hours of Service)</option>
                  <option value="Medium">Medium (Dock Queuing / Paperwork)</option>
                  <option value="Low">Low (General Inquiry)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Cargo Manifest
              </label>
              <input
                type="text"
                required
                value={freightType}
                onChange={(e) => setFreightType(e.target.value)}
                placeholder="e.g. Refrigerated Pharmaceuticals, Hazmat, Automotive"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Reported Breakdown / Incident Description
              </label>
              <textarea
                rows={3}
                required
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                placeholder="Describe current status, breakdown mile-marker, or customer issue..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500 resize-none"
              />
            </div>
          </div>

          <div className="px-6 py-4 bg-slate-50/90 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-sm"
            >
              Broadcast Ticket Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
