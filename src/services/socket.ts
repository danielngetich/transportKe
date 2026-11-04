/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { io, Socket } from 'socket.io-client';
import { getStoredToken } from './api.ts';
import { Load } from '../types.ts';

let socket: Socket | null = null;

export function initSocket(onConnectStatus?: (connected: boolean) => void): Socket {
  if (socket) {
    socket.disconnect();
  }

  const token = getStoredToken();

  socket = io(window.location.origin, {
    path: '/socket.io',
    auth: {
      token: token || undefined,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => {
    if (onConnectStatus) onConnectStatus(true);
  });

  socket.on('disconnect', () => {
    if (onConnectStatus) onConnectStatus(false);
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function subscribeToLoadEvents(callbacks: {
  onLoadCreated?: (load: Load) => void;
  onLoadUpdated?: (load: Load) => void;
  onPresenceUpdate?: (data: { activeTransportersCount: number }) => void;
  onCorridorAlert?: (data: { message: string; timestamp: string }) => void;
}) {
  if (!socket) return () => {};

  if (callbacks.onLoadCreated) {
    socket.on('load:created', callbacks.onLoadCreated);
  }

  if (callbacks.onLoadUpdated) {
    socket.on('load:updated', callbacks.onLoadUpdated);
  }

  if (callbacks.onPresenceUpdate) {
    socket.on('presence:update', callbacks.onPresenceUpdate);
  }

  if (callbacks.onCorridorAlert) {
    socket.on('corridor:alert', callbacks.onCorridorAlert);
  }

  return () => {
    if (!socket) return;
    if (callbacks.onLoadCreated) socket.off('load:created', callbacks.onLoadCreated);
    if (callbacks.onLoadUpdated) socket.off('load:updated', callbacks.onLoadUpdated);
    if (callbacks.onPresenceUpdate) socket.off('presence:update', callbacks.onPresenceUpdate);
    if (callbacks.onCorridorAlert) socket.off('corridor:alert', callbacks.onCorridorAlert);
  };
}
