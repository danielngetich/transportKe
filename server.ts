/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * KenyaLoad One - Full-Stack Express & Socket.IO Production Server
 * 
 * Architecture:
 * - Express REST API on /api/v1
 * - Socket.IO Real-time Load Gateway on port 3000
 * - Vite dev middleware integration for seamless SPA rendering
 */

import express from 'express';
import http from 'http';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

// Middleware & Gateways
import { authMiddleware } from './server/middleware/authMiddleware.ts';
import { LoadBoardGateway } from './server/gateways/loadGateway.ts';
import { setGatewayInstance } from './server/controllers/loadController.ts';

// API Routes
import marketRoutes from './server/routes/marketRoutes.ts';
import loadRoutes from './server/routes/loadRoutes.ts';
import truckRoutes from './server/routes/truckRoutes.ts';
import bookingRoutes from './server/routes/bookingRoutes.ts';
import paymentRoutes from './server/routes/paymentRoutes.ts';
import authRoutes from './server/routes/authRoutes.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = Number(process.env.PORT) || 3000;

  // 1. Core Middlewares
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // 2. Real-time WebSocket Gateway
  const loadGateway = new LoadBoardGateway(server);
  setGatewayInstance(loadGateway);

  // 3. API Health & Diagnostic check
  app.get('/api/v1/health', (_req, res) => {
    res.json({
      status: 'UP',
      app: 'KenyaLoad One API',
      corridor: 'Northern Corridor (Mombasa-Nairobi-Malaba)',
      activeCarriersConnected: loadGateway.getActiveTransportersCount(),
      timestamp: new Date().toISOString(),
    });
  });

  // 4. Mount Public & Protected API Routes
  // Public routes (Market summary & County Heatmaps) are allowed inside authMiddleware
  app.use('/api/v1', authMiddleware);

  // Mount router endpoints
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1', marketRoutes); // mounts /api/v1/market-summary and /api/v1/heatmaps
  app.use('/api/v1/loads', loadRoutes);
  app.use('/api/v1/trucks', truckRoutes);
  app.use('/api/v1/bookings', bookingRoutes);
  app.use('/api/v1/escrow', paymentRoutes);

  // 5. Mount Vite SPA dev server or static files
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 KenyaLoad One server running on http://0.0.0.0:${PORT}`);
    console.log(`📡 Socket.IO Live Load Board Gateway attached on /socket.io`);
    console.log(`🛡️ JWT & NTSA Verification Auth Middleware active`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Error:', err);
  process.exit(1);
});
