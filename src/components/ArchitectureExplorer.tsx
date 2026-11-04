/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FolderTree, 
  Database, 
  ShieldCheck, 
  CreditCard, 
  Radio, 
  Play, 
  Check, 
  Copy, 
  ExternalLink,
  Code2,
  Terminal,
  Activity
} from 'lucide-react';
import { getStoredToken } from '../services/api.ts';

export const ArchitectureExplorer: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'structure' | 'prisma' | 'middleware' | 'escrow' | 'gateway' | 'tester'>('structure');
  const [testEndpoint, setTestEndpoint] = useState('/api/v1/market-summary');
  const [testMethod, setTestMethod] = useState('GET');
  const [testIncludeToken, setTestIncludeToken] = useState(false);
  const [testResponse, setTestResponse] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const executeApiTest = async () => {
    setTesting(true);
    setTestResponse(null);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (testIncludeToken) {
      const token = getStoredToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    try {
      const res = await fetch(testEndpoint, {
        method: testMethod,
        headers,
      });

      const json = await res.json().catch(() => ({}));
      setTestResponse({
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
        data: json,
      });
    } catch (err: any) {
      setTestResponse({
        status: 0,
        statusText: 'Network Connection Error',
        ok: false,
        data: { error: err.message },
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-nav Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-xl flex flex-wrap gap-2">
        <button
          onClick={() => setActiveSubTab('structure')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeSubTab === 'structure' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          1. Directory Structure
        </button>

        <button
          onClick={() => setActiveSubTab('prisma')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeSubTab === 'prisma' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          2. Prisma & PostGIS Schema
        </button>

        <button
          onClick={() => setActiveSubTab('middleware')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeSubTab === 'middleware' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          3. Auth & NTSA Middleware
        </button>

        <button
          onClick={() => setActiveSubTab('escrow')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeSubTab === 'escrow' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          4. M-Pesa Escrow Controller
        </button>

        <button
          onClick={() => setActiveSubTab('gateway')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeSubTab === 'gateway' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Radio className="w-4 h-4" />
          5. Live WebSocket Gateway
        </button>

        <button
          onClick={() => setActiveSubTab('tester')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeSubTab === 'tester' ? 'bg-sky-500 text-slate-950 shadow-md' : 'text-sky-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Terminal className="w-4 h-4" />
          Live API Test Harness
        </button>
      </div>

      {/* 1. DIRECTORY STRUCTURE */}
      {activeSubTab === 'structure' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-emerald-400" />
                KenyaLoad One - Production Directory Architecture
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Separation of concerns across API routers, controllers, security middleware, Prisma schemas, and WebSocket dispatchers.
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(structureCode, 'structure')}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700"
            >
              {copied === 'structure' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Tree</span>
            </button>
          </div>

          <pre className="bg-slate-950 border border-slate-800 text-emerald-300 p-5 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
            {structureCode}
          </pre>
        </div>
      )}

      {/* 2. PRISMA SCHEMA */}
      {activeSubTab === 'prisma' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" />
                PostgreSQL + PostGIS Schema (prisma/schema.prisma)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Production relational schema modeling Users, NTSA/KRA Verification Documents, Loads, Trucks, and Safaricom Escrow.
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(prismaSchemaCode, 'prisma')}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700"
            >
              {copied === 'prisma' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Schema</span>
            </button>
          </div>

          <pre className="bg-slate-950 border border-slate-800 text-slate-200 p-5 rounded-xl text-xs font-mono overflow-x-auto max-h-[600px] leading-relaxed">
            {prismaSchemaCode}
          </pre>
        </div>
      )}

      {/* 3. AUTH & NTSA MIDDLEWARE */}
      {activeSubTab === 'middleware' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                JWT & NTSA/KRA Verification Middleware (server/middleware/authMiddleware.ts)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Allows public GET /api/v1/market-summary and /api/v1/heatmaps. Strictly blocks /loads, /trucks, and /bookings with 401 Unauthorized if unverified.
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(middlewareCode, 'middleware')}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700"
            >
              {copied === 'middleware' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Middleware</span>
            </button>
          </div>

          <pre className="bg-slate-950 border border-slate-800 text-slate-200 p-5 rounded-xl text-xs font-mono overflow-x-auto max-h-[600px] leading-relaxed">
            {middlewareCode}
          </pre>
        </div>
      )}

      {/* 4. M-PESA ESCROW CONTROLLER */}
      {activeSubTab === 'escrow' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                Safaricom M-Pesa B2B / C2B Controller (server/controllers/paymentController.ts)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Simulates Daraja STK push (initiateEscrow) and automated B2C disbursement via 6-digit driver OTP (releaseEscrow).
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(paymentControllerCode, 'escrow')}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700"
            >
              {copied === 'escrow' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Controller</span>
            </button>
          </div>

          <pre className="bg-slate-950 border border-slate-800 text-slate-200 p-5 rounded-xl text-xs font-mono overflow-x-auto max-h-[600px] leading-relaxed">
            {paymentControllerCode}
          </pre>
        </div>
      )}

      {/* 5. WEBSOCKET GATEWAY */}
      {activeSubTab === 'gateway' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-emerald-400" />
                Live Load Board Socket.IO Gateway (server/gateways/loadGateway.ts)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Real-time room dispatching targeted by equipment type (Container, Flatbed, etc.) and Northern Corridor location.
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(gatewayCode, 'gateway')}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700"
            >
              {copied === 'gateway' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Gateway</span>
            </button>
          </div>

          <pre className="bg-slate-950 border border-slate-800 text-slate-200 p-5 rounded-xl text-xs font-mono overflow-x-auto max-h-[600px] leading-relaxed">
            {gatewayCode}
          </pre>
        </div>
      )}

      {/* 6. LIVE API TEST HARNESS */}
      {activeSubTab === 'tester' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-sky-400" />
              Live REST API & Security Test Harness
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Verify the exact 401 Unauthorized rejection on private routes (/loads, /trucks) versus 200 OK on public routes (/market-summary, /heatmaps).
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <select
                value={testMethod}
                onChange={(e) => setTestMethod(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono font-bold text-emerald-400 focus:outline-none"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>

              <select
                value={testEndpoint}
                onChange={(e) => setTestEndpoint(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
              >
                <option value="/api/v1/market-summary">/api/v1/market-summary (Public Route ➔ 200 OK)</option>
                <option value="/api/v1/heatmaps">/api/v1/heatmaps (Public Route ➔ 200 OK)</option>
                <option value="/api/v1/loads">/api/v1/loads (Protected Route ➔ 401 without verified token)</option>
                <option value="/api/v1/trucks">/api/v1/trucks (Protected Route ➔ 401 without verified token)</option>
                <option value="/api/v1/bookings">/api/v1/bookings (Protected Route ➔ 401 without verified token)</option>
                <option value="/api/v1/health">/api/v1/health (Health check)</option>
              </select>

              <button
                onClick={executeApiTest}
                disabled={testing}
                className="w-full sm:w-auto bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-5 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 shrink-0 transition"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Send Request
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
              <input
                type="checkbox"
                id="includeTokenCheck"
                checked={testIncludeToken}
                onChange={(e) => setTestIncludeToken(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-0"
              />
              <label htmlFor="includeTokenCheck" className="cursor-pointer">
                Attach current persona Bearer JWT in Authorization header
              </label>
            </div>
          </div>

          {/* Test Response Display */}
          {testResponse && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-400 font-mono">Response Output:</span>
                <span
                  className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                    testResponse.status === 200
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  HTTP {testResponse.status} {testResponse.statusText}
                </span>
              </div>

              <pre className="bg-slate-950 border border-slate-800 text-slate-200 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-[350px]">
                {JSON.stringify(testResponse.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Raw source representations for inspection
const structureCode = `kenyload-one/
├── prisma/
│   └── schema.prisma                 # PostgreSQL + PostGIS models & Escrow relations
├── server/
│   ├── controllers/
│   │   ├── authController.ts         # JWT issuance, role management & personas
│   │   ├── loadController.ts         # Freight posting, corridor filters & WebSocket trigger
│   │   ├── truckController.ts        # Fleet registration & capacity search
│   │   ├── bookingController.ts      # Shipper-Carrier freight agreement matching
│   │   ├── paymentController.ts      # Safaricom M-Pesa STK push & e-POD OTP release
│   │   └── marketController.ts       # Public market indicators & county heatmaps
│   ├── middleware/
│   │   └── authMiddleware.ts         # JWT verification & NTSA/KRA status guard (401)
│   ├── gateways/
│   │   └── loadGateway.ts            # Socket.IO corridor & equipment-targeted dispatcher
│   ├── routes/
│   │   ├── authRoutes.ts             # POST /login, GET /demo-tokens
│   │   ├── marketRoutes.ts           # GET /market-summary, GET /heatmaps (Public)
│   │   ├── loadRoutes.ts             # GET, POST /loads (Protected)
│   │   ├── truckRoutes.ts            # GET, POST /trucks (Protected)
│   │   ├── bookingRoutes.ts          # GET, POST /bookings (Protected)
│   │   └── paymentRoutes.ts          # POST /escrow/initiate, POST /escrow/release (Protected)
│   └── db/
│       └── store.ts                  # In-memory authoritative persistence & Northern Corridor seeds
├── src/                              # React 19 Frontend SPA (DAT One clone adapted for Kenya)
│   ├── components/                   # LoadBoard, CountyHeatmap, EscrowModal, ArchitectureExplorer
│   ├── services/                     # REST API client & Socket.IO real-time client
│   └── types.ts                      # Shared TypeScript data models
├── server.ts                         # Express HTTP + Socket.IO + Vite SPA server on Port 3000
├── package.json
└── tsconfig.json`;

const prismaSchemaCode = `// prisma/schema.prisma
datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [postgis()] // Enables PostGIS for spatial corridor routing
}

generator client {
  provider = "prisma-client-js"
}

enum UserRole {
  SHIPPER
  TRANSPORTER
  AGENT
  ADMIN
}

enum VerificationStatus {
  PENDING
  VERIFIED
  REJECTED
}

enum EquipmentType {
  CONTAINER  // Skeletal semi-trailers (Port of Mombasa / ICD Embakasi)
  FLATBED    // Machinery, steel, abnormal loads
  BOX_BODY   // FMCG, high-security cargo
  TANKER     // Fuel / AGO, edible oils
  REEFER     // Cold-chain horticulture exports
  CANTER     // 3-10 Ton regional distribution
}

model User {
  id                 String             @id @default(uuid())
  email              String             @unique
  phoneNumber        String             @unique // 2547XXXXXXXX
  passwordHash       String
  role               UserRole           @default(TRANSPORTER)
  verificationStatus VerificationStatus @default(PENDING)
  profile            Profile?
  documents          VerificationDocument[]
  postedLoads        Load[]             @relation("ShipperLoads")
  trucks             Truck[]            @relation("TransporterTrucks")
  bookings           Booking[]          @relation("TransporterBookings")
  createdAt          DateTime           @default(now())
}

model Load {
  id               String        @id @default(uuid())
  title            String
  commodity        String
  originCounty     String
  originCity       String
  destinationCounty String
  destinationCity  String
  weightTons       Decimal       @db.Decimal(10, 2)
  equipmentType    EquipmentType
  budgetKes        Decimal       @db.Decimal(12, 2)
  status           String        @default("AVAILABLE")
  corridor         String        @default("Mombasa-Nairobi-Malaba")
  shippedById      String
  shippedBy        User          @relation("ShipperLoads", fields: [shippedById], references: [id])
}

model Booking {
  id               String             @id @default(uuid())
  loadId           String             @unique
  load             Load               @relation(fields: [loadId], references: [id])
  transporterId    String
  transporter      User               @relation("TransporterBookings", fields: [transporterId], references: [id])
  finalAgreedPrice Decimal            @db.Decimal(12, 2)
  driverName       String?
  driverPhone      String?
  escrowStatus     String             @default("PENDING_STK")
  epodToken        String?            @unique
  epodOtpCode      String?            // 6-digit driver confirmation code
  epodVerifiedAt   DateTime?
  escrowRecord     EscrowTransaction?
}`;

const middlewareCode = `// server/middleware/authMiddleware.ts
export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  // 1. Whitelist Public Routes
  if (req.path === '/api/v1/market-summary' || req.path === '/api/v1/heatmaps') {
    return next();
  }

  // 2. Extract Authorization Bearer Token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'UnauthorizedAccess',
      message: 'Access denied: Missing or malformed Authorization Bearer token.',
      publicAllowedEndpoints: ['/api/v1/market-summary', '/api/v1/heatmaps'],
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    req.user = decoded;

    // 3. Strict NTSA / KRA Verification Status Check
    if (decoded.verificationStatus !== 'VERIFIED') {
      res.status(401).json({
        success: false,
        error: 'AccountNotVerified',
        message: 'Account status is Pending. NTSA Commercial License and KRA PIN required to access live freight boards.',
        verificationStatus: decoded.verificationStatus,
      });
      return;
    }

    next();
  } catch (err) {
    res.status(401).json({ success: false, error: 'InvalidToken' });
  }
}`;

const paymentControllerCode = `// server/controllers/paymentController.ts
export async function initiateEscrow(req: AuthenticatedRequest, res: Response) {
  // 1. Trigger Safaricom Daraja STK Push to Shipper Mobile
  const { bookingId, shipperPhone, amountKes } = req.body;
  // Locks funds into Escrow trust account with receipt number (e.g. QHD893KJ12)
  // Generates 6-digit driver OTP code for destination handover
}

export async function releaseEscrow(req: AuthenticatedRequest, res: Response) {
  // 2. Verified e-POD upload via 6-digit OTP code sent to driver
  const { bookingId, otpCode } = req.body;
  if (otpCode !== booking.epodOtpCode) {
    return res.status(400).json({ error: 'InvalidOtpCode' });
  }
  // Automatically disburses funds to Transporter Paybill via Daraja B2C payout
}`;

const gatewayCode = `// server/gateways/loadGateway.ts
export class LoadBoardGateway {
  // Broadcasts load:created to connected, authenticated transporters
  // Subscribes transporters to equipment rooms (e.g. equipment:CONTAINER)
  public broadcastNewLoad(load: StoredLoad): void {
    const equipmentRoom = \`equipment:\${load.equipmentType.toUpperCase()}\`;
    this.io.to(equipmentRoom).emit('load:created', load);
    this.io.to('corridor:Mombasa-Nairobi-Malaba').emit('corridor:alert', load);
  }
}`;
