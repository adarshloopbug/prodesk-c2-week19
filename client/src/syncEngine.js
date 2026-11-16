/**
 * RapidDispatch Live Ops Helpdesk - Cross-Tab Real-Time Sync Engine
 * Built for zero-friction Vercel deployments and multi-tab testing.
 * Automatically synchronizes locks, tickets, and ghost disconnects across tabs via BroadcastChannel.
 */

import { initialTickets } from './initialData';

class SyncEngine {
  constructor() {
    this.tabId = `tab-${Math.random().toString(36).substring(2, 8)}`;
    this.listeners = new Map();
    this.hasBroadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window;
    
    if (this.hasBroadcastChannel) {
      this.channel = new BroadcastChannel('rapiddispatch_liveops_sync');
      this.channel.onmessage = (event) => {
        const { type, data } = event.data || {};
        this.emit(type, data);
      };
    }

    // Tab close / unload handler -> Trigger Ghost Disconnect for locks held by this tab
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.handleGhostDisconnect();
      });
    }
  }

  // Subscribe to virtual events
  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(callback);
    return () => this.off(eventType, callback);
  }

  off(eventType, callback) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).delete(callback);
    }
  }

  // Emit event to local listeners
  emit(eventType, data) {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error('[SyncEngine] Callback error:', e);
        }
      });
    }
  }

  // Broadcast to other tabs & emit locally
  broadcast(eventType, data) {
    // Emit to this tab
    this.emit(eventType, data);

    // Broadcast to other open tabs
    if (this.channel) {
      this.channel.postMessage({ type: eventType, data });
    }
  }

  // Get current shared locks
  getStoredLocks() {
    try {
      const stored = localStorage.getItem('rapiddispatch_shared_locks');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  setStoredLocks(locks) {
    try {
      localStorage.setItem('rapiddispatch_shared_locks', JSON.stringify(locks));
    } catch (e) {
      console.error(e);
    }
  }

  // Get current shared tickets
  getStoredTickets() {
    try {
      const stored = localStorage.getItem('rapiddispatch_shared_tickets');
      return stored ? JSON.parse(stored) : initialTickets;
    } catch {
      return initialTickets;
    }
  }

  setStoredTickets(tickets) {
    try {
      localStorage.setItem('rapiddispatch_shared_tickets', JSON.stringify(tickets));
    } catch (e) {
      console.error(e);
    }
  }

  // In-Browser Fallback for lock_ticket
  lockTicket(ticketId, agentName) {
    const id = Number(ticketId);
    const locks = this.getStoredLocks();
    const existingLock = locks[id];

    if (existingLock) {
      if (existingLock.tabId === this.tabId) {
        return { success: true, lock: existingLock, alreadyOwned: true };
      }
      // Conflict prevented!
      this.emit('lock_rejected', {
        ticketId: id,
        error: `Ticket #${id} is currently locked by ${existingLock.agentName}`,
        currentLock: existingLock
      });
      return { success: false, currentLock: existingLock };
    }

    const newLock = {
      ticketId: id,
      socketId: this.tabId,
      tabId: this.tabId,
      agentName: agentName || 'Support Agent',
      lockedAt: new Date().toISOString()
    };

    locks[id] = newLock;
    this.setStoredLocks(locks);

    // Direct confirmation
    this.emit('lock_acquired', { ticketId: id, lock: newLock });

    // Broadcast lock to all tabs
    this.broadcast('ticket_locked', {
      ticketId: id,
      lockedBy: newLock.agentName,
      socketId: this.tabId,
      lockedAt: newLock.lockedAt
    });

    this.broadcast('audit_event', {
      id: `audit-${Date.now()}`,
      eventType: 'TICKET_LOCKED',
      message: `Ticket #${id} locked by ${newLock.agentName}`,
      timestamp: new Date().toISOString()
    });

    return { success: true, lock: newLock };
  }

  // In-Browser Fallback for unlock_ticket
  unlockTicket(ticketId, reason = 'manual') {
    const id = Number(ticketId);
    const locks = this.getStoredLocks();
    const existingLock = locks[id];

    if (existingLock) {
      delete locks[id];
      this.setStoredLocks(locks);

      this.broadcast('ticket_unlocked', {
        ticketId: id,
        unlockedBy: existingLock.agentName,
        reason,
        releasedAt: new Date().toISOString()
      });

      this.broadcast('audit_event', {
        id: `audit-${Date.now()}`,
        eventType: 'TICKET_UNLOCKED',
        message: `Ticket #${id} unlocked by ${existingLock.agentName} (${reason})`,
        timestamp: new Date().toISOString()
      });
    }
  }

  // In-Browser Fallback for save_resolution
  saveResolution(ticketId, resolution, status, agentName) {
    const id = Number(ticketId);
    const tickets = this.getStoredTickets();
    const ticket = tickets.find((t) => t.id === id);

    if (ticket) {
      ticket.resolution = resolution;
      if (status) ticket.status = status;
      ticket.lastUpdatedBy = agentName;
      ticket.updatedAt = new Date().toISOString();

      this.setStoredTickets(tickets);

      // Unlock
      const locks = this.getStoredLocks();
      delete locks[id];
      this.setStoredLocks(locks);

      this.broadcast('ticket_updated', {
        ticket,
        updatedBy: agentName
      });

      this.broadcast('ticket_unlocked', {
        ticketId: id,
        unlockedBy: agentName,
        reason: 'saved',
        releasedAt: new Date().toISOString()
      });

      this.broadcast('audit_event', {
        id: `audit-${Date.now()}`,
        eventType: 'RESOLUTION_SAVED',
        message: `Ticket #${id} saved & resolved by ${agentName} -> Status: ${ticket.status}`,
        timestamp: new Date().toISOString()
      });
    }
  }

  // In-Browser Fallback for create_ticket
  createTicket(payload, agentName) {
    const tickets = this.getStoredTickets();
    const maxId = tickets.reduce((max, t) => Math.max(max, t.id), 107);
    const newId = maxId + 1;

    const newTicket = {
      id: newId,
      trackingNumber: payload.trackingNumber || `RD-TX-${Math.floor(10000 + Math.random() * 90000)}`,
      truckNumber: payload.truckNumber || `TRK-${Math.floor(1000 + Math.random() * 9000)}`,
      driverName: payload.driverName || 'Unassigned Driver',
      route: payload.route || 'Dallas Hub -> Regional Route',
      freightType: payload.freightType || 'Standard Dry Van Freight',
      issue: payload.issue || 'Operational issue reported via dispatch.',
      priority: payload.priority || 'Medium',
      status: 'Open',
      createdAt: new Date().toISOString(),
      resolution: '',
      lastUpdatedBy: null,
      history: [
        { timestamp: new Date().toISOString(), text: `Ticket created by ${agentName || 'Dispatch'}.` }
      ]
    };

    tickets.unshift(newTicket);
    this.setStoredTickets(tickets);

    this.broadcast('ticket_created', {
      ticket: newTicket,
      createdBy: agentName
    });

    this.broadcast('audit_event', {
      id: `audit-${Date.now()}`,
      eventType: 'TICKET_CREATED',
      message: `New Ticket #${newId} generated: ${newTicket.truckNumber} (${newTicket.issue})`,
      timestamp: new Date().toISOString()
    });
  }

  // The Ghost Disconnect Handler for Closing Tabs
  handleGhostDisconnect() {
    const locks = this.getStoredLocks();
    let hasRecovered = false;

    for (const [ticketId, lockInfo] of Object.entries(locks)) {
      if (lockInfo.tabId === this.tabId) {
        delete locks[ticketId];
        hasRecovered = true;

        if (this.channel) {
          this.channel.postMessage({
            type: 'ticket_unlocked',
            data: {
              ticketId: Number(ticketId),
              unlockedBy: lockInfo.agentName,
              reason: 'ghost_disconnect',
              message: `Ghost Disconnect Recovery: Tab closed for ${lockInfo.agentName}. Lock auto-released.`,
              releasedAt: new Date().toISOString()
            }
          });

          this.channel.postMessage({
            type: 'audit_event',
            data: {
              id: `audit-${Date.now()}`,
              eventType: 'GHOST_DISCONNECT_RECOVERY',
              message: `🚨 GHOST DISCONNECT: Lock on Ticket #${ticketId} auto-released after ${lockInfo.agentName} closed tab.`,
              timestamp: new Date().toISOString()
            }
          });
        }
      }
    }

    if (hasRecovered) {
      this.setStoredLocks(locks);
    }
  }
}

export const syncEngine = new SyncEngine();
export default syncEngine;
