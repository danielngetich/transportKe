/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * KenyaLoad One - Auth Routes
 */

import { Router } from 'express';
import { login, getDemoTokens } from '../controllers/authController.ts';

const router = Router();

router.post('/login', login);
router.get('/demo-tokens', getDemoTokens);

export default router;
