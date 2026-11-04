/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Truck, 
  ShieldCheck, 
  MapPin, 
  PlusCircle, 
  Radio, 
  Terminal, 
  UserCheck, 
  Clock, 
  CreditCard,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import { User } from '../types.ts';

interface NavbarProps {
  currentUser: User | null;
  activeTab: 'loads' | 'heatmap' | 'escrow' | 'devops';
  setActiveTab: (tab: 'loads' | 'heatmap' | 'escrow' | 'devops') => void;
  onOpenPostLoad: () => void;
  onSelectPersona: (personaKey: 'transporter' | 'shipper' | 'pending' | 'public') => void;
  isConnected: boolean;
  activeTransportersCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenPostLoad,
  onSelectPersona,
  isConnected,
  activeTransportersCount,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
      {/* Top Ticker: Northern Corridor Real-Time Intelligence */}
      <div className="bg-slate-950 border-b border-slate-800/80 px-4 py-1.5 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            LIVE CORRIDOR
          </span>
          <span className="text-slate-300">
            Northern Corridor (Mombasa Port ➔ Nairobi ICD ➔ Malaba OSBP)
          </span>
          <span className="hidden md:inline text-slate-500">•</span>
          <span className="hidden md:inline text-slate-400">
            Avg Mariakani Delay: <strong className="text-slate-200">12 min</strong>
          </span>
          <span className="hidden md:inline text-slate-500">•</span>
          <span className="hidden md:inline text-slate-400">
            Diesel Price Index: <strong className="text-slate-200">KES 178.50/L</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-[11px]">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-ping' : 'bg-red-500'}`} />
            {isConnected ? `Socket.IO Active (${activeTransportersCount} Hauliers Online)` : 'Connecting Gateway...'}
          </span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-amber-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-white/20">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white font-sans">KenyaLoad</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 font-black text-xs tracking-wider uppercase">ONE</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Kenya Freight Exchange & Escrow</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('loads')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'loads'
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Truck className="w-4 h-4" />
              Live Load Board
            </button>

            <button
              onClick={() => setActiveTab('heatmap')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'heatmap'
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <MapPin className="w-4 h-4" />
              County Heatmap <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 bg-sky-500/20 text-sky-300 rounded">Public</span>
            </button>

            <button
              onClick={() => setActiveTab('escrow')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'escrow'
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              M-Pesa Escrow & e-POD
            </button>

            <button
              onClick={() => setActiveTab('devops')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'devops'
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Terminal className="w-4 h-4" />
              DevOps & Code View
            </button>
          </nav>

          {/* Right Action & Role Switcher */}
          <div className="flex items-center gap-3">
            {/* Quick Post Load Button for Shippers */}
            <button
              onClick={onOpenPostLoad}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3.5 py-2 rounded-lg text-xs md:text-sm flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Cargo</span>
            </button>

            {/* Persona Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 px-3 py-1.5 rounded-lg text-xs transition-colors"
                title="Switch test persona to evaluate public vs verified routes"
              >
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    {currentUser ? (
                      currentUser.verificationStatus === 'VERIFIED' ? (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                      )
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span className="font-semibold text-slate-200 truncate max-w-[120px] md:max-w-[150px]">
                      {currentUser ? currentUser.companyName : 'Public Visitor (Unauth)'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {currentUser ? `${currentUser.role} • ${currentUser.verificationStatus}` : 'Open Public Freight Board'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 space-y-1">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">User & Testing Personas</p>
                    <p className="text-xs text-slate-500">Select active role to explore the corridor exchange</p>
                  </div>

                  <button
                    onClick={() => {
                      onSelectPersona('transporter');
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-slate-800 transition flex items-start gap-2.5 group"
                  >
                    <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 mt-0.5">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-400">Simba Hauliers Kenya Ltd</span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1 rounded font-bold">VERIFIED</span>
                      </div>
                      <p className="text-[11px] text-slate-400">Transporter (Mombasa). Real-time Socket.IO dispatch & escrow release.</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onSelectPersona('shipper');
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-slate-800 transition flex items-start gap-2.5 group"
                  >
                    <div className="p-1.5 rounded bg-blue-500/10 text-blue-400 mt-0.5">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-200 group-hover:text-blue-400">Highland Agro Exports</span>
                        <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1 rounded font-bold">VERIFIED</span>
                      </div>
                      <p className="text-[11px] text-slate-400">Shipper (Nairobi/Eldoret). Post shipments & initiate M-Pesa STK Escrow.</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onSelectPersona('pending');
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-slate-800 transition flex items-start gap-2.5 group"
                  >
                    <div className="p-1.5 rounded bg-amber-500/10 text-amber-400 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-200 group-hover:text-amber-400">Rift Valley Haulage</span>
                        <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1 rounded font-bold">PENDING</span>
                      </div>
                      <p className="text-[11px] text-slate-400">Transporter awaiting NTSA review. Can search all live loads.</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onSelectPersona('public');
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-slate-800 transition flex items-start gap-2.5 group"
                  >
                    <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 mt-0.5">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-400">Public Visitor (Open Access)</span>
                      </div>
                      <p className="text-[11px] text-slate-400">Unauthenticated mode. Full open access to live board and heatmaps.</p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Nav Tabs */}
      <div className="lg:hidden flex border-t border-slate-800 overflow-x-auto px-2 py-2 gap-1 bg-slate-950">
        <button
          onClick={() => setActiveTab('loads')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap ${
            activeTab === 'loads' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
          }`}
        >
          Load Board
        </button>
        <button
          onClick={() => setActiveTab('heatmap')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap ${
            activeTab === 'heatmap' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
          }`}
        >
          Heatmap (Public)
        </button>
        <button
          onClick={() => setActiveTab('escrow')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap ${
            activeTab === 'escrow' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
          }`}
        >
          M-Pesa Escrow
        </button>
        <button
          onClick={() => setActiveTab('devops')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap ${
            activeTab === 'devops' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
          }`}
        >
          DevOps Architecture
        </button>
      </div>
    </header>
  );
};
