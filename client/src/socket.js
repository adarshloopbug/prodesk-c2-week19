import { io } from 'socket.io-client';

// Determine Socket.io server URL
// In development with Vite proxy, or in unified production build, connect to window.location.origin or port 3001
const SERVER_URL = window.location.hostname === 'localhost' && window.location.port === '5173'
  ? 'http://localhost:3001'
  : (window.location.origin || 'http://localhost:3001');

export const socket = io(SERVER_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  transports: ['websocket', 'polling']
});

export default socket;
