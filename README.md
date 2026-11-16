# 🚚 RapidDispatch Freight & Logistics — Live Ops Helpdesk
### Real-Time Collaborative Helpdesk & Race Condition Elimination Engine
**Client:** Marcus Thorne, Director of Support Operations  
**Headquarters:** Dallas, TX, USA  
**Project Code Name:** Live Ops Helpdesk  
**Architectural Blueprint:** Prodesk IT Solutions

---

## 📌 Executive Summary & Problem Resolution

RapidDispatch manages thousands of freight deliveries every day with 50 active support agents. In their legacy basic CRUD application, support agents routinely suffered from **The Race Condition**:
1. Agent A opens Ticket #105 (e.g., Hazmat load seal mismatch on I-45).
2. Agent B opens Ticket #105 simultaneously and saves a resolution.
3. 30 seconds later, Agent A saves, permanently overwriting Agent B's resolution.
4. Freight shippers get duplicate emails, billing errors occur, and hundreds of man-hours are wasted.

### The Solution:
A zero-polling, bidirectional, event-driven architecture using **Node.js, Express, Socket.io, React, and an ultra-fast in-memory locking engine**. When an agent clicks a ticket, it instantly locks across every screen globally in real time, turning the row gray, showing 🔒 *"Locked by [Agent Name]"*, and strictly disabling the Edit button for all other agents.

---

## 🛠️ Architecture Overview

```
                                  +---------------------------------------+
                                  |         Express + Socket.io Server    |
                                  |           (http://localhost:3001)     |
                                  +---------------------------------------+
                                           |                      |
                    +----------------------+                      +-----------------------+
                    |                                                                     |
         [In-Memory Lock Manager]                                               [In-Memory Ticket Store]
        Map<ticketId, { socketId,                                                Fast real-time storage
         agentName, lockedAt }>                                                  with full event audit
                    |                                                                     |
                    +---------------------------------------------------------------------+
                                                       |
                                           Bi-Directional WebSockets
                                                       |
        +----------------------------------------------+----------------------------------------------+
        |                                                                                             |
+-----------------------------------+                                       +-----------------------------------+
|     Support Agent A Terminal      |                                       |     Support Agent B Terminal      |
|         (Marcus Thorne)           |                                       |        (David Rodriguez)          |
|  - Real-Time Ticket Board         |                                       |  - Real-Time Ticket Board         |
|  - Exclusive Lock Acquired        | <--- instant lock broadcast (0s) ---> |  - Row Grayed Out & 🔒 Padlock    |
|  - Resolution Modal Active        |                                       |  - Edit Button Strictly Disabled  |
+-----------------------------------+                                       +-----------------------------------+
```

---

## 🚀 Key Implementations

### Track A: Frontend Engineers (React + Socket.io-client + Tailwind CSS)

1. **The Live Ticket Board (`TicketBoard.jsx` & `TicketRow.jsx`)**:
   - Maintains a continuous, open `socket.io-client` connection.
   - **Zero Polling Policy**: Strictly no `setInterval` or periodic database fetches. State changes are purely event-driven.
   - New tickets created by any dispatcher slide smoothly into the UI of all connected clients with a real-time arrival highlight animation (`ticket-slide-in`).

2. **Presence & The Locking UI**:
   - Clicking to view/edit emits `lock_ticket` with `{ ticketId, agentName }`.
   - Broadcast handler updates all other agents' screens instantly:
     - The row turns gray with reduced opacity.
     - A 🔒 padlock icon appears.
     - Text displays: `Locked by [Agent Name]`.
     - The "Edit" button becomes strictly disabled (`disabled` attribute and cursor-not-allowed).

3. **The Release Protocol & Graceful Degradation (`ConnectionBanner.jsx`)**:
   - When the editing agent clicks "Save" or "Close", an `unlock_ticket` (or `save_resolution`) event is emitted, instantly re-enabling the ticket for everyone else.
   - **Edge Case Handling**: If the WebSocket drops (Wi-Fi loss, tunnel, network fluctuation), the UI detects `socket.on('disconnect')` and immediately renders a persistent red banner:
     `"⚠️ Connection Lost: Reconnecting... Warning: Real-time ticket locking is paused. Any unsaved edits may not be synced."`

---

### Track B: Fullstack Engineers (Node.js + Express + Socket.io)

1. **WebSocket Integration (`server.js`)**:
   - Integrated `socket.io` alongside Express HTTP server on port 3001.
   - Event contracts implemented:
     - `join_dashboard`: Registers agent identity and transmits full current dashboard state (tickets, locks, active agents).
     - `lock_ticket`: Atomically acquires ticket lock in memory and broadcasts `ticket_locked` to all clients.
     - `unlock_ticket`: Releases ticket lock and broadcasts `ticket_unlocked` to all clients.
     - `save_resolution`: Validates lock ownership, updates resolution/status, releases lock, and broadcasts updates.
     - `create_ticket`: Dispatches new freight ticket to all connected clients.

2. **In-Memory State Management (`lockManager.js`)**:
   - Fast JavaScript `Map<ticketId, { socketId, agentName, lockedAt }>` ensures atomic microsecond operations, avoiding slow relational database locking.
   - Incoming lock requests check the Map:
     - If free: grants lock and broadcasts `ticket_locked` to all connected clients.
     - If locked: immediately rejects the request with a detailed collision alert (`lock_rejected`).

3. **The "Ghost" Disconnect Handler (`server.js` -> `disconnect` listener)**:
   - **The Ultimate Test**: When an agent abruptly closes their laptop lid or terminates their browser without clicking "Unlock", the server catches the event inside `socket.on('disconnect')`.
   - The server inspects the in-memory Map for all tickets held by that specific `socket.id`, purges the locks, and broadcasts `ticket_unlocked` with `reason: 'ghost_disconnect'` to all clients!
   - Every lock recovery is streamed to the server's telemetry and the live UI audit trail.

---

## 🧪 Verification & Demonstration Suite

An automated end-to-end verification script is included at `test/verify_helpdesk.js`.

To run the verification suite:
```bash
node test/verify_helpdesk.js
```

### Verification Test Output:
- ✅ **Step 1:** Connected Agent A (Marcus Thorne) via WebSocket & synced dashboard.
- ✅ **Step 2:** Connected Agent B (David Rodriguez) via WebSocket.
- ✅ **Step 3:** Agent A locked Ticket #105. Agent B received `ticket_locked` broadcast instantly without polling.
- ✅ **Step 4:** Agent B attempted to lock Ticket #105 while Agent A held it. Server rejected Agent B and prevented collision.
- ✅ **Step 5:** Agent A saved resolution on Ticket #105. Ticket updated and lock cleanly released.
- ✅ **Step 6 (Ghost Disconnect):** Agent B locked Ticket #105 and abruptly disconnected (laptop lid close). Server's `disconnect` handler instantly detected dropped socket, purged the lock, and broadcast `ticket_unlocked` to Agent A.
- ✅ **Step 7:** New ticket created and instantly slid into UI of all clients.

---

## 💻 Running the Application

### 1. Start the Live Ops Helpdesk Server:
```bash
npm start
```
The server will start on **`http://localhost:3001`**, serving both the API, the WebSockets, and the compiled React frontend application.

### 2. Multi-Agent Testing in Browser:
- Open `http://localhost:3001` in your browser.
- Open a second tab or an Incognito window to `http://localhost:3001`.
- Switch the active agent persona in Tab 1 to **Marcus Thorne** and Tab 2 to **David Rodriguez** (or click the **"Collision & Ghost Suite"** button and click *"Open 2nd Agent Window"*).
- Click **"Edit Ticket"** on **Ticket #105** in Tab 1:
  - Watch Tab 2 instantly turn gray, display 🔒 *"Locked by Marcus Thorne"*, and freeze the Edit button!
- In Tab 1, click **"Simulate Laptop Lid Close"**:
  - Watch the server detect the ghost disconnect and instantly unlock Ticket #105 across Tab 2!
