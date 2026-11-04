/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * KenyaLoad One - Public Market & Heatmap Routes
 */

import { Router } from 'express';
import { getMarketSummary, getCountyHeatmaps } from '../controllers/marketController.ts';

const router = Router();

// Publicly accessible endpoints (No JWT or verification required)
router.get('/market-summary', getMarketSummary);
router.get('/heatmaps', getCountyHeatmaps);

export default router;
