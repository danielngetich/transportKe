/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * KenyaLoad One - Truck Fleet Controller
 * Protected by authMiddleware (Verified Transporters & Shippers only)
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import { dbStore, StoredTruck } from '../db/store.ts';

/**
 * GET /api/v1/trucks
 * Search available carrier fleets
 */
export async function getTrucks(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { equipmentType, currentCounty } = req.query;

  let trucks = Array.from(dbStore.trucks.values());

  if (equipmentType && typeof equipmentType === 'string' && equipmentType !== 'ALL') {
    trucks = trucks.filter((t) => t.equipmentType.toUpperCase() === equipmentType.toUpperCase());
  }

  if (currentCounty && typeof currentCounty === 'string') {
    trucks = trucks.filter((t) => t.currentCounty.toLowerCase() === currentCounty.toLowerCase());
  }

  res.status(200).json({
    success: true,
    total: trucks.length,
    data: trucks,
    authenticatedUser: req.user?.companyName,
  });
}

/**
 * POST /api/v1/trucks
 * Register an active truck on the board
 */
export async function createTruck(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { registrationNo, equipmentType, maxCapacityTons, currentLocation, currentCounty } = req.body;

  if (!registrationNo || !equipmentType || !maxCapacityTons) {
    res.status(400).json({ success: false, message: 'Missing registrationNo, equipmentType, or maxCapacityTons' });
    return;
  }

  const truck: StoredTruck = {
    id: `trk-${Date.now().toString().slice(-5)}`,
    registrationNo: registrationNo.toUpperCase(),
    equipmentType: equipmentType.toUpperCase(),
    maxCapacityTons: Number(maxCapacityTons),
    currentLocation: currentLocation || 'Nairobi ICD Embakasi',
    currentCounty: currentCounty || 'Nairobi',
    status: 'AVAILABLE',
    transporterId: req.user?.userId || 'usr-transporter-01',
    transporterName: req.user?.companyName || 'Verified Transporter',
    transporterPhone: '254722998877',
  };

  dbStore.trucks.set(truck.id, truck);

  res.status(201).json({
    success: true,
    message: 'Truck posted to active board',
    data: truck,
  });
}
