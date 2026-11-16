import { io } from 'socket.io-client';

// Determine Socket.io server URL:
// 1. Check user-configured override in localStorage
// 2. Check Vite environment variable VITE_BACKEND_URL
// 3. Check if running on localhost dev (port 5173 -> proxy to 3001)
// 4. Default to window.location.origin if self-hosted with Express
const getBackendUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:3001';
  
  const savedUrl = localStorage.getItem('rapiddispatch_backend_url');
  if (savedUrl) return savedUrl;

  if (import.meta.env && import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }

  // If running on local Vite dev server
  if (window.location.hostname === 'localhost' && window.location.port === '5173') {
    return 'http://localhost:3001';
  }

  // If deployed on Vercel and no backend URL provided, return null to avoid 404 polling spam
  if (window.location.hostname.includes('vercel.app')) {
    return null;
  }

  return window.location.origin || 'http://localhost:3001';
};

export const BACKEND_URL = getBackendUrl();

export const socket = BACKEND_URL ? io(BACKEND_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
  reconnectionDelayMax: 6000,
  transports: ['websocket', 'polling']
}) : null;

export default socket;
