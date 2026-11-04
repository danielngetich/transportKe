/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * KenyaLoad One - JWT Authentication & NTSA/KRA Verification Middleware
 * 
 * Enforces strict access control:
 * 1. Allows public GET access to market summary metrics and county heatmaps.
 * 2. Strictly blocks unauthenticated or unverified users from accessing
 *    the live load board, truck listings, carrier contacts, bids, and booking routes.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'kenyload-one-secure-corridor-key-2026';

export type UserRole = 'SHIPPER' | 'TRANSPORTER' | 'AGENT' | 'ADMIN';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  verificationStatus: VerificationStatus;
  companyName: string;
  kraPin?: string;
  ntsaLicenceNo?: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

/**
 * Public routes that unauthenticated or non-verified visitors may access
 * (GET market summaries, county supply/demand heatmaps, and health status)
 */
const PUBLIC_WHITELIST = [
  { path: '/api/v1/market-summary', method: 'GET' },
  { path: '/api/v1/heatmaps', method: 'GET' },
  { path: '/api/v1/auth/login', method: 'POST' },
  { path: '/api/v1/auth/register', method: 'POST' },
  { path: '/api/v1/auth/demo-tokens', method: 'GET' },
  { path: '/api/v1/health', method: 'GET' },
];

/**
 * Helper to check if a route is in the public whitelist
 */
function isPublicRoute(req: Request): boolean {
  return PUBLIC_WHITELIST.some((rule) => {
    return req.path === rule.path && req.method === rule.method;
  });
}

/**
 * Core Auth Middleware
 * 
 * Complies with KenyaLoad One security constraint:
 * - Allows public GET /api/v1/market-summary and /api/v1/heatmaps.
 * - Blocks /api/v1/loads, /api/v1/trucks, /api/v1/bookings with 401 Unauthorized
 *   if token is missing, invalid, or user VerificationStatus is not 'VERIFIED'.
 */
export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  // 1. Allow Whitelisted Public Routes
  if (isPublicRoute(req)) {
    return next();
  }

  // 2. Extract Authorization Header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'UnauthorizedAccess',
      message: 'Access denied: Missing or malformed Authorization Bearer token. Please sign in to KenyaLoad One.',
      publicAllowedEndpoints: ['/api/v1/market-summary', '/api/v1/heatmaps'],
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    // 3. Verify JWT Signature and Expiry
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    req.user = decoded;

    // 4. Verification Status Check (NTSA, KRA, Business Reg)
    // Only 'VERIFIED' users can search loads/trucks, submit bids, or book cargo
    if (decoded.verificationStatus !== 'VERIFIED') {
      res.status(401).json({
        success: false,
        error: 'AccountNotVerified',
        message: `Account status is '${decoded.verificationStatus}'. NTSA Commercial License, KRA Tax Compliance, and Business Registration verification is required to access live freight boards, truck fleets, and contact details.`,
        verificationStatus: decoded.verificationStatus,
        requiredSteps: [
          'Upload NTSA Road Service License',
          'Upload KRA PIN Certificate',
          'Submit Logbook / Goods In Transit (GIT) Insurance',
          'Wait for KenyaLoad Compliance Team Approval (approx. 2-4 hours)',
        ],
      });
      return;
    }

    // User is authenticated and fully verified
    next();
  } catch (err: unknown) {
    const error = err as Error;
    res.status(401).json({
      success: false,
      error: 'InvalidToken',
      message: error.name === 'TokenExpiredError' 
        ? 'Session token has expired. Please log in again.' 
        : 'Invalid or forged authentication token.',
    });
  }
}

/**
 * Role-Based Access Control (RBAC) guard
 * Example: requireRole(['TRANSPORTER', 'ADMIN'])
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthenticated' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'ForbiddenRole',
        message: `Your account role (${req.user.role}) is not authorized for this resource. Required: [${allowedRoles.join(', ')}]`,
      });
      return;
    }

    next();
  };
}
