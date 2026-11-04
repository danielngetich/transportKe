/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  PlusCircle, 
  Truck, 
  MapPin, 
  Weight, 
  Coins, 
  AlertCircle,
  RefreshCw,
  Radio
} from 'lucide-react';
import { createLoad } from '../services/api.ts';
import { User, EquipmentType } from '../types.ts';

interface PostLoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLoadCreated: () => void;
}

export const PostLoadModal: React.FC<PostLoadModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoadCreated,
}) => {
  const [title, setTitle] = useState('');
  const [commodity, setCommodity] = useState('Agricultural Exports / Grain');
  const [originCounty, setOriginCounty] = useState('Mombasa');
  const [originCity, setOriginCity] = useState('Kilindini Port Gate 12');
  const [destinationCounty, setDestinationCounty] = useState('Busia');
  const [destinationCity, setDestinationCity] = useState('Malaba OSBP Yard');
  const [weightTons, setWeightTons] = useState('28');
  const [equipmentType, setEquipmentType] = useState<EquipmentType>('CONTAINER');
  const [budgetKes, setBudgetKes] = useState('175000');
  const [corridor, setCorridor] = useState('Mombasa-Nairobi-Malaba');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Cargo title description is required.');
      return;
    }

    setLoading(true);

    const res = await createLoad({
      title: title.trim(),
      commodity,
      originCounty,
      originCity,
      destinationCounty,
      destinationCity,
      weightTons: parseFloat(weightTons) || 25,
      equipmentType,
      budgetKes: parseFloat(budgetKes) || 150000,
      corridor,
      targetPickupDate: new Date().toISOString().split('T')[0],
    });

    setLoading(false);

    if (!res.success) {
      setError(res.message || 'Failed to post freight shipment');
      return;
    }

    onLoadCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">Post Freight Along Northern Corridor</h3>
              <p className="text-xs text-slate-400">
                Broadcasting in real-time via Socket.IO to connected {equipmentType} hauliers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Cargo Title / Description *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 500 Bags DAP Fertilizer to Eldoret Depot"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Commodity Type</label>
              <select
                value={commodity}
                onChange={(e) => setCommodity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Industrial Mining & Machinery">Industrial Mining & Machinery</option>
                <option value="Agricultural Exports / Grain">Agricultural Exports / Grain</option>
                <option value="DAP / Urea Fertilizer">DAP / Urea Fertilizer</option>
                <option value="Petroleum / Diesel AGO">Petroleum / Diesel AGO</option>
                <option value="FMCG & Consumer Goods">FMCG & Consumer Goods</option>
                <option value="Horticulture & Flowers">Horticulture & Flowers</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Equipment Type Required *</label>
              <select
                value={equipmentType}
                onChange={(e) => setEquipmentType(e.target.value as EquipmentType)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="CONTAINER">Container (Skeletal Semi-Trailer)</option>
                <option value="FLATBED">Flatbed (Heavy Cargo / Machinery)</option>
                <option value="BOX_BODY">Box Body (Enclosed Dry Cargo)</option>
                <option value="TANKER">Tanker (Liquid / Petroleum)</option>
                <option value="REEFER">Reefer (Cold Chain / Agro)</option>
                <option value="CANTER">Canter (3-10 Ton Regional)</option>
              </select>
            </div>
          </div>

          {/* Origin & Destination */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Origin
              </span>
              <select
                value={originCounty}
                onChange={(e) => setOriginCounty(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
              >
                <option value="Mombasa">Mombasa County</option>
                <option value="Nairobi">Nairobi County</option>
                <option value="Nakuru">Nakuru County</option>
                <option value="Machakos">Machakos County</option>
                <option value="Kilifi">Kilifi County</option>
              </select>
              <input
                type="text"
                value={originCity}
                onChange={(e) => setOriginCity(e.target.value)}
                placeholder="Specific Loading Point (e.g. CFS Gate)"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-sky-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Destination
              </span>
              <select
                value={destinationCounty}
                onChange={(e) => setDestinationCounty(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
              >
                <option value="Busia">Busia / Malaba Border</option>
                <option value="Uasin Gishu">Uasin Gishu (Eldoret)</option>
                <option value="Nairobi">Nairobi ICD</option>
                <option value="Kisumu">Kisumu County</option>
                <option value="Nakuru">Nakuru County</option>
              </select>
              <input
                type="text"
                value={destinationCity}
                onChange={(e) => setDestinationCity(e.target.value)}
                placeholder="Specific Delivery Depot"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>
          </div>

          {/* Weight & Budget */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                <Weight className="w-3.5 h-3.5 text-slate-400" />
                Weight (Tons)
              </label>
              <input
                type="number"
                step="0.5"
                required
                value={weightTons}
                onChange={(e) => setWeightTons(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-emerald-400" />
                Freight Budget (KES)
              </label>
              <input
                type="number"
                required
                value={budgetKes}
                onChange={(e) => setBudgetKes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-emerald-400 font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Real-time Socket Dispatch Notification Notice */}
          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3 text-[11px] text-emerald-300 flex items-center gap-2 font-mono">
            <Radio className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
            <span>
              Instant WebSocket Dispatch: Active transporters subscribed to room{' '}
              <strong>equipment:{equipmentType}</strong> along the Mombasa-Malaba corridor will receive an instant push notification.
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition active:scale-95"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
              Broadcast Live Load
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
