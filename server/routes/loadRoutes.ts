/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * KenyaLoad One - Freight Load Routes
 * Strictly protected: requires verified transporter/shipper JWT
 */

import { Router } from 'express';
import { getLoads, getLoadById, createLoad } from '../controllers/loadController.ts';

const router = Router();

router.get('/', getLoads);
router.get('/:id', getLoadById);
router.post('/', createLoad);

export default router;
