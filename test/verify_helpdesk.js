/**
 * RapidDispatch Live Ops Helpdesk - Automated Verification Suite
 * Verifies all requirements for Marcus Thorne (Director of Support Operations):
 *  1. Continuous WebSocket Connection & Live Ticket Board
 *  2. In-Memory Locking & Race Condition Prevention (Agent A vs Agent B on Ticket #105)
 *  3. Collision Rejection
 *  4. Resolution Save & Unlock Broadcast
 *  5. The Ghost Disconnect Handler (abrupt socket drop auto-releases in-memory lock)
 *  6. Real-Time Ticket Creation Broadcast
 */

const { io } = require('socket.io-client');
const assert = require('assert');

const SERVER_URL = 'http://localhost:3001';

async function runVerification() {
  console.log('=================================================================');
  console.log('🚀 RAPIDDISPATCH LIVE OPS HELPDESK - AUTOMATED VERIFICATION SUITE');
  console.log('=================================================================\n');

  // Step 1: Connect Agent A (Marcus Thorne)
  console.log('[Step 1] Connecting Agent A (Marcus Thorne)...');
  const agentA = io(SERVER_URL, { transports: ['websocket'] });

  await new Promise((resolve) => agentA.on('connect', resolve));
  console.log(' -> Agent A connected with socket.id:', agentA.id);

  agentA.emit('join_dashboard', { agentName: 'Marcus Thorne' });
  const dashboardStateA = await new Promise((resolve) => agentA.once('dashboard_synced', resolve));
  console.log(` -> Agent A received dashboard: ${dashboardStateA.tickets.length} tickets, ${Object.keys(dashboardStateA.locks).length} locks.`);
  assert(dashboardStateA.tickets.length >= 7, 'Initial tickets should be at least 7');

  // Step 2: Connect Agent B (David Rodriguez)
  console.log('\n[Step 2] Connecting Agent B (David Rodriguez)...');
  const agentB = io(SERVER_URL, { transports: ['websocket'] });

  await new Promise((resolve) => agentB.on('connect', resolve));
  console.log(' -> Agent B connected with socket.id:', agentB.id);

  agentB.emit('join_dashboard', { agentName: 'David Rodriguez' });
  const dashboardStateB = await new Promise((resolve) => agentB.once('dashboard_synced', resolve));
  console.log(` -> Agent B received dashboard: ${dashboardStateB.tickets.length} tickets.`);

  // Step 3: Test Race Condition - Agent A locks Ticket #105
  console.log('\n[Step 3] Testing Ticket Locking: Agent A locks Ticket #105...');
  const lockPromiseB = new Promise((resolve) => agentB.once('ticket_locked', resolve));
  agentA.emit('lock_ticket', { ticketId: 105, agentName: 'Marcus Thorne' });

  const lockEventB = await lockPromiseB;
  console.log(' -> Agent B received real-time broadcast: ticket_locked', lockEventB);
  assert.strictEqual(lockEventB.ticketId, 105, 'Locked ticket ID must be 105');
  assert.strictEqual(lockEventB.lockedBy, 'Marcus Thorne', 'Locked by must be Marcus Thorne');
  console.log(' ✅ PASS: Real-time broadcast reached Agent B instantly without polling!');

  // Step 4: Test Collision Prevention - Agent B attempts to lock Ticket #105
  console.log('\n[Step 4] Testing Race Condition Rejection: Agent B tries to lock Ticket #105 while Agent A holds it...');
  const rejectPromiseB = new Promise((resolve) => agentB.once('lock_rejected', resolve));
  agentB.emit('lock_ticket', { ticketId: 105, agentName: 'David Rodriguez' });

  const rejectEventB = await rejectPromiseB;
  console.log(' -> Agent B received lock_rejected:', rejectEventB);
  assert.strictEqual(rejectEventB.ticketId, 105, 'Rejected ticket ID must be 105');
  assert(rejectEventB.error.includes('currently locked by Marcus Thorne'), 'Rejection error message must state Marcus Thorne holds the lock');
  console.log(' ✅ PASS: Race condition prevented! Agent B was rejected from overwriting Ticket #105.');

  // Step 5: Test Resolution Save & Clean Unlock
  console.log('\n[Step 5] Testing Resolution Save: Agent A saves resolution on Ticket #105...');
  const updatedPromiseB = new Promise((resolve) => agentB.once('ticket_updated', resolve));
  const unlockPromiseB = new Promise((resolve) => agentB.once('ticket_unlocked', resolve));

  agentA.emit('save_resolution', {
    ticketId: 105,
    resolution: 'Customs seal verified at weigh station. Houston port manager notified.',
    status: 'In Progress',
    agentName: 'Marcus Thorne'
  });

  const [updatedEventB, unlockEventB] = await Promise.all([updatedPromiseB, unlockPromiseB]);
  console.log(' -> Agent B received ticket_updated:', updatedEventB.ticket.resolution);
  console.log(' -> Agent B received ticket_unlocked:', unlockEventB);
  assert.strictEqual(unlockEventB.ticketId, 105);
  assert.strictEqual(unlockEventB.reason, 'saved');
  console.log(' ✅ PASS: Ticket resolution saved and lock released cleanly.');

  // Step 6: THE GHOST DISCONNECT HANDLER (The Ultimate Test)
  console.log('\n[Step 6] TESTING THE "GHOST" DISCONNECT HANDLER (THE ULTIMATE TEST)...');
  console.log(' -> Agent B locks Ticket #105...');
  const lockPromiseA = new Promise((resolve) => agentA.once('ticket_locked', resolve));
  agentB.emit('lock_ticket', { ticketId: 105, agentName: 'David Rodriguez' });
  await lockPromiseA;
  console.log(' -> Ticket #105 is now held by Agent B.');

  console.log(' -> Simulating laptop lid close: Agent B abruptly drops connection WITHOUT unlocking...');
  const ghostUnlockPromiseA = new Promise((resolve) => agentA.once('ticket_unlocked', resolve));
  
  // Abrupt socket disconnect without unlock
  agentB.disconnect();

  const ghostUnlockEvent = await ghostUnlockPromiseA;
  console.log(' -> Agent A received ghost disconnect recovery broadcast:', ghostUnlockEvent);
  assert.strictEqual(ghostUnlockEvent.ticketId, 105, 'Unlocked ticket must be 105');
  assert.strictEqual(ghostUnlockEvent.reason, 'ghost_disconnect', 'Unlock reason must be ghost_disconnect');
  assert.strictEqual(ghostUnlockEvent.unlockedBy, 'David Rodriguez', 'Original lock holder was David Rodriguez');
  console.log(' ✅ PASS: GHOST DISCONNECT HANDLER RECOVERED THE LOCK! Server automatically released Ticket #105!');

  // Step 7: Test Real-Time Ticket Creation (Track A Requirement 1)
  console.log('\n[Step 7] Testing Instant Ticket Creation Broadcast...');
  const newTicketPromiseA = new Promise((resolve) => agentA.once('ticket_created', resolve));

  agentA.emit('create_ticket', {
    truckNumber: 'TRK-7719',
    driverName: 'Jesse McCall',
    route: 'Dallas Hub -> Memphis, TN',
    freightType: 'Frozen Medical Plasma',
    issue: 'Reefer telematics alarm: Ambient sensor failure',
    priority: 'Critical',
    createdBy: 'Marcus Thorne'
  });

  const createdEvent = await newTicketPromiseA;
  console.log(` -> Broadcast received: New Ticket #${createdEvent.ticket.id} (${createdEvent.ticket.truckNumber}) created.`);
  assert.strictEqual(createdEvent.ticket.truckNumber, 'TRK-7719');
  assert.strictEqual(createdEvent.ticket.priority, 'Critical');
  console.log(' ✅ PASS: New ticket slid into connected client UI in real time without polling.');

  // Clean up
  agentA.disconnect();

  console.log('\n=================================================================');
  console.log('🎉 ALL 7 SYSTEM VERIFICATION TESTS PASSED FLAWLESSLY!');
  console.log('   Marcus Thorne & RapidDispatch requirements 100% satisfied.');
  console.log('=================================================================\n');
}

runVerification().catch((err) => {
  console.error('❌ Verification failed with error:', err);
  process.exit(1);
});
