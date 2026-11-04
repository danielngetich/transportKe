/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Lock, 
  ShieldAlert, 
  Truck, 
  MapPin, 
  Weight, 
  Calendar, 
  CheckCircle2, 
  ArrowRight, 
  Phone, 
  Sparkles,
  CreditCard,
  Building2,
  FileCheck2,
  RotateCcw
} from 'lucide-react';
import { Load, User } from '../types.ts';
import { LoadFilterBar, FilterState } from './LoadFilterBar.tsx';

interface LoadBoardProps {
  loads: Load[];
  currentUser: User | null;
  authError: { status: number; message: string; requiredSteps?: string[] } | null;
  onSelectPersona: (personaKey: 'transporter' | 'shipper' | 'pending' | 'public') => void;
  onBookLoad: (load: Load) => void;
  onOpenPostLoad: () => void;
  recentSocketLoad: Load | null;
}

const DEFAULT_FILTERS: FilterState = {
  equipmentType: 'ALL',
  originCounty: 'ALL',
  destinationCounty: 'ALL',
  searchQuery: '',
  minBudget: 0,
  corridorPreset: 'ALL',
};

export const LoadBoard: React.FC<LoadBoardProps> = ({
  loads,
  currentUser,
  authError,
  onSelectPersona,
  onBookLoad,
  onOpenPostLoad,
  recentSocketLoad,
}) => {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const isVerified = currentUser && currentUser.verificationStatus === 'VERIFIED';

  // Dynamic filtering of loads list
  const filteredLoads = useMemo(() => {
    return loads.filter((load) => {
      // 1. Equipment Type Filter
      if (filters.equipmentType !== 'ALL' && load.equipmentType.toUpperCase() !== filters.equipmentType.toUpperCase()) {
        return false;
      }

      // 2. Origin County Filter
      if (filters.originCounty !== 'ALL' && load.originCounty.toLowerCase() !== filters.originCounty.toLowerCase()) {
        return false;
      }

      // 3. Destination County Filter
      if (filters.destinationCounty !== 'ALL' && load.destinationCounty.toLowerCase() !== filters.destinationCounty.toLowerCase()) {
        return false;
      }

      // 4. Minimum Budget Filter
      if (filters.minBudget > 0 && load.budgetKes < filters.minBudget) {
        return false;
      }

      // 5. Full text search query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchesQuery =
          load.title.toLowerCase().includes(q) ||
          load.commodity.toLowerCase().includes(q) ||
          load.originCity.toLowerCase().includes(q) ||
          load.destinationCity.toLowerCase().includes(q) ||
          load.originCounty.toLowerCase().includes(q) ||
          load.destinationCounty.toLowerCase().includes(q) ||
          load.equipmentType.toLowerCase().includes(q) ||
          load.id.toLowerCase().includes(q) ||
          (load.shippedByName && load.shippedByName.toLowerCase().includes(q));

        if (!matchesQuery) return false;
      }

      return true;
    });
  }, [loads, filters]);

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return (
    <div className="space-y-6">
      {/* Real-Time Socket Event notification banner */}
      {recentSocketLoad && (
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border border-emerald-500/40 rounded-xl p-4 flex items-center justify-between shadow-lg shadow-emerald-950/50 animate-bounce">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">⚡ Live WebSocket Dispatch</span>
                <span className="text-[11px] bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded font-extrabold">NEW</span>
              </div>
              <p className="text-sm font-semibold text-white">
                {recentSocketLoad.title} — KES {recentSocketLoad.budgetKes.toLocaleString('en-KE')} ({recentSocketLoad.equipmentType})
              </p>
            </div>
          </div>
          <button
            onClick={() => onBookLoad(recentSocketLoad)}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition"
          >
            Review & Lock
          </button>
        </div>
      )}

      {/* FILTERING UI COMPONENT (Interactive Equipment & Origin/Destination county filters) */}
      <LoadFilterBar
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={handleResetFilters}
        totalLoadsCount={loads.length}
        filteredLoadsCount={filteredLoads.length}
        allLoads={loads}
      />

      {/* Security Enforcement Barrier for Unauthenticated or Non-Verified Users */}
      {!isVerified ? (
        <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 bg-slate-900/90 shadow-2xl p-6 md:p-10 text-center">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center shadow-lg">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold">
              <Lock className="w-3.5 h-3.5" />
              HTTP 401 UNAUTHORIZED: STRICT FREIGHT BOARD ACCESS
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-white">
              {currentUser?.verificationStatus === 'PENDING'
                ? 'NTSA & KRA Verification Under Review'
                : 'Commercial Transporter Verification Required'}
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              In accordance with Kenyan freight regulations and KenyaLoad security standards, live load searches,
              cargo owner contacts, bids, and booking privileges are strictly restricted to verified carriers with active{' '}
              <strong>NTSA Commercial Road Service Licenses</strong> and <strong>KRA PIN compliance</strong>.
            </p>

            {authError && (
              <div className="bg-slate-950 border border-slate-800 text-left p-4 rounded-xl text-xs font-mono text-slate-400 space-y-2">
                <div className="text-rose-400 font-bold">authMiddleware.ts Security Intercept:</div>
                <div>{authError.message}</div>
                {authError.requiredSteps && (
                  <ul className="list-disc list-inside space-y-1 text-slate-300 pt-1">
                    {authError.requiredSteps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => onSelectPersona('transporter')}
                className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                Switch to Verified Carrier (Simba Hauliers)
              </button>

              <button
                onClick={() => onSelectPersona('shipper')}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition"
              >
                <Building2 className="w-4 h-4" />
                Switch to Verified Shipper
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Verified Load Feed (DAT One Grid / Cards) */
        <div className="grid grid-cols-1 gap-4">
          {filteredLoads.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-4">
              <Truck className="w-12 h-12 mx-auto text-slate-600" />
              <div>
                <h3 className="text-base font-bold text-white">No Shipments Match Your Filter Criteria</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Try broadening your Equipment Type, resetting Origin/Destination counties, or clearing minimum budget thresholds.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleResetFilters}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset All Filters
                </button>
                <button
                  onClick={onOpenPostLoad}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
                >
                  Post This Freight
                </button>
              </div>
            </div>
          ) : (
            filteredLoads.map((load) => {
              const ratePerTon = Math.round(load.budgetKes / load.weightTons);
              return (
                <div
                  key={load.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 transition rounded-2xl p-5 shadow-lg group relative overflow-hidden"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Route & Cargo Details */}
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {load.equipmentType}
                        </span>
                        <span className="text-xs font-mono text-slate-500">ID: {load.id}</span>
                        <span className="text-xs text-slate-400">• Corridor: {load.corridor}</span>
                        {load.status === 'IN_TRANSIT' && (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[11px] font-bold">
                            IN TRANSIT
                          </span>
                        )}
                        {load.status === 'BOOKED' && (
                          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[11px] font-bold">
                            ESCROW PENDING
                          </span>
                        )}
                      </div>

                      {/* Origin -> Destination Line */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div>
                            <p className="text-sm font-bold text-white">{load.originCity}</p>
                            <p className="text-[11px] text-slate-400">{load.originCounty} County</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-slate-500 px-2">
                          <span className="text-xs font-mono">────</span>
                          <ArrowRight className="w-4 h-4 text-emerald-400" />
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                          <div>
                            <p className="text-sm font-bold text-white">{load.destinationCity}</p>
                            <p className="text-[11px] text-slate-400">{load.destinationCounty} County</p>
                          </div>
                        </div>
                      </div>

                      {/* Cargo Specs */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Weight className="w-4 h-4 text-slate-400" />
                          <span>{load.weightTons} Tons {load.volumeCbm ? `(${load.volumeCbm} CBM)` : ''}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                          <span className="text-slate-200 font-semibold">{load.commodity}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Pickup: {load.targetPickupDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Rates & Booking Call-to-Action */}
                    <div className="lg:text-right border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-800 flex flex-col sm:flex-row lg:flex-col justify-between items-start lg:items-end gap-3 shrink-0">
                      <div>
                        <div className="text-2xl font-black text-white font-mono">
                          KES {load.budgetKes.toLocaleString('en-KE')}
                        </div>
                        <p className="text-xs text-slate-400">
                          ~KES {ratePerTon.toLocaleString('en-KE')} / Ton
                        </p>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => onBookLoad(load)}
                          className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-transform active:scale-95"
                        >
                          <CreditCard className="w-4 h-4" />
                          Lock & Escrow
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Verified Contact Details (Unmasked for verified carriers) */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                    <div className="flex items-center gap-2">
                      <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Verified Shipper: <strong className="text-slate-200">{load.shippedByName}</strong></span>
                      <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">KRA PIN Verified</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <a
                        href={`tel:${load.shipperPhone}`}
                        className="flex items-center gap-1 text-emerald-400 hover:underline font-mono"
                      >
                        <Phone className="w-3 h-3" />
                        +{load.shipperPhone}
                      </a>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
