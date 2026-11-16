/**
 * In-Memory Lock Manager for Real-Time Collaborative Helpdesk
 * Tracks active ticket locks by socket ID and agent identity.
 * Fast, atomic in-memory operations to prevent database bottlenecks and race conditions.
 */

class LockManager {
  constructor() {
    // Map<ticketId, { socketId: string, agentName: string, lockedAt: string }>
    this.locks = new Map();
  }

  /**
   * Attempt to lock a ticket for a specific socket & agent
   * @param {number|string} ticketId 
   * @param {string} socketId 
   * @param {string} agentName 
   * @returns {{ success: boolean, lock?: object, error?: string, currentLock?: object }}
   */
  acquireLock(ticketId, socketId, agentName) {
    const id = Number(ticketId);
    const existingLock = this.locks.get(id);

    if (existingLock) {
      // If the same socket already holds the lock, refresh or allow
      if (existingLock.socketId === socketId) {
        return {
          success: true,
          lock: existingLock,
          alreadyOwned: true
        };
      }

      // Ticket is locked by another agent! Strictly reject.
      return {
        success: false,
        error: `Ticket #${id} is currently locked by ${existingLock.agentName}`,
        currentLock: existingLock
      };
    }

    // Ticket is free. Grant lock.
    const newLock = {
      ticketId: id,
      socketId,
      agentName: agentName || 'Anonymous Agent',
      lockedAt: new Date().toISOString()
    };

    this.locks.set(id, newLock);
    return {
      success: true,
      lock: newLock
    };
  }

  /**
   * Release a lock on a ticket if held by the requesting socket (or force flag)
   * @param {number|string} ticketId 
   * @param {string} socketId 
   * @param {boolean} force 
   * @returns {{ success: boolean, releasedLock?: object }}
   */
  releaseLock(ticketId, socketId, force = false) {
    const id = Number(ticketId);
    const existingLock = this.locks.get(id);

    if (!existingLock) {
      return { success: true, releasedLock: null, wasLocked: false };
    }

    // Only allow releasing if socket holds the lock or if force release is permitted
    if (force || existingLock.socketId === socketId) {
      this.locks.delete(id);
      return {
        success: true,
        releasedLock: existingLock,
        wasLocked: true
      };
    }

    return {
      success: false,
      error: `Unauthorized: Socket ${socketId} cannot unlock ticket #${id} owned by ${existingLock.agentName}`,
      currentLock: existingLock
    };
  }

  /**
   * The "Ghost" Disconnect Handler
   * When an agent closes laptop lid, browser tab, or drops connection,
   * find all tickets locked by that socket.id and release them.
   * @param {string} socketId 
   * @returns {Array<object>} list of released locks
   */
  releaseAllLocksForSocket(socketId) {
    const released = [];

    for (const [ticketId, lockInfo] of this.locks.entries()) {
      if (lockInfo.socketId === socketId) {
        this.locks.delete(ticketId);
        released.push(lockInfo);
      }
    }

    return released;
  }

  /**
   * Get all active locks as an object map keyed by ticketId
   * @returns {Object.<number, object>}
   */
  getAllLocks() {
    const lockObj = {};
    for (const [ticketId, lockInfo] of this.locks.entries()) {
      lockObj[ticketId] = lockInfo;
    }
    return lockObj;
  }

  /**
   * Check if a ticket is currently locked
   * @param {number|string} ticketId 
   * @returns {boolean}
   */
  isLocked(ticketId) {
    return this.locks.has(Number(ticketId));
  }

  /**
   * Get lock info for a specific ticket
   * @param {number|string} ticketId 
   * @returns {object|null}
   */
  getLock(ticketId) {
    return this.locks.get(Number(ticketId)) || null;
  }
}

module.exports = new LockManager();
