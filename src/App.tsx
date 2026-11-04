/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { LoadBoard } from './components/LoadBoard.tsx';
import { CountyHeatmap } from './components/CountyHeatmap.tsx';
import { MpesaEscrowModal } from './components/MpesaEscrowModal.tsx';
import { PostLoadModal } from './components/PostLoadModal.tsx';
import { ArchitectureExplorer } from './components/ArchitectureExplorer.tsx';
import { 
  fetchLoads, 
  fetchMarketSummary, 
  fetchCountyHeatmaps, 
  fetchDemoTokens,
  setStoredToken,
  setStoredUser,
  getStoredUser
} from './services/api.ts';
import { initSocket, subscribeToLoadEvents } from './services/socket.ts';
import { Load, MarketSummary, CountyMarketMetric, User } from './types.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<'loads' | 'heatmap' | 'escrow' | 'devops'>('loads');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loads, setLoads] = useState<Load[]>([]);
  const [marketSummary, setMarketSummary] = useState<MarketSummary | null>(null);
  const [heatmaps, setHeatmaps] = useState<CountyMarketMetric[]>([]);
  const [authError, setAuthError] = useState<{ status: number; message: string; requiredSteps?: string[] } | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [activeTransportersCount, setActiveTransportersCount] = useState<number>(14);
  const [recentSocketLoad, setRecentSocketLoad] = useState<Load | null>(null);

  // Modals
  const [postLoadOpen, setPostLoadOpen] = useState(false);
  const [escrowModalOpen, setEscrowModalOpen] = useState(false);
  const [selectedEscrowLoad, setSelectedEscrowLoad] = useState<Load | null>(null);

  // Demo tokens map
  const [demoTokens, setDemoTokens] = useState<Record<string, any>>({});

  // 1. Initial Load: Public Market data & Demo tokens
  useEffect(() => {
    async function initData() {
      // Fetch public endpoints (always 200 OK)
      const summaryRes = await fetchMarketSummary();
      if (summaryRes.success && summaryRes.data) {
        setMarketSummary(summaryRes.data);
      }

      const heatmapsRes = await fetchCountyHeatmaps();
      if (heatmapsRes.success && heatmapsRes.data) {
        setHeatmaps(heatmapsRes.data);
      }

      // Fetch demo tokens
      const demoRes = await fetchDemoTokens();
      if (demoRes.success && demoRes.rawJson?.tokens) {
        const tokens = demoRes.rawJson.tokens;
        setDemoTokens(tokens);

        // Default to Verified Transporter on first load for optimal inspection
        const savedUser = getStoredUser();
        if (!savedUser) {
          const defaultTransporter = tokens.verifiedTransporter;
          if (defaultTransporter) {
            setStoredToken(defaultTransporter.token);
            setStoredUser(defaultTransporter.user);
            setCurrentUser(defaultTransporter.user);
          }
        } else {
          setCurrentUser(savedUser);
        }
      }
    }

    initData();
  }, []);

  // 2. Fetch Loads whenever user changes
  const loadFreightData = useCallback(async () => {
    setAuthError(null);
    const res = await fetchLoads();

    if (res.success && res.data) {
      setLoads(res.data);
      setAuthError(null);
    } else {
      setLoads([]);
      setAuthError({
        status: res.status,
        message: res.message || 'Access blocked by authMiddleware.ts (401 Unauthorized)',
        requiredSteps: res.rawJson?.requiredSteps,
      });
    }
  }, []);

  useEffect(() => {
    loadFreightData();
  }, [loadFreightData, currentUser]);

  // 3. Initialize WebSocket Gateway connection
  useEffect(() => {
    initSocket((connected) => {
      setIsConnected(connected);
    });

    const unsubscribe = subscribeToLoadEvents({
      onLoadCreated: (newLoad) => {
        setLoads((prev) => {
          // Idempotency: check if already exists
          if (prev.some((l) => l.id === newLoad.id)) return prev;
          return [newLoad, ...prev];
        });
        setRecentSocketLoad(newLoad);
      },
      onLoadUpdated: (updatedLoad) => {
        setLoads((prev) =>
          prev.map((l) => (l.id === updatedLoad.id ? { ...l, ...updatedLoad } : l))
        );
      },
      onPresenceUpdate: (data) => {
        if (data.activeTransportersCount) {
          setActiveTransportersCount(data.activeTransportersCount);
        }
      },
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser]);

  // Handle Persona Switching
  const handleSelectPersona = (personaKey: 'transporter' | 'shipper' | 'pending' | 'public') => {
    if (personaKey === 'public') {
      setStoredToken(null);
      setStoredUser(null);
      setCurrentUser(null);
      setAuthError({
        status: 401,
        message: 'Access denied: Missing or malformed Authorization Bearer token. Public visitors may only view market metrics and county heatmaps.',
        requiredSteps: ['Sign in as a registered transporter or shipper'],
      });
      setLoads([]);
      return;
    }

    let tokenObj: any;
    if (personaKey === 'transporter') tokenObj = demoTokens.verifiedTransporter;
    if (personaKey === 'shipper') tokenObj = demoTokens.verifiedShipper;
    if (personaKey === 'pending') tokenObj = demoTokens.pendingTransporter;

    if (tokenObj) {
      setStoredToken(tokenObj.token);
      setStoredUser(tokenObj.user);
      setCurrentUser(tokenObj.user);
    }
  };

  const handleBookLoad = (load: Load) => {
    setSelectedEscrowLoad(load);
    setEscrowModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPostLoad={() => setPostLoadOpen(true)}
        onSelectPersona={handleSelectPersona}
        isConnected={isConnected}
        activeTransportersCount={activeTransportersCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'loads' && (
          <LoadBoard
            loads={loads}
            currentUser={currentUser}
            authError={authError}
            onSelectPersona={handleSelectPersona}
            onBookLoad={handleBookLoad}
            onOpenPostLoad={() => setPostLoadOpen(true)}
            recentSocketLoad={recentSocketLoad}
          />
        )}

        {activeTab === 'heatmap' && (
          <CountyHeatmap
            heatmaps={heatmaps}
            marketSummary={marketSummary}
            onExploreLoads={() => setActiveTab('loads')}
          />
        )}

        {activeTab === 'escrow' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-black text-white">Safaricom M-Pesa Escrow & e-POD System</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Select any active freight shipment to test the complete Daraja STK Push locking flow,
                driver electronic proof of delivery (e-POD), and automated 6-digit OTP B2C disbursement.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loads.map((load) => (
                <div key={load.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {load.id}
                    </span>
                    <span className="text-sm font-black text-emerald-400 font-mono">
                      KES {load.budgetKes.toLocaleString('en-KE')}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white truncate">{load.title}</h3>
                    <p className="text-xs text-slate-400">{load.originCity} ➔ {load.destinationCity}</p>
                  </div>
                  <button
                    onClick={() => handleBookLoad(load)}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                  >
                    Launch Escrow Terminal
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'devops' && <ArchitectureExplorer />}
      </main>

      {/* M-Pesa Escrow Modal */}
      <MpesaEscrowModal
        load={selectedEscrowLoad}
        isOpen={escrowModalOpen}
        onClose={() => setEscrowModalOpen(false)}
        onEscrowSuccess={() => {
          loadFreightData();
        }}
      />

      {/* Post Cargo Modal */}
      <PostLoadModal
        isOpen={postLoadOpen}
        onClose={() => setPostLoadOpen(false)}
        currentUser={currentUser}
        onLoadCreated={() => {
          loadFreightData();
          setActiveTab('loads');
        }}
      />

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">KenyaLoad One</span>
            <span>• Northern Corridor Freight Exchange & Escrow</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>NTSA RSL Compliance</span>
            <span>•</span>
            <span>KRA Tax PIN Verified</span>
            <span>•</span>
            <span>Safaricom Daraja B2B / C2B Escrow</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
