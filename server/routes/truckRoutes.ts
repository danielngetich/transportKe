/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * KenyaLoad One - Truck Fleet Routes
 * Strictly protected: requires verified carrier/shipper JWT
 */

import { Router } from 'express';
import { getTrucks, createTruck } from '../controllers/truckController.ts';

const router = Router();

router.get('/', getTrucks);
router.post('/', createTruck);

export default router;
