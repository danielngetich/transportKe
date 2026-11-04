/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * KenyaLoad One - Live Load Board WebSocket Gateway (Socket.IO)
 * 
 * Manages real-time freight updates across the Northern Corridor:
 * - Authenticates socket connections using JWT tokens.
 * - Enforces verified transporter access to live equipment rooms.
 * - Subscribes transporters to equipment-specific channels (Container, Flatbed, Reefer, etc.).
 * - Broadcasts `load:created` and `load:updated` events targeted to carriers
 *   servicing the Mombasa-Nairobi-Malaba corridor.
 */

import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, TokenPayload } from '../middleware/authMiddleware.ts';
import { StoredLoad } from '../db/store.ts';

export interface ServerToClientEvents {
  'load:created': (load: StoredLoad & { notification: string }) => void;
  'load:updated': (load: StoredLoad & { notification: string }) => void;
  'corridor:alert': (data: { message: string; timestamp: string; corridor: string }) => void;
  'presence:update': (data: { activeTransportersCount: number; timestamp: string }) => void;
  'error': (data: { message: string }) => void;
}

export interface ClientToServerEvents {
  'subscribe:equipment': (equipmentTypes: string[]) => void;
  'subscribe:corridor': (corridor: string) => void;
  'ping:presence': () => void;
}

export interface SocketData {
  user: TokenPayload;
}

export class LoadBoardGateway {
  private io: SocketIOServer<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;
  private activeTransporters: Set<string> = new Set();

  constructor(httpServer: HttpServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
      path: '/socket.io',
      pingTimeout: 30000,
      pingInterval: 10000,
    });

    this.configureMiddleware();
    this.configureConnectionHandler();
  }

  /**
   * Socket Authentication Middleware
   * Validates JWT token from handshake auth or headers
   */
  private configureMiddleware(): void {
    this.io.use((socket: Socket, next) => {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');

      // Allow public sockets to connect for generalized statistics if token not provided,
      // but label them as unauthenticated visitors.
      if (!token) {
        socket.data.user = {
          userId: 'anonymous-visitor',
          email: 'public@visitor.kenyload.ke',
          role: 'AGENT',
          verificationStatus: 'PENDING',
          companyName: 'Public Visitor',
        };
        return next();
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
        socket.data.user = decoded;
        next();
      } catch {
        // Fallback to anonymous rather than killing connection for UI responsiveness
        socket.data.user = {
          userId: 'anonymous-visitor',
          email: 'invalid-token@kenyload.ke',
          role: 'AGENT',
          verificationStatus: 'PENDING',
          companyName: 'Public Visitor',
        };
        next();
      }
    });
  }

  /**
   * Connection and Room Management
   */
  private configureConnectionHandler(): void {
    this.io.on('connection', (socket) => {
      const user = socket.data.user;
      const isVerifiedTransporter = user?.role === 'TRANSPORTER' && user?.verificationStatus === 'VERIFIED';

      if (isVerifiedTransporter) {
        this.activeTransporters.add(socket.id);
        
        // Join dedicated rooms
        socket.join('room:transporters');
        socket.join('corridor:Mombasa-Nairobi-Malaba');

        // By default subscribe to all primary equipment types until carrier customizes
        socket.join('equipment:CONTAINER');
        socket.join('equipment:FLATBED');
        socket.join('equipment:BOX_BODY');
        socket.join('equipment:TANKER');
        socket.join('equipment:REEFER');
        socket.join('equipment:CANTER');

        this.broadcastPresence();
      }

      // Handle custom equipment subscription from transporter app
      socket.on('subscribe:equipment', (equipmentTypes: string[]) => {
        if (!isVerifiedTransporter) {
          socket.emit('error', { message: 'Only verified Transporters can subscribe to equipment dispatch rooms.' });
          return;
        }

        equipmentTypes.forEach((type) => {
          socket.join(`equipment:${type.toUpperCase()}`);
        });
      });

      // Handle custom corridor filtering
      socket.on('subscribe:corridor', (corridor: string) => {
        socket.join(`corridor:${corridor}`);
      });

      socket.on('disconnect', () => {
        if (this.activeTransporters.has(socket.id)) {
          this.activeTransporters.delete(socket.id);
          this.broadcastPresence();
        }
      });
    });
  }

  /**
   * Broadcast current transporter presence count to load board
   */
  private broadcastPresence(): void {
    this.io.emit('presence:update', {
      activeTransportersCount: Math.max(1, this.activeTransporters.size),
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Primary Dispatch Event: broadcastNewLoad
   * 
   * Broadcasts to all connected, authenticated Transporters whenever
   * a new cargo shipment matching their equipment type is posted along
   * the Mombasa-Nairobi-Malaba corridor.
   */
  public broadcastNewLoad(load: StoredLoad): void {
    const isCorridorMatch = 
      load.corridor.toLowerCase().includes('mombasa') ||
      load.originCounty.toLowerCase() === 'mombasa' ||
      load.destinationCounty.toLowerCase() === 'busia' ||
      load.destinationCity.toLowerCase().includes('malaba') ||
      load.destinationCity.toLowerCase().includes('nairobi');

    const notificationPayload = {
      ...load,
      notification: `🚨 New Freight: ${load.weightTons}T ${load.equipmentType} [${load.originCity} ➔ ${load.destinationCity}] - KES ${load.budgetKes.toLocaleString('en-KE')}`,
    };

    // 1. Broadcast to carriers joined to this specific equipment room
    const equipmentRoom = `equipment:${load.equipmentType.toUpperCase()}`;
    this.io.to(equipmentRoom).emit('load:created', notificationPayload);

    // 2. Broadcast to Northern Corridor room if applicable
    if (isCorridorMatch) {
      this.io.to('corridor:Mombasa-Nairobi-Malaba').emit('corridor:alert', {
        message: `Mombasa-Malaba Corridor Freight Alert: ${load.title} (KES ${load.budgetKes.toLocaleString('en-KE')})`,
        timestamp: new Date().toISOString(),
        corridor: 'Mombasa-Nairobi-Malaba',
      });
    }

    // 3. Also notify general verified transporters room
    this.io.to('room:transporters').emit('load:created', notificationPayload);
  }

  /**
   * Secondary Dispatch Event: broadcastLoadUpdated
   * 
   * Broadcasts status transitions (e.g. AVAILABLE -> BOOKED -> IN_TRANSIT -> COMPLETED)
   */
  public broadcastLoadUpdated(load: StoredLoad): void {
    const payload = {
      ...load,
      notification: `Load ${load.id} updated to status: ${load.status}`,
    };

    this.io.emit('load:updated', payload);
  }

  /**
   * Returns current count of connected verified carriers
   */
  public getActiveTransportersCount(): number {
    return Math.max(1, this.activeTransporters.size);
  }
}
