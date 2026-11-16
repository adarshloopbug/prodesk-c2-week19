const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const lockManager = require('./lockManager');
const { initialTickets } = require('./ticketsData');

const app = express();
const server = http.createServer(app);

// CORS configuration for Socket.io and REST endpoints
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
};

app.use(cors(corsOptions));
app.use(express.json());

const io = new Server(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling']
});

// In-Memory Ticket Store (Mutable for demo session)
let tickets = JSON.parse(JSON.stringify(initialTickets));
let nextTicketId = 108;

// In-Memory Connected Agents Tracker: Map<socketId, { id: string, name: string, joinedAt: string }>
const connectedAgents = new Map();

// In-Memory Activity Audit Log (Last 50 real-time events)
const activityLog = [];

function pushAudit(eventType, message, metadata = {}) {
  const entry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    eventType,
    message,
    metadata,
    timestamp: new Date().toISOString()
  };
  activityLog.unshift(entry);
  if (activityLog.length > 60) activityLog.pop();
  io.emit('audit_event', entry);
}

// REST Endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'RapidDispatch Live Ops Helpdesk',
    timestamp: new Date().toISOString(),
    activeSockets: io.engine.clientsCount,
    lockedTicketsCount: Object.keys(lockManager.getAllLocks()).length
  });
});

app.get('/api/tickets', (req, res) => {
  res.json({
    tickets,
    locks: lockManager.getAllLocks()
  });
});

app.get('/api/locks', (req, res) => {
  res.json(lockManager.getAllLocks());
});

app.post('/api/reset', (req, res) => {
  tickets = JSON.parse(JSON.stringify(initialTickets));
  // Clear all locks
  for (const ticketId of Object.keys(lockManager.getAllLocks())) {
    lockManager.releaseLock(ticketId, null, true);
  }
  nextTicketId = 108;
  io.emit('dashboard_synced', {
    tickets,
    locks: lockManager.getAllLocks()
  });
  pushAudit('SYSTEM_RESET', 'Demo database and in-memory locks reset to factory state.');
  res.json({ success: true, message: 'Reset complete' });
});

// Serve frontend static build if available
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api') || req.url.startsWith('/socket.io')) {
    return next();
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.send(`
        <!DOCTYPE html>
        <html>
          <head><title>RapidDispatch Live Ops Helpdesk API Server</title></head>
          <body style="font-family: sans-serif; padding: 40px; background: #0f172a; color: #f8fafc;">
            <h1>🚚 RapidDispatch Live Ops Helpdesk Server</h1>
            <p>Node/Express/Socket.io backend running. Client UI is compiling or ready to launch.</p>
            <p>Active Connected Sockets: ${io.engine.clientsCount}</p>
          </body>
        </html>
      `);
    }
  });
});

// Socket.io Real-Time Event Handlers
io.on('connection', (socket) => {
  console.log(`[Socket Connected] ID: ${socket.id}`);

  // 1. Join Dashboard Event
  socket.on('join_dashboard', (agentData = {}) => {
    const agentName = agentData.agentName || `Agent-${socket.id.substring(0, 4)}`;
    connectedAgents.set(socket.id, {
      id: socket.id,
      name: agentName,
      joinedAt: new Date().toISOString()
    });

    console.log(`[Agent Joined] ${agentName} (${socket.id})`);

    // Send full current state to newly joined client
    socket.emit('dashboard_synced', {
      tickets,
      locks: lockManager.getAllLocks(),
      connectedAgents: Array.from(connectedAgents.values()),
      recentLogs: activityLog.slice(0, 15)
    });

    // Broadcast updated active agents roster
    io.emit('agents_updated', Array.from(connectedAgents.values()));

    pushAudit('AGENT_JOIN', `${agentName} connected to Live Ops Helpdesk.`, {
      socketId: socket.id,
      agentName
    });
  });

  // 2. Lock Ticket Event (Track B, Requirement 2)
  socket.on('lock_ticket', ({ ticketId, agentName }) => {
    const id = Number(ticketId);
    console.log(`[Lock Request] Ticket #${id} by ${agentName} (socket: ${socket.id})`);

    const lockResult = lockManager.acquireLock(id, socket.id, agentName);

    if (lockResult.success) {
      // Direct confirmation to requester
      socket.emit('lock_acquired', {
        ticketId: id,
        lock: lockResult.lock,
        alreadyOwned: lockResult.alreadyOwned || false
      });

      // Broadcast lock event to ALL connected clients immediately
      io.emit('ticket_locked', {
        ticketId: id,
        lockedBy: lockResult.lock.agentName,
        socketId: socket.id,
        lockedAt: lockResult.lock.lockedAt
      });

      if (!lockResult.alreadyOwned) {
        pushAudit('TICKET_LOCKED', `Ticket #${id} locked by ${lockResult.lock.agentName}`, {
          ticketId: id,
          lockedBy: lockResult.lock.agentName,
          socketId: socket.id
        });
      }
    } else {
      // Reject request: already locked by another agent!
      console.warn(`[Lock Rejected] Ticket #${id} is already locked by ${lockResult.currentLock.agentName}`);
      socket.emit('lock_rejected', {
        ticketId: id,
        error: lockResult.error,
        currentLock: lockResult.currentLock
      });
    }
  });

  // 3. Unlock Ticket Event (Track B, Requirement 1 & Track A, Requirement 3)
  socket.on('unlock_ticket', ({ ticketId, force = false, reason = 'manual' }) => {
    const id = Number(ticketId);
    console.log(`[Unlock Request] Ticket #${id} by socket: ${socket.id} (reason: ${reason})`);

    const releaseResult = lockManager.releaseLock(id, socket.id, force);

    if (releaseResult.success && releaseResult.wasLocked) {
      const releasedLock = releaseResult.releasedLock;
      
      // Broadcast release to all clients
      io.emit('ticket_unlocked', {
        ticketId: id,
        unlockedBy: releasedLock.agentName,
        reason,
        releasedAt: new Date().toISOString()
      });

      pushAudit('TICKET_UNLOCKED', `Ticket #${id} unlocked by ${releasedLock.agentName} (${reason})`, {
        ticketId: id,
        agentName: releasedLock.agentName,
        reason
      });
    }
  });

  // 4. Save Ticket Resolution & Auto-Unlock
  socket.on('save_resolution', ({ ticketId, resolution, status, agentName }) => {
    const id = Number(ticketId);
    const targetTicket = tickets.find(t => t.id === id);

    if (!targetTicket) {
      socket.emit('error', { message: `Ticket #${id} not found.` });
      return;
    }

    // Check lock ownership: only the lock holder can save!
    const activeLock = lockManager.getLock(id);
    if (activeLock && activeLock.socketId !== socket.id) {
      socket.emit('lock_rejected', {
        ticketId: id,
        error: `Cannot save: Ticket #${id} is held by ${activeLock.agentName}. Conflict prevented!`,
        currentLock: activeLock
      });
      return;
    }

    // Update ticket data
    targetTicket.resolution = resolution;
    if (status) targetTicket.status = status;
    targetTicket.lastUpdatedBy = agentName;
    targetTicket.updatedAt = new Date().toISOString();
    targetTicket.history.push({
      timestamp: new Date().toISOString(),
      text: `Resolution updated by ${agentName}: "${resolution.substring(0, 60)}${resolution.length > 60 ? '...' : ''}"`
    });

    // Release the lock
    lockManager.releaseLock(id, socket.id, true);

    // Broadcast ticket update to ALL connected clients
    io.emit('ticket_updated', {
      ticket: targetTicket,
      updatedBy: agentName
    });

    // Broadcast ticket unlock
    io.emit('ticket_unlocked', {
      ticketId: id,
      unlockedBy: agentName,
      reason: 'saved',
      releasedAt: new Date().toISOString()
    });

    pushAudit('RESOLUTION_SAVED', `Ticket #${id} saved & resolved by ${agentName} -> Status: ${targetTicket.status}`, {
      ticketId: id,
      agentName,
      status: targetTicket.status
    });
  });

  // 5. Create Ticket Event (Track A, Requirement 1 - Slides into UI of all clients)
  socket.on('create_ticket', (ticketPayload) => {
    const newId = nextTicketId++;
    const newTicket = {
      id: newId,
      trackingNumber: ticketPayload.trackingNumber || `RD-TX-${Math.floor(10000 + Math.random() * 90000)}`,
      truckNumber: ticketPayload.truckNumber || `TRK-${Math.floor(1000 + Math.random() * 9000)}`,
      driverName: ticketPayload.driverName || 'Unassigned Driver',
      route: ticketPayload.route || 'Dallas Hub -> Regional Route',
      freightType: ticketPayload.freightType || 'Standard Dry Van Freight',
      issue: ticketPayload.issue || 'Operational issue reported via dispatch.',
      priority: ticketPayload.priority || 'Medium',
      status: 'Open',
      createdAt: new Date().toISOString(),
      resolution: '',
      lastUpdatedBy: null,
      history: [
        { timestamp: new Date().toISOString(), text: `Ticket created by ${ticketPayload.createdBy || 'Dispatch System'}.` }
      ]
    };

    // Insert at beginning of list so it slides into top
    tickets.unshift(newTicket);

    console.log(`[Ticket Created] New Ticket #${newId} (${newTicket.truckNumber})`);

    // Broadcast new ticket to ALL connected clients
    io.emit('ticket_created', {
      ticket: newTicket,
      createdBy: ticketPayload.createdBy || 'Dispatch System'
    });

    pushAudit('TICKET_CREATED', `New Ticket #${newId} generated: ${newTicket.truckNumber} (${newTicket.issue})`, {
      ticketId: newId,
      truckNumber: newTicket.truckNumber,
      priority: newTicket.priority
    });
  });

  // 6. TRACK B, REQUIREMENT 3: THE "GHOST" DISCONNECT HANDLER (The Ultimate Test)
  socket.on('disconnect', (reason) => {
    console.log(`[Socket Disconnected] ID: ${socket.id} (Reason: ${reason})`);
    const agentInfo = connectedAgents.get(socket.id);
    const agentName = agentInfo ? agentInfo.name : `Agent-${socket.id.substring(0, 4)}`;

    connectedAgents.delete(socket.id);
    io.emit('agents_updated', Array.from(connectedAgents.values()));

    // CRITICAL: Search in-memory locks map for any locks held by this specific socket.id
    const releasedLocks = lockManager.releaseAllLocksForSocket(socket.id);

    if (releasedLocks.length > 0) {
      console.log(`🚨 [GHOST DISCONNECT RECOVERY] Socket ${socket.id} dropped connection holding ${releasedLocks.length} lock(s).`);

      releasedLocks.forEach((lock) => {
        console.log(` -> Auto-releasing lock on Ticket #${lock.ticketId} originally locked by ${lock.agentName}`);

        // Broadcast release to everyone else automatically
        io.emit('ticket_unlocked', {
          ticketId: lock.ticketId,
          unlockedBy: lock.agentName,
          reason: 'ghost_disconnect',
          message: `Ghost Disconnect Recovery: Connection dropped for ${lock.agentName}. Lock auto-released.`,
          releasedAt: new Date().toISOString()
        });

        pushAudit('GHOST_DISCONNECT_RECOVERY', `🚨 GHOST DISCONNECT: Lock on Ticket #${lock.ticketId} auto-released after ${lock.agentName} abruptly dropped connection.`, {
          ticketId: lock.ticketId,
          agentName: lock.agentName,
          socketId: socket.id,
          reason
        });
      });
    }

    pushAudit('AGENT_DISCONNECT', `${agentName} disconnected (${reason}).`, {
      socketId: socket.id,
      agentName,
      recoveredLocks: releasedLocks.length
    });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  RAPIDDISPATCH LIVE OPS HELPDESK SERVER ONLINE`);
  console.log(`  Port: http://localhost:${PORT}`);
  console.log(`  WebSocket Engine: Socket.io v4`);
  console.log(`  Ghost Disconnect Detection: ACTIVE`);
  console.log(`=======================================================`);
});
