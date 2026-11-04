/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * KenyaLoad One - Market Summary & County Supply/Demand Heatmap Controller
 * 
 * PUBLIC ENDPOINTS:
 * - GET /api/v1/market-summary
 * - GET /api/v1/heatmaps
 * 
 * Open to public unauthenticated visitors without requiring JWT or NTSA verification.
 */

import { Request, Response } from 'express';
import { dbStore } from '../db/store.ts';

/**
 * GET /api/v1/market-summary
 * Returns national and corridor-wide freight indicators
 */
export async function getMarketSummary(_req: Request, res: Response): Promise<void> {
  const activeLoadsCount = Array.from(dbStore.loads.values()).filter(l => l.status === 'AVAILABLE').length;
  const activeTrucksCount = Array.from(dbStore.trucks.values()).filter(t => t.status === 'AVAILABLE').length;

  const summary = {
    corridor: 'Northern Corridor (Mombasa - Nairobi - Malaba - Kampala)',
    nationalMetrics: {
      totalLoadsPostedToday: activeLoadsCount + 482,
      activeLiveLoads: activeLoadsCount,
      activeRegisteredTrucks: activeTrucksCount + 312,
      averageRatePerTonKmKes: 52.4, // KES per ton-km
      mombasaPortOutboundSurge: 'High (3.46 loads per available truck)',
      nairobiTransshipmentRatio: 'Balanced (1.19 ratio)',
      malabaBorderBackhaulRateKes: 'Discounted - 25% surplus empty backhauls to Mombasa',
      averageEscrowLockTimeSec: 14.2,
      currency: 'KES',
    },
    keyCorridorCheckpoints: [
      { name: 'Mombasa Port (Kilindini)', status: 'Heavy Outbound Container Discharge', clearanceHrs: 4.5 },
      { name: 'Mariakani Weighbridge', status: 'Fluid - Auto HSWIM Operating', delayMins: 12 },
      { name: 'Athi River Weighbridge', status: 'Moderate Traffic', delayMins: 25 },
      { name: 'Nairobi ICD Embakasi', status: 'High Cross-Dock Activity', delayMins: 15 },
      { name: 'Naivasha Dry Port', status: 'Active SGR Rail Transfer', delayMins: 20 },
      { name: 'Salgaa / Mau Summit', status: 'Clear Corridor Flow', delayMins: 5 },
      { name: 'Malaba OSBP (Uganda Border)', status: 'Active Regional Clearance', clearanceHrs: 3.2 },
    ],
    timestamp: new Date().toISOString(),
  };

  res.status(200).json({
    success: true,
    data: summary,
  });
}

/**
 * GET /api/v1/heatmaps
 * Returns generalized supply/demand freight density across Kenyan counties
 */
export async function getCountyHeatmaps(_req: Request, res: Response): Promise<void> {
  const heatmaps = dbStore.getCountyHeatmaps();

  res.status(200).json({
    success: true,
    count: heatmaps.length,
    data: heatmaps,
    explanation: 'Load-to-Truck Ratio > 1.5 indicates critical freight shortage (higher carrier rates). Ratio < 0.8 indicates truck surplus (discounted backhauls).',
    timestamp: new Date().toISOString(),
  });
}
