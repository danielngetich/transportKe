/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Filter, 
  MapPin, 
  ArrowRightLeft, 
  Search, 
  X, 
  Coins, 
  Truck, 
  Layers, 
  Box, 
  Container, 
  Fuel, 
  Snowflake, 
  Zap,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { EquipmentType, Load } from '../types.ts';

export interface FilterState {
  equipmentType: string; // 'ALL' | EquipmentType
  originCounty: string;  // 'ALL' | county name
  destinationCounty: string; // 'ALL' | county name
  searchQuery: string;
  minBudget: number;
  corridorPreset: string;
}

interface LoadFilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onResetFilters: () => void;
  totalLoadsCount: number;
  filteredLoadsCount: number;
  allLoads: Load[];
}

const KENYAN_FREIGHT_COUNTIES = [
  { value: 'ALL', label: 'All Counties' },
  { value: 'Mombasa', label: 'Mombasa (Kilindini Port / CFS)' },
  { value: 'Nairobi', label: 'Nairobi (ICD Embakasi & Industrial)' },
  { value: 'Nakuru', label: 'Nakuru (Naivasha Dry Port & Rift)' },
  { value: 'Uasin Gishu', label: 'Uasin Gishu (Eldoret Agri Hub)' },
  { value: 'Busia', label: 'Busia (Malaba OSBP Uganda Border)' },
  { value: 'Kisumu', label: 'Kisumu (Lake Basin & Regional)' },
  { value: 'Machakos', label: 'Machakos (Athi River Weighbridge)' },
  { value: 'Kilifi', label: 'Kilifi (Mtwapa / VIPINGO Corridor)' },
];

const EQUIPMENT_OPTIONS: Array<{
  value: string;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}> = [
  { value: 'ALL', label: 'All Equipment', shortLabel: 'All', icon: Layers, description: 'All freight types' },
  { value: 'CONTAINER', label: 'Container (20/40ft)', shortLabel: 'Container', icon: Container, description: 'Port skeletal chassis' },
  { value: 'FLATBED', label: 'Flatbed (Machinery/Steel)', shortLabel: 'Flatbed', icon: Truck, description: 'Heavy machinery & steel' },
  { value: 'BOX_BODY', label: 'Box Body (Dry/FMCG)', shortLabel: 'Box Body', icon: Box, description: 'Secure enclosed goods' },
  { value: 'TANKER', label: 'Tanker (Petroleum/Bulk)', shortLabel: 'Tanker', icon: Fuel, description: 'AGO Diesel & bulk oil' },
  { value: 'REEFER', label: 'Reefer (Cold Chain)', shortLabel: 'Reefer', icon: Snowflake, description: 'Horticulture & meat' },
  { value: 'CANTER', label: 'Canter (3-10 Ton)', shortLabel: 'Canter', icon: Zap, description: 'Last-mile distribution' },
];

export const LoadFilterBar: React.FC<LoadFilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalLoadsCount,
  filteredLoadsCount,
  allLoads,
}) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  // Calculate counts per equipment type for dynamic badges
  const equipmentCounts = React.useMemo(() => {
    const counts: Record<string, number> = { ALL: allLoads.length };
    EQUIPMENT_OPTIONS.forEach((eq) => {
      if (eq.value !== 'ALL') {
        counts[eq.value] = allLoads.filter((l) => l.equipmentType === eq.value).length;
      }
    });
    return counts;
  }, [allLoads]);

  // Handle individual filter updates
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  // Swap Origin and Destination counties (classic freight load board backhaul feature)
  const handleSwapLocations = () => {
    const newOrigin = filters.destinationCounty;
    const newDestination = filters.originCounty;
    onFilterChange({
      ...filters,
      originCounty: newOrigin,
      destinationCounty: newDestination,
    });
  };

  // Check if any non-default filters are active
  const hasActiveFilters =
    filters.equipmentType !== 'ALL' ||
    filters.originCounty !== 'ALL' ||
    filters.destinationCounty !== 'ALL' ||
    filters.searchQuery.trim() !== '' ||
    filters.minBudget > 0 ||
    filters.corridorPreset !== 'ALL';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5 shadow-xl space-y-4">
      {/* Top Header: Title, Active Matches Badge & Quick Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
              Freight Search & Corridor Filters
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {filteredLoadsCount} of {totalLoadsCount} Loads
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Filter spot freight by equipment specification, origin-destination pair, and minimum budget.
            </p>
          </div>
        </div>

        {/* Search input & Advanced toggle */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search commodity, depot, ID..."
              value={filters.searchQuery}
              onChange={(e) => updateFilter('searchQuery', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-8 pr-8 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {filters.searchQuery && (
              <button
                onClick={() => updateFilter('searchQuery', '')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition ${
              showAdvanced || filters.minBudget > 0 || filters.corridorPreset !== 'ALL'
                ? 'bg-slate-800 border-emerald-500/50 text-emerald-400'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Advanced</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1.5 rounded-lg hover:bg-rose-500/10 flex items-center gap-1 transition"
              title="Reset all filters"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. EQUIPMENT TYPE SELECTOR (Visual interactive chips with icons & live counts) */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-emerald-400" />
            Equipment Type Filter:
          </span>
          <span className="text-[10px] text-slate-400 normal-case font-mono">
            Selected: <strong className="text-white">{filters.equipmentType === 'ALL' ? 'All Types' : filters.equipmentType}</strong>
          </span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {EQUIPMENT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = filters.equipmentType === opt.value;
            const count = equipmentCounts[opt.value] || 0;

            return (
              <button
                key={opt.value}
                onClick={() => updateFilter('equipmentType', opt.value)}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between group relative ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20 ring-2 ring-emerald-500/30'
                    : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <Icon
                    className={`w-4 h-4 ${
                      isSelected ? 'text-slate-950' : 'text-slate-400 group-hover:text-emerald-400'
                    }`}
                  />
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-black ${
                      isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold truncate leading-tight">{opt.shortLabel}</p>
                  <p
                    className={`text-[9px] truncate ${
                      isSelected ? 'text-slate-900' : 'text-slate-500'
                    }`}
                  >
                    {opt.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. ORIGIN & DESTINATION COUNTY ROUTING CONTROLS */}
      <div className="grid grid-cols-1 md:grid-cols-11 gap-2 pt-1 items-center">
        {/* Origin County Dropdown */}
        <div className="md:col-span-5 bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
          <label className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Origin County
            </span>
            {filters.originCounty !== 'ALL' && (
              <button
                onClick={() => updateFilter('originCounty', 'ALL')}
                className="text-[10px] text-slate-500 hover:text-slate-300"
              >
                Clear
              </button>
            )}
          </label>
          <select
            value={filters.originCounty}
            onChange={(e) => updateFilter('originCounty', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {KENYAN_FREIGHT_COUNTIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Swap Origin ⇄ Destination Button */}
        <div className="md:col-span-1 flex justify-center py-1 md:py-0">
          <button
            type="button"
            onClick={handleSwapLocations}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 border border-slate-700 text-slate-300 flex items-center justify-center transition shadow-md group"
            title="Swap Origin and Destination for Return Backhaul"
          >
            <ArrowRightLeft className="w-4 h-4 transition-transform group-hover:rotate-180" />
          </button>
        </div>

        {/* Destination County Dropdown */}
        <div className="md:col-span-5 bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
          <label className="text-[11px] font-bold text-sky-400 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Destination County
            </span>
            {filters.destinationCounty !== 'ALL' && (
              <button
                onClick={() => updateFilter('destinationCounty', 'ALL')}
                className="text-[10px] text-slate-500 hover:text-slate-300"
              >
                Clear
              </button>
            )}
          </label>
          <select
            value={filters.destinationCounty}
            onChange={(e) => updateFilter('destinationCounty', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {KENYAN_FREIGHT_COUNTIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. ADVANCED CONTROLS (Corridor Presets & Minimum Budget Slider) */}
      {showAdvanced && (
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-150">
          {/* Corridor Quick Presets */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-amber-400" />
              Corridor Route Presets
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'ALL', label: 'All Corridors' },
                { id: 'mombasa-malaba', label: 'Mombasa ➔ Malaba (Full Transit)', origin: 'Mombasa', dest: 'Busia' },
                { id: 'mombasa-nairobi', label: 'Mombasa ➔ Nairobi (Port Import)', origin: 'Mombasa', dest: 'Nairobi' },
                { id: 'malaba-mombasa', label: 'Western ➔ Mombasa (Backhaul)', origin: 'Busia', dest: 'Mombasa' },
                { id: 'nairobi-upcountry', label: 'Nairobi ➔ Upcountry Hubs', origin: 'Nairobi', dest: 'ALL' },
              ].map((preset) => {
                const isActive =
                  preset.id === 'ALL'
                    ? filters.originCounty === 'ALL' && filters.destinationCounty === 'ALL'
                    : filters.originCounty === preset.origin && filters.destinationCounty === preset.dest;

                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      if (preset.id === 'ALL') {
                        onFilterChange({
                          ...filters,
                          originCounty: 'ALL',
                          destinationCounty: 'ALL',
                          corridorPreset: 'ALL',
                        });
                      } else {
                        onFilterChange({
                          ...filters,
                          originCounty: preset.origin!,
                          destinationCounty: preset.dest!,
                          corridorPreset: preset.id,
                        });
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Min Budget Filter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-emerald-400" />
                Minimum Budget (KES)
              </span>
              <span className="font-mono text-emerald-400 font-bold">
                {filters.minBudget > 0 ? `KES ${filters.minBudget.toLocaleString('en-KE')}+` : 'Any Budget'}
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="200000"
              step="10000"
              value={filters.minBudget}
              onChange={(e) => updateFilter('minBudget', Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />

            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>KES 0</span>
              <span>KES 50,000</span>
              <span>KES 100,000</span>
              <span>KES 200,000</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. ACTIVE FILTERS PILLS SUMMARY */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60 text-xs">
          <span className="text-slate-500 text-[11px] font-semibold">Active Filters:</span>

          {filters.equipmentType !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium">
              Equipment: {filters.equipmentType}
              <button
                onClick={() => updateFilter('equipmentType', 'ALL')}
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.originCounty !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium">
              From: {filters.originCounty}
              <button
                onClick={() => updateFilter('originCounty', 'ALL')}
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.destinationCounty !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-300 text-[11px] font-medium">
              To: {filters.destinationCounty}
              <button
                onClick={() => updateFilter('destinationCounty', 'ALL')}
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.minBudget > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-medium">
              Min: KES {filters.minBudget.toLocaleString('en-KE')}
              <button
                onClick={() => updateFilter('minBudget', 0)}
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.searchQuery.trim() !== '' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[11px] font-medium">
              "{filters.searchQuery}"
              <button
                onClick={() => updateFilter('searchQuery', '')}
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={onResetFilters}
            className="text-[11px] text-slate-400 hover:text-rose-400 hover:underline ml-auto"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};
