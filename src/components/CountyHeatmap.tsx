/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  MapPin, 
  TrendingUp, 
  Truck, 
  Layers, 
  Clock, 
  Coins, 
  ShieldCheck, 
  Globe2,
  ArrowUpRight,
  ArrowDownRight,
  Navigation
} from 'lucide-react';
import { CountyMarketMetric, MarketSummary } from '../types.ts';

interface CountyHeatmapProps {
  heatmaps: CountyMarketMetric[];
  marketSummary: MarketSummary | null;
  onExploreLoads: () => void;
}

export const CountyHeatmap: React.FC<CountyHeatmapProps> = ({
  heatmaps,
  marketSummary,
  onExploreLoads,
}) => {
  const [selectedCounty, setSelectedCounty] = React.useState<CountyMarketMetric | null>(
    heatmaps[0] || null
  );

  return (
    <div className="space-y-6">
      {/* Public Access Badge Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-2">
              <Globe2 className="w-3.5 h-3.5" />
              PUBLIC MARKET INTELLIGENCE — UNRESTRICTED ACCESS
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Kenya Freight Supply & Demand Heatmap
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl">
              County-level spot demand indices, load-to-truck ratios, and corridor velocity metrics
              across the Mombasa-Nairobi-Malaba transit artery.
            </p>
          </div>

          <button
            onClick={onExploreLoads}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 self-start md:self-auto transition"
          >
            <Truck className="w-4 h-4" />
            <span>Search Live Loads</span>
          </button>
        </div>

        {/* Global Statistics Grid (Available to Public) */}
        {marketSummary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
            <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                Loads Posted Today
              </span>
              <p className="text-2xl font-black text-white mt-1 font-mono">
                {marketSummary.nationalMetrics.totalLoadsPostedToday.toLocaleString('en-KE')}
              </p>
              <span className="text-[11px] text-emerald-400 font-medium">Corridor-wide volume</span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-sky-400" />
                Active Truck Fleets
              </span>
              <p className="text-2xl font-black text-white mt-1 font-mono">
                {marketSummary.nationalMetrics.activeRegisteredTrucks.toLocaleString('en-KE')}
              </p>
              <span className="text-[11px] text-sky-400 font-medium">NTSA verified capacity</span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                Avg Rate Per Ton-Km
              </span>
              <p className="text-2xl font-black text-white mt-1 font-mono">
                KES {marketSummary.nationalMetrics.averageRatePerTonKmKes}
              </p>
              <span className="text-[11px] text-amber-400 font-medium">Spot freight index</span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                M-Pesa Escrow Lock
              </span>
              <p className="text-2xl font-black text-white mt-1 font-mono">
                {marketSummary.nationalMetrics.averageEscrowLockTimeSec}s
              </p>
              <span className="text-[11px] text-purple-400 font-medium">Avg STK push execution</span>
            </div>
          </div>
        )}
      </div>

      {/* Corridor Checkpoints Status Ticker */}
      {marketSummary?.keyCorridorCheckpoints && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-emerald-400" />
            Key Weighbridges & Customs Inspection Checkpoints
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {marketSummary.keyCorridorCheckpoints.map((pt, idx) => (
              <div key={idx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs">
                <p className="font-bold text-slate-200 truncate">{pt.name}</p>
                <p className="text-[11px] text-emerald-400 font-mono mt-0.5">{pt.status}</p>
                <p className="text-[10px] text-slate-500 mt-1">
                  {pt.delayMins !== undefined ? `Delay: ${pt.delayMins}m` : `Clearance: ~${pt.clearanceHrs}h`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* County Supply & Demand Heatmap Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {heatmaps.map((county) => {
          const isShortage = county.loadToTruckRatio > 1.8;
          const isSurplus = county.loadToTruckRatio < 0.8;
          const isSelected = selectedCounty?.county === county.county;

          return (
            <div
              key={county.county}
              onClick={() => setSelectedCounty(county)}
              className={`cursor-pointer rounded-2xl p-4 transition-all border ${
                isSelected
                  ? 'bg-slate-850 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xl'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    {county.county}
                  </h3>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    {county.corridorRole.replace('_', ' ')}
                  </span>
                </div>

                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                    isShortage
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : isSurplus
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {isShortage ? (
                    <>
                      <ArrowUpRight className="w-3 h-3 text-rose-400" />
                      Carrier Market
                    </>
                  ) : isSurplus ? (
                    <>
                      <ArrowDownRight className="w-3 h-3 text-sky-400" />
                      Shipper Surplus
                    </>
                  ) : (
                    'Balanced'
                  )}
                </span>
              </div>

              {/* Load to Truck Ratio Indicator */}
              <div className="mt-4 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Load-to-Truck Ratio:</span>
                  <span className="font-extrabold text-white font-mono">
                    {county.loadToTruckRatio.toFixed(2)} : 1
                  </span>
                </div>

                {/* Visual Ratio Bar */}
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isShortage ? 'bg-rose-500' : isSurplus ? 'bg-sky-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, (county.loadToTruckRatio / 3.5) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Sub Metrics */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Active Loads</span>
                  <span className="font-bold text-slate-200">{county.availableLoads}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Available Trucks</span>
                  <span className="font-bold text-slate-200">{county.availableTrucks}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Avg Rate / Ton</span>
                  <span className="font-bold text-emerald-400 font-mono">KES {county.avgRatePerTonKes}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Transit to NBO</span>
                  <span className="font-bold text-slate-300">{county.avgTransitHoursToNairobi}h</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected County In-Depth Intelligence */}
      {selectedCounty && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Freight Corridor Profile: {selectedCounty.county} County
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            {selectedCounty.county === 'Mombasa' &&
              'Port of Mombasa Kilindini discharges 2,800+ TEU containers daily. Extremely high outbound haulage demand towards Nairobi ICD and Uganda (Malaba). Spot rates command premium pricing.'}
            {selectedCounty.county === 'Nairobi' &&
              'Central clearing hub (ICD Embakasi, SGR inland depot). Equalized transshipment volume with high regional distribution toward Mt. Kenya and Rift Valley.'}
            {selectedCounty.county === 'Busia' &&
              'Great Lakes border gateway (Malaba & Busia OSBP). High volume of empty trucks returning eastbound to Mombasa; transiting carriers offer discounted backhaul freight rates.'}
            {selectedCounty.county === 'Uasin Gishu' &&
              'Eldoret grain and agricultural export capital. High seasonal demand for Flatbed and Canter haulage transporting fertilizer inland and tea/grain outbound.'}
            {!['Mombasa', 'Nairobi', 'Busia', 'Uasin Gishu'].includes(selectedCounty.county) &&
              `Strategic Northern Corridor waypoint with active local commercial traffic and standard KES ${selectedCounty.avgRatePerTonKes} average per ton haulage rate.`}
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 font-mono">
            <span>• Estimated corridor transit: {selectedCounty.avgTransitHoursToNairobi} hours to Nairobi</span>
            <span>• Status: {selectedCounty.demandIntensity.replace('_', ' ')}</span>
          </div>
        </div>
      )}
    </div>
  );
};
