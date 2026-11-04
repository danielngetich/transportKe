/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'SHIPPER' | 'TRANSPORTER' | 'AGENT' | 'ADMIN';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type EquipmentType = 'CONTAINER' | 'FLATBED' | 'BOX_BODY' | 'TANKER' | 'REEFER' | 'CANTER';
export type LoadStatus = 'AVAILABLE' | 'BOOKED' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
export type EscrowStatus = 'PENDING_STK' | 'HELD' | 'RELEASED' | 'DISPUTED' | 'REFUNDED';

export interface User {
  id: string;
  email: string;
  phoneNumber: string;
  companyName: string;
  role: UserRole;
  verificationStatus: VerificationStatus;
  kraPin?: string;
  ntsaLicenceNo?: string;
  county: string;
  mpesaPaybill?: string;
  rating: number;
}

export interface Load {
  id: string;
  title: string;
  commodity: string;
  originCounty: string;
  originCity: string;
  destinationCounty: string;
  destinationCity: string;
  weightTons: number;
  volumeCbm?: number;
  equipmentType: EquipmentType;
  budgetKes: number;
  targetPickupDate: string;
  status: LoadStatus;
  corridor: string;
  shippedById: string;
  shippedByName: string;
  shipperPhone: string;
  createdAt: string;
  notification?: string;
}

export interface Truck {
  id: string;
  registrationNo: string;
  equipmentType: EquipmentType;
  maxCapacityTons: number;
  currentLocation: string;
  currentCounty: string;
  status: 'AVAILABLE' | 'ACTIVE' | 'MAINTENANCE';
  transporterId: string;
  transporterName: string;
  transporterPhone: string;
}

export interface Booking {
  id: string;
  loadId: string;
  transporterId: string;
  transporterName: string;
  truckId?: string;
  finalAgreedPrice: number;
  driverName: string;
  driverPhone: string;
  escrowStatus: EscrowStatus;
  epodToken?: string;
  epodOtpCode?: string;
  epodOtpExpiresAt?: string;
  epodVerifiedAt?: string;
  epodImageUrl?: string;
  createdAt: string;
}

export interface EscrowDetails {
  id: string;
  bookingId: string;
  amountKes: number;
  shipperPhone: string;
  transporterPaybill: string;
  merchantRequestId: string;
  checkoutRequestId: string;
  mpesaReceiptNumber?: string;
  b2cConversationId?: string;
  status: EscrowStatus;
  heldAt?: string;
  releasedAt?: string;
  driverName?: string;
  driverPhone?: string;
  epodOtpCode?: string;
  logs: string[];
}

export interface CountyMarketMetric {
  county: string;
  corridorRole: 'PORT_HUB' | 'TRANSIT_CORRIDOR' | 'COMMERCIAL_CAPITAL' | 'BORDER_POINT' | 'AGRI_EXPORT';
  availableLoads: number;
  availableTrucks: number;
  loadToTruckRatio: number;
  avgRatePerTonKes: number;
  avgTransitHoursToNairobi: number;
  demandIntensity: 'CRITICAL_SHORTAGE' | 'HIGH_DEMAND' | 'BALANCED' | 'SURPLUS_TRUCKS';
}

export interface MarketSummary {
  corridor: string;
  nationalMetrics: {
    totalLoadsPostedToday: number;
    activeLiveLoads: number;
    activeRegisteredTrucks: number;
    averageRatePerTonKmKes: number;
    mombasaPortOutboundSurge: string;
    nairobiTransshipmentRatio: string;
    malabaBorderBackhaulRateKes: string;
    averageEscrowLockTimeSec: number;
    currency: string;
  };
  keyCorridorCheckpoints: Array<{
    name: string;
    status: string;
    delayMins?: number;
    clearanceHrs?: number;
  }>;
  timestamp: string;
}
