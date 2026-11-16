import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import socket from './socket';
import Navbar from './components/Navbar';
import ConnectionBanner from './components/ConnectionBanner';
import TicketBoard from './components/TicketBoard';
import TicketEditModal from './components/TicketEditModal';
import NewTicketModal from './components/NewTicketModal';
import SimulateCollisionPanel from './components/SimulateCollisionPanel';
import AuditFeed from './components/AuditFeed';
import { Info, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [socketId, setSocketId] = useState(socket.id || '');
  const [agentName, setAgentName] = useState(() => {
    return localStorage.getItem('rapiddispatch_agent') || 'Marcus Thorne';
  });

  // Core Real-Time State
  const [tickets, setTickets] = useState([]);
  const [locks, setLocks] = useState({}); // { [ticketId]: { socketId, agentName, lockedAt } }
  const [connectedAgents, setConnectedAgents] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [newTicketIds, setNewTicketIds] = useState(new Set());

  // UI Modals & Panels
  const [editingTicket, setEditingTicket] = useState(null);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.id === prev?.id ? null : prev));
    }, 4000);
  };

  // Sync Agent Name to localStorage & announce on change
  const handleChangeAgent = (newName) => {
    setAgentName(newName);
    localStorage.setItem('rapiddispatch_agent', newName);
    if (socket.connected) {
      socket.emit('join_dashboard', { agentName: newName });
    }
    showToast(`Switched active agent persona to: ${newName}`, 'info');
  };

  // Socket Connection and Event Listeners
  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      setSocketId(socket.id);
      socket.emit('join_dashboard', { agentName });
      showToast('Connected to RapidDispatch Live Ops Real-Time Server', 'success');
    }

    function onDisconnect(reason) {
      setIsConnected(false);
      showToast('Connection lost! Reconnecting to RapidDispatch servers...', 'error');
    }

    function onConnectError(err) {
      setIsConnected(false);
    }

    function onDashboardSynced(data) {
      setTickets(data.tickets || []);
      setLocks(data.locks || {});
      setConnectedAgents(data.connectedAgents || []);
      if (data.recentLogs) {
        setAuditLogs(data.recentLogs);
      }
    }

    // Real-Time Ticket Lock Broadcast (Track A Requirement 2)
    function onTicketLocked(data) {
      setLocks((prev) => ({
        ...prev,
        [data.ticketId]: {
          socketId: data.socketId,
          agentName: data.lockedBy,
          lockedAt: data.lockedAt
        }
      }));
    }

    // Real-Time Ticket Unlock Broadcast (Track A Requirement 3 & Ghost Recovery)
    function onTicketUnlocked(data) {
      setLocks((prev) => {
        const nextLocks = { ...prev };
        delete nextLocks[data.ticketId];
        return nextLocks;
      });

      if (data.reason === 'ghost_disconnect') {
        showToast(data.message || `Ghost Disconnect Recovery: Ticket #${data.ticketId} auto-released!`, 'warning');
      }
    }

    // Direct Lock Confirmations for This Client
    function onLockAcquired(data) {
      const targetTicket = tickets.find((t) => t.id === data.ticketId);
      if (targetTicket) {
        setEditingTicket(targetTicket);
      }
    }

    function onLockRejected(data) {
      showToast(data.error || `Ticket #${data.ticketId} is already locked by another agent!`, 'error');
    }

    // Real-Time New Ticket Creation Broadcast (Track A Requirement 1)
    function onTicketCreated(data) {
      setTickets((prev) => {
        if (prev.some((t) => t.id === data.ticket.id)) return prev;
        return [data.ticket, ...prev];
      });

      // Mark for highlight fade animation
      setNewTicketIds((prev) => new Set(prev).add(data.ticket.id));
      setTimeout(() => {
        setNewTicketIds((prev) => {
          const next = new Set(prev);
          next.delete(data.ticket.id);
          return next;
        });
      }, 3500);

      showToast(`New Breakdown Alert: Ticket #${data.ticket.id} (${data.ticket.truckNumber}) dispatched!`, 'info');
    }

    // Real-Time Ticket Resolution Update Broadcast
    function onTicketUpdated(data) {
      setTickets((prev) =>
        prev.map((t) => (t.id === data.ticket.id ? data.ticket : t))
      );
      showToast(`Ticket #${data.ticket.id} resolution saved by ${data.updatedBy}`, 'success');
    }

    function onAgentsUpdated(agents) {
      setConnectedAgents(agents || []);
    }

    function onAuditEvent(entry) {
      setAuditLogs((prev) => [entry, ...prev.slice(0, 50)]);
    }

    // Register socket listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('dashboard_synced', onDashboardSynced);
    socket.on('ticket_locked', onTicketLocked);
    socket.on('ticket_unlocked', onTicketUnlocked);
    socket.on('lock_acquired', onLockAcquired);
    socket.on('lock_rejected', onLockRejected);
    socket.on('ticket_created', onTicketCreated);
    socket.on('ticket_updated', onTicketUpdated);
    socket.on('agents_updated', onAgentsUpdated);
    socket.on('audit_event', onAuditEvent);

    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('dashboard_synced', onDashboardSynced);
      socket.off('ticket_locked', onTicketLocked);
      socket.off('ticket_unlocked', onTicketUnlocked);
      socket.off('lock_acquired', onLockAcquired);
      socket.off('lock_rejected', onLockRejected);
      socket.off('ticket_created', onTicketCreated);
      socket.off('ticket_updated', onTicketUpdated);
      socket.off('agents_updated', onAgentsUpdated);
      socket.off('audit_event', onAuditEvent);
    };
  }, [agentName, tickets]);

  // Action: User clicks "Edit" on a ticket (Track A Requirement 2)
  const handleEditTicket = (ticket) => {
    const existingLock = locks[ticket.id];
    const isLockedByMe = existingLock && (existingLock.socketId === socket.id || existingLock.agentName === agentName);

    if (existingLock && !isLockedByMe) {
      showToast(`Collision Prevented: Ticket #${ticket.id} is currently locked by ${existingLock.agentName}!`, 'error');
      return;
    }

    // Emit lock_ticket event to server
    socket.emit('lock_ticket', {
      ticketId: ticket.id,
      agentName
    });

    setEditingTicket(ticket);
  };

  // Action: User clicks "Save" resolution (Track A Requirement 3)
  const handleSaveTicket = ({ ticketId, resolution, status }) => {
    socket.emit('save_resolution', {
      ticketId,
      resolution,
      status,
      agentName
    });
    setEditingTicket(null);
  };

  // Action: User closes or cancels edit modal (Track A Requirement 3)
  const handleCloseEditModal = (ticketId) => {
    socket.emit('unlock_ticket', {
      ticketId,
      reason: 'user_closed'
    });
    setEditingTicket(null);
  };

  // Action: User creates new ticket (Track A Requirement 1)
  const handleCreateTicket = (ticketData) => {
    socket.emit('create_ticket', ticketData);
  };

  // Action: Reset demo state
  const handleResetDemo = async () => {
    try {
      await fetch('/api/reset', { method: 'POST' });
      showToast('Demo environment and locks successfully reset', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  // Test Harness: Direct Lock Ticket
  const handleDirectLock = (ticketId, lockingAgent) => {
    socket.emit('lock_ticket', {
      ticketId,
      agentName: lockingAgent || agentName
    });
  };

  // Test Harness: Direct Unlock Ticket
  const handleDirectUnlock = (ticketId) => {
    socket.emit('unlock_ticket', {
      ticketId,
      force: true,
      reason: 'manual_override'
    });
  };

  // Test Harness: Simulate Ghost Disconnect (The Ultimate Test)
  const handleSimulateGhostDisconnect = (ticketId = 105) => {
    showToast(`Initiating Ghost Disconnect simulation on Ticket #${ticketId}...`, 'info');
    
    const ghostSocket = io(window.location.origin || 'http://localhost:3001', {
      transports: ['websocket']
    });

    ghostSocket.on('connect', () => {
      ghostSocket.emit('join_dashboard', { agentName: 'Agent-Ghost (Dallas Desk 4B)' });
      
      // Step 1: Ghost agent locks ticket
      ghostSocket.emit('lock_ticket', {
        ticketId,
        agentName: 'Agent-Ghost (Dallas Desk 4B)'
      });

      // Step 2: 1.2s later, simulate abrupt laptop lid close (disconnect without unlock)
      setTimeout(() => {
        ghostSocket.disconnect();
        showToast(`Ghost socket dropped connection! Server auto-releasing lock on Ticket #${ticketId}...`, 'warning');
      }, 1200);
    });
  };

  // Test Harness: Simulate Network Loss (Track A Requirement 3 Red Banner Test)
  const handleSimulateNetworkLoss = () => {
    socket.disconnect();
  };

  const handleSimulateReconnect = () => {
    socket.connect();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Track A Requirement 3: Edge Case Connection Lost Red Banner */}
      <ConnectionBanner
        isConnected={isConnected}
        onManualReconnect={handleSimulateReconnect}
      />

      {/* Top Navigation */}
      <Navbar
        agentName={agentName}
        onChangeAgent={handleChangeAgent}
        isConnected={isConnected}
        socketId={socketId}
        connectedAgents={connectedAgents}
        onOpenNewTicket={() => setIsNewTicketOpen(true)}
        onToggleSimulator={() => setShowSimulator(!showSimulator)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Prodesk IT / Architecture Verification Testing Dock */}
        {showSimulator && (
          <SimulateCollisionPanel
            onClose={() => setShowSimulator(false)}
            onLockTicket={handleDirectLock}
            onUnlockTicket={handleDirectUnlock}
            onSimulateGhostDisconnect={handleSimulateGhostDisconnect}
            onSimulateNetworkLoss={handleSimulateNetworkLoss}
            onSimulateReconnect={handleSimulateReconnect}
            onResetDemo={handleResetDemo}
            isConnected={isConnected}
            currentAgentName={agentName}
            locks={locks}
          />
        )}

        {/* Live Ticket Board (Track A Requirement 1, 2, 3) */}
        <TicketBoard
          tickets={tickets}
          locks={locks}
          currentSocketId={socketId}
          currentAgentName={agentName}
          onEditTicket={handleEditTicket}
          newTicketIds={newTicketIds}
        />

        {/* Real-Time WebSocket Audit Stream */}
        <div className="mt-8">
          <AuditFeed logs={auditLogs} />
        </div>
      </main>

      {/* Edit Ticket Modal */}
      {editingTicket && (
        <TicketEditModal
          ticket={editingTicket}
          lockInfo={locks[editingTicket.id]}
          currentAgentName={agentName}
          currentSocketId={socketId}
          isOpen={Boolean(editingTicket)}
          onClose={handleCloseEditModal}
          onSave={handleSaveTicket}
        />
      )}

      {/* New Ticket Modal */}
      {isNewTicketOpen && (
        <NewTicketModal
          isOpen={isNewTicketOpen}
          onClose={() => setIsNewTicketOpen(false)}
          onCreateTicket={handleCreateTicket}
          currentAgentName={agentName}
        />
      )}

      {/* Toast Notification Container */}
      {toastMessage && (
        <div 
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150"
        >
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-xs sm:text-sm font-medium border bg-white ${
              toastMessage.type === 'error'
                ? 'border-rose-200 text-rose-900 shadow-rose-100'
                : toastMessage.type === 'warning'
                ? 'border-amber-200 text-amber-900 shadow-amber-100'
                : 'border-sky-200 text-slate-800 shadow-sky-100'
            }`}
          >
            {toastMessage.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
            {toastMessage.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
            {toastMessage.type === 'info' && <Info className="w-4 h-4 text-sky-600 shrink-0" />}
            {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
            <span>{toastMessage.message}</span>
          </div>
        </div>
      )}

      {/* Stable Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="font-medium text-slate-600">
            RapidDispatch Freight & Logistics &bull; Dallas Support Operations Center
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Node.js &bull; Express &bull; Socket.io &bull; React &bull; Tailwind CSS
          </div>
        </div>
      </footer>
    </div>
  );
}
