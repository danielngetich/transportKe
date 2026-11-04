/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * KenyaLoad One - Bookings & Matched Freight Controller
 * Protected by authMiddleware (Verified Transporters & Shippers only)
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import { dbStore, StoredBooking } from '../db/store.ts';

/**
 * GET /api/v1/bookings
 * Returns user bookings
 */
export async function getBookings(req: AuthenticatedRequest, res: Response): Promise<void> {
  const bookings = Array.from(dbStore.bookings.values());

  res.status(200).json({
    success: true,
    total: bookings.length,
    data: bookings,
  });
}

/**
 * POST /api/v1/bookings
 * Book a load and generate an escrow agreement
 */
export async function createBooking(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { loadId, finalAgreedPrice, driverName, driverPhone, truckId } = req.body;

  if (!loadId) {
    res.status(400).json({ success: false, message: 'loadId is required' });
    return;
  }

  const load = dbStore.loads.get(loadId);
  if (!load) {
    res.status(404).json({ success: false, message: 'Load not found' });
    return;
  }

  const bookingId = `bk-kl-${Date.now().toString().slice(-6)}`;
  const booking: StoredBooking = {
    id: bookingId,
    loadId,
    transporterId: req.user?.userId || 'usr-transporter-01',
    transporterName: req.user?.companyName || 'Simba Hauliers Kenya Ltd',
    truckId: truckId || 'trk-01',
    finalAgreedPrice: finalAgreedPrice ? Number(finalAgreedPrice) : load.budgetKes,
    driverName: driverName || 'Kariuki Ndegwa',
    driverPhone: driverPhone || '254711223344',
    escrowStatus: 'PENDING_STK',
    createdAt: new Date().toISOString(),
  };

  dbStore.bookings.set(booking.id, booking);
  load.status = 'BOOKED';

  res.status(201).json({
    success: true,
    message: 'Booking created. Awaiting Shipper M-Pesa STK Escrow confirmation.',
    data: booking,
  });
}
