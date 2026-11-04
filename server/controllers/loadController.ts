/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * KenyaLoad One - Freight Load Controller
 * Protected by authMiddleware (Verified Transporters & Shippers only)
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import { dbStore, StoredLoad } from '../db/store.ts';
import { LoadBoardGateway } from '../gateways/loadGateway.ts';

// Singleton reference to the WebSocket Gateway set by server.ts
let activeGateway: LoadBoardGateway | null = null;

export function setGatewayInstance(gateway: LoadBoardGateway): void {
  activeGateway = gateway;
}

export function getGatewayInstance(): LoadBoardGateway | null {
  return activeGateway;
}

/**
 * GET /api/v1/loads
 * Lists available loads along the corridor with filtering
 */
export async function getLoads(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { equipmentType, originCounty, destinationCounty, minBudget, status } = req.query;

  let loads = Array.from(dbStore.loads.values());

  if (equipmentType && typeof equipmentType === 'string' && equipmentType !== 'ALL') {
    loads = loads.filter((l) => l.equipmentType.toUpperCase() === equipmentType.toUpperCase());
  }

  if (originCounty && typeof originCounty === 'string') {
    loads = loads.filter((l) => l.originCounty.toLowerCase() === originCounty.toLowerCase());
  }

  if (destinationCounty && typeof destinationCounty === 'string') {
    loads = loads.filter((l) => l.destinationCounty.toLowerCase() === destinationCounty.toLowerCase());
  }

  if (minBudget && typeof minBudget === 'string') {
    const min = parseFloat(minBudget);
    if (!isNaN(min)) {
      loads = loads.filter((l) => l.budgetKes >= min);
    }
  }

  if (status && typeof status === 'string') {
    loads = loads.filter((l) => l.status === status);
  } else {
    // Default to available and in-transit loads
    loads = loads.filter((l) => l.status === 'AVAILABLE' || l.status === 'IN_TRANSIT');
  }

  // Sort descending by creation date
  loads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.status(200).json({
    success: true,
    total: loads.length,
    data: loads,
    requestedBy: {
      userId: req.user?.userId,
      company: req.user?.companyName,
      role: req.user?.role,
    },
  });
}

/**
 * GET /api/v1/loads/:id
 * Load details with carrier contact unlocking
 */
export async function getLoadById(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const load = dbStore.loads.get(id);

  if (!load) {
    res.status(404).json({ success: false, error: 'LoadNotFound', message: `Load ${id} does not exist.` });
    return;
  }

  res.status(200).json({
    success: true,
    data: load,
  });
}

/**
 * POST /api/v1/loads
 * Post new cargo. Triggers real-time WebSocket broadcast to all matching transporters!
 */
export async function createLoad(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const {
      title,
      commodity,
      originCounty,
      originCity,
      destinationCounty,
      destinationCity,
      weightTons,
      volumeCbm,
      equipmentType,
      budgetKes,
      targetPickupDate,
      corridor,
    } = req.body;

    if (!title || !originCounty || !destinationCounty || !weightTons || !equipmentType || !budgetKes) {
      res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Missing required freight fields: title, originCounty, destinationCounty, weightTons, equipmentType, budgetKes',
      });
      return;
    }

    const loadId = `load-kl-${Date.now().toString().slice(-6)}`;
    const shipper = dbStore.users.get(req.user?.userId || '') || {
      id: req.user?.userId || 'usr-shipper-01',
      companyName: req.user?.companyName || 'Verified Shipper',
      phoneNumber: '254712345678',
    };

    const newLoad: StoredLoad = {
      id: loadId,
      title,
      commodity: commodity || 'General Commercial Freight',
      originCounty,
      originCity: originCity || `${originCounty} Town`,
      destinationCounty,
      destinationCity: destinationCity || `${destinationCounty} Town`,
      weightTons: Number(weightTons),
      volumeCbm: volumeCbm ? Number(volumeCbm) : undefined,
      equipmentType: equipmentType.toUpperCase(),
      budgetKes: Number(budgetKes),
      targetPickupDate: targetPickupDate || new Date().toISOString().split('T')[0],
      status: 'AVAILABLE',
      corridor: corridor || 'Mombasa-Nairobi-Malaba',
      shippedById: shipper.id,
      shippedByName: shipper.companyName,
      shipperPhone: shipper.phoneNumber,
      createdAt: new Date().toISOString(),
    };

    // Save to store
    dbStore.loads.set(newLoad.id, newLoad);

    // Broadcast in real-time via WebSocket Gateway
    if (activeGateway) {
      activeGateway.broadcastNewLoad(newLoad);
    }

    res.status(201).json({
      success: true,
      message: 'Freight shipment posted successfully. Live broadcast dispatched to active transporters.',
      data: newLoad,
    });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, error: err.message });
  }
}
