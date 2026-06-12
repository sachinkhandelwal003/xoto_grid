import { io } from 'socket.io-client';

let socket = null;

const getBaseUrl = () =>
  (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

export const registerSocket = (token) => {
  if (socket) return socket;
  socket = io(getBaseUrl(), {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
  });
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
