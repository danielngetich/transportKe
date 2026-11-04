/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * KenyaLoad One - Safaricom M-Pesa Escrow Routes
 */

import { Router } from 'express';
import { initiateEscrow, releaseEscrow, getEscrowStatus } from '../controllers/paymentController.ts';

const router = Router();

// Initiate Safaricom STK Push to lock freight fee in Escrow
router.post('/initiate', initiateEscrow);

// Release Escrow funds to Transporter upon e-POD 6-digit OTP verification
router.post('/release', releaseEscrow);

// Status check and audit log
router.get('/status/:bookingId', getEscrowStatus);

export default router;
