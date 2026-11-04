/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * KenyaLoad One - Auth Controller & Token Generator
 */

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, TokenPayload, UserRole, VerificationStatus } from '../middleware/authMiddleware.ts';
import { dbStore, StoredUser } from '../db/store.ts';

export function generateToken(user: StoredUser): string {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    verificationStatus: user.verificationStatus,
    companyName: user.companyName,
    kraPin: user.kraPin,
    ntsaLicenceNo: user.ntsaLicenceNo,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Quick access demo profiles for testers and evaluators
 */
export async function getDemoTokens(_req: Request, res: Response): Promise<void> {
  const verifiedTransporter = dbStore.users.get('usr-transporter-01')!;
  const verifiedShipper = dbStore.users.get('usr-shipper-01')!;
  const pendingTransporter = dbStore.users.get('usr-transporter-pending')!;

  const unverifiedVisitor: StoredUser = {
    id: 'usr-unverified-09',
    email: 'unverified@freightcorp.ke',
    phoneNumber: '254700000000',
    companyName: 'Unverified Logistics Ltd',
    role: 'TRANSPORTER',
    verificationStatus: 'REJECTED',
    county: 'Nairobi',
    rating: 3.0,
  };

  res.status(200).json({
    success: true,
    tokens: {
      verifiedTransporter: {
        label: 'Verified Transporter (Simba Hauliers Kenya Ltd - Mombasa)',
        user: verifiedTransporter,
        token: generateToken(verifiedTransporter),
        description: 'Has full access to live load board, bids, carrier contact details, and can receive real-time push dispatches.',
      },
      verifiedShipper: {
        label: 'Verified Shipper (Highland Agro Exports Ltd - Nairobi)',
        user: verifiedShipper,
        token: generateToken(verifiedShipper),
        description: 'Can post freight shipments, trigger live corridor broadcasts, lock M-Pesa STK escrow, and view fleets.',
      },
      pendingTransporter: {
        label: 'Pending Transporter (Rift Valley Haulage SACCO - Nakuru)',
        user: pendingTransporter,
        token: generateToken(pendingTransporter),
        description: 'Submitted NTSA documents. Blocked with 401 Unauthorized if attempting to access live load board before review.',
      },
      unverifiedVisitor: {
        label: 'Rejected / Unverified Account',
        user: unverifiedVisitor,
        token: generateToken(unverifiedVisitor),
        description: 'Failed KRA/NTSA verification. Strictly restricted to public county heatmap and market statistics.',
      },
    },
  });
}

/**
 * Standard Login Endpoint
 */
export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  if (!email) {
    res.status(400).json({ success: false, message: 'Email is required' });
    return;
  }

  let foundUser: StoredUser | undefined;
  for (const user of dbStore.users.values()) {
    if (user.email.toLowerCase() === email.toLowerCase()) {
      foundUser = user;
      break;
    }
  }

  // If user doesn't exist, create a demo verified transporter or shipper based on email domain
  if (!foundUser) {
    const isShipper = email.includes('shipper') || email.includes('cargo') || email.includes('agro');
    foundUser = {
      id: `usr-${Date.now()}`,
      email,
      phoneNumber: '2547' + Math.floor(10000000 + Math.random() * 90000000),
      companyName: email.split('@')[0].toUpperCase() + ' Logistics Kenya',
      role: isShipper ? 'SHIPPER' : 'TRANSPORTER',
      verificationStatus: 'VERIFIED',
      kraPin: 'P05' + Math.floor(1000000 + Math.random() * 9000000) + 'K',
      ntsaLicenceNo: 'NTSA/RSL/2026/' + Math.floor(1000 + Math.random() * 9000),
      county: 'Nairobi',
      rating: 5.0,
    };
    dbStore.users.set(foundUser.id, foundUser);
  }

  const token = generateToken(foundUser);

  res.status(200).json({
    success: true,
    message: 'Authentication successful',
    token,
    user: foundUser,
  });
}
