/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * KenyaLoad One - Bookings Routes
 */

import { Router } from 'express';
import { getBookings, createBooking } from '../controllers/bookingController.ts';

const router = Router();

router.get('/', getBookings);
router.post('/', createBooking);

export default router;
