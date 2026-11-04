/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * In-Memory Authoritative Data Store & Seed for KenyaLoad One
 * Mirrors PostgreSQL / Prisma Models for instant, reliable full-stack execution
 */

export interface StoredUser {
  id: string;
  email: string;
  phoneNumber: string;
  companyName: string;
  role: 'SHIPPER' | 'TRANSPORTER' | 'AGENT' | 'ADMIN';
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  kraPin?: string;
  ntsaLicenceNo?: string;
  county: string;
  mpesaPaybill?: string;
  rating: number;
}

export interface StoredLoad {
  id: string;
  title: string;
  commodity: string;
  originCounty: string;
  originCity: string;
  destinationCounty: string;
  destinationCity: string;
  weightTons: number;
  volumeCbm?: number;
  equipmentType: 'CONTAINER' | 'FLATBED' | 'BOX_BODY' | 'TANKER' | 'REEFER' | 'CANTER';
  budgetKes: number;
  targetPickupDate: string;
  status: 'AVAILABLE' | 'BOOKED' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
  corridor: string;
  shippedById: string;
  shippedByName: string;
  shipperPhone: string;
  createdAt: string;
}

export interface StoredTruck {
  id: string;
  registrationNo: string;
  equipmentType: 'CONTAINER' | 'FLATBED' | 'BOX_BODY' | 'TANKER' | 'REEFER' | 'CANTER';
  maxCapacityTons: number;
  currentLocation: string;
  currentCounty: string;
  status: 'AVAILABLE' | 'ACTIVE' | 'MAINTENANCE';
  transporterId: string;
  transporterName: string;
  transporterPhone: string;
}

export interface StoredBooking {
  id: string;
  loadId: string;
  transporterId: string;
  transporterName: string;
  truckId?: string;
  finalAgreedPrice: number;
  driverName: string;
  driverPhone: string;
  escrowStatus: 'PENDING_STK' | 'HELD' | 'RELEASED' | 'DISPUTED' | 'REFUNDED';
  epodToken?: string;
  epodOtpCode?: string;
  epodOtpExpiresAt?: string;
  epodVerifiedAt?: string;
  epodImageUrl?: string;
  createdAt: string;
}

export interface StoredEscrow {
  id: string;
  bookingId: string;
  amountKes: number;
  shipperPhone: string;
  transporterPaybill: string;
  merchantRequestId: string;
  checkoutRequestId: string;
  mpesaReceiptNumber?: string;
  b2cConversationId?: string;
  status: 'PENDING_STK' | 'HELD' | 'RELEASED' | 'DISPUTED' | 'REFUNDED';
  heldAt?: string;
  releasedAt?: string;
  logs: string[];
}

export interface CountyMarketMetric {
  county: string;
  corridorRole: 'PORT_HUB' | 'TRANSIT_CORRIDOR' | 'COMMERCIAL_CAPITAL' | 'BORDER_POINT' | 'AGRI_EXPORT';
  availableLoads: number;
  availableTrucks: number;
  loadToTruckRatio: number; // e.g. 3.4 loads per truck
  avgRatePerTonKes: number;
  avgTransitHoursToNairobi: number;
  demandIntensity: 'CRITICAL_SHORTAGE' | 'HIGH_DEMAND' | 'BALANCED' | 'SURPLUS_TRUCKS';
}

class KenyaLoadStore {
  users: Map<string, StoredUser> = new Map();
  loads: Map<string, StoredLoad> = new Map();
  trucks: Map<string, StoredTruck> = new Map();
  bookings: Map<string, StoredBooking> = new Map();
  escrows: Map<string, StoredEscrow> = new Map();

  constructor() {
    this.seed();
  }

  private seed() {
    // 1. Seed Users
    const defaultUsers: StoredUser[] = [
      {
        id: 'usr-shipper-01',
        email: 'logistics@highlandagro.co.ke',
        phoneNumber: '254712345678',
        companyName: 'Highland Agro Exports Ltd',
        role: 'SHIPPER',
        verificationStatus: 'VERIFIED',
        kraPin: 'P051982341M',
        ntsaLicenceNo: 'NTSA/CORP/2025/892',
        county: 'Nairobi',
        rating: 4.9,
      },
      {
        id: 'usr-transporter-01',
        email: 'dispatch@simbahauliers.co.ke',
        phoneNumber: '254722998877',
        companyName: 'Simba Hauliers Kenya Ltd',
        role: 'TRANSPORTER',
        verificationStatus: 'VERIFIED',
        kraPin: 'P050882194Z',
        ntsaLicenceNo: 'NTSA/RSL/2026/04192',
        county: 'Mombasa',
        mpesaPaybill: '600120',
        rating: 4.95,
      },
      {
        id: 'usr-transporter-pending',
        email: 'info@riftfreight.co.ke',
        phoneNumber: '254733112233',
        companyName: 'Rift Valley Haulage SACCO',
        role: 'TRANSPORTER',
        verificationStatus: 'PENDING',
        kraPin: 'P051000999K',
        county: 'Nakuru',
        rating: 4.5,
      },
    ];

    defaultUsers.forEach((u) => this.users.set(u.id, u));

    // 2. Seed Live Loads along Northern Corridor
    const defaultLoads: StoredLoad[] = [
      {
        id: 'load-kl-101',
        title: '2 x 40ft TEU Machinery Containers to Malaba Transit Yard',
        commodity: 'Industrial Mining & Agro Machinery',
        originCounty: 'Mombasa',
        originCity: 'Kilindini Port Gate 18 (KPA)',
        destinationCounty: 'Busia',
        destinationCity: 'Malaba One Stop Border Post (OSBP)',
        weightTons: 28.5,
        volumeCbm: 68,
        equipmentType: 'CONTAINER',
        budgetKes: 185000,
        targetPickupDate: '2026-11-05',
        status: 'AVAILABLE',
        corridor: 'Mombasa-Nairobi-Malaba',
        shippedById: 'usr-shipper-01',
        shippedByName: 'Highland Agro Exports Ltd',
        shipperPhone: '254712345678',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'load-kl-102',
        title: '30 Tons Bulk Fertilizer DAP to Eldoret KFA Depot',
        commodity: 'Diammonium Phosphate Fertilizer',
        originCounty: 'Mombasa',
        originCity: 'Mbaraki Wharf Yard',
        destinationCounty: 'Uasin Gishu',
        destinationCity: 'Eldoret Railway Siding Depot',
        weightTons: 30.0,
        volumeCbm: 45,
        equipmentType: 'FLATBED',
        budgetKes: 145000,
        targetPickupDate: '2026-11-06',
        status: 'AVAILABLE',
        corridor: 'Mombasa-Nairobi-Malaba',
        shippedById: 'usr-shipper-01',
        shippedByName: 'Highland Agro Exports Ltd',
        shipperPhone: '254712345678',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'load-kl-103',
        title: '15 Tons Fresh Avocados & French Beans for Cargo Flight',
        commodity: 'Fresh Horticulture & Cut Flowers',
        originCounty: 'Nakuru',
        originCity: 'Naivasha Horticultural Packhouse',
        destinationCounty: 'Nairobi',
        destinationCity: 'JKIA Freight Terminal 2',
        weightTons: 15.0,
        volumeCbm: 38,
        equipmentType: 'REEFER',
        budgetKes: 75000,
        targetPickupDate: '2026-11-05',
        status: 'AVAILABLE',
        corridor: 'Mombasa-Nairobi-Malaba',
        shippedById: 'usr-shipper-01',
        shippedByName: 'Highland Agro Exports Ltd',
        shipperPhone: '254712345678',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'load-kl-104',
        title: '35,000 Litres Automotive Gas Oil (AGO) Bulk Fuel',
        commodity: 'Petroleum / AGO Diesel',
        originCounty: 'Mombasa',
        originCity: 'Kipevu Oil Terminal (KOT 2)',
        destinationCounty: 'Kisumu',
        destinationCity: 'Kisumu KPC Depot (Lake Basin)',
        weightTons: 29.8,
        equipmentType: 'TANKER',
        budgetKes: 195000,
        targetPickupDate: '2026-11-07',
        status: 'AVAILABLE',
        corridor: 'Mombasa-Nairobi-Malaba',
        shippedById: 'usr-shipper-01',
        shippedByName: 'Highland Agro Exports Ltd',
        shipperPhone: '254712345678',
        createdAt: new Date(Date.now() - 14400000).toISOString(),
      },
      {
        id: 'load-kl-105',
        title: '8 Tons FMCG Dry Foods & Beverages',
        commodity: 'Packaged Biscuits, Edible Oil & Pasta',
        originCounty: 'Nairobi',
        originCity: 'Industrial Area Commercial St',
        destinationCounty: 'Nakuru',
        destinationCity: 'Nakuru CBD Wholesale Market',
        weightTons: 8.0,
        volumeCbm: 24,
        equipmentType: 'CANTER',
        budgetKes: 38000,
        targetPickupDate: '2026-11-05',
        status: 'AVAILABLE',
        corridor: 'Mombasa-Nairobi-Malaba',
        shippedById: 'usr-shipper-01',
        shippedByName: 'Highland Agro Exports Ltd',
        shipperPhone: '254712345678',
        createdAt: new Date(Date.now() - 18000000).toISOString(),
      },
    ];

    defaultLoads.forEach((l) => this.loads.set(l.id, l));

    // 3. Seed Trucks
    const defaultTrucks: StoredTruck[] = [
      {
        id: 'trk-01',
        registrationNo: 'KDB 892T / ZE 4102',
        equipmentType: 'CONTAINER',
        maxCapacityTons: 32,
        currentLocation: 'Mombasa Port Gate 10',
        currentCounty: 'Mombasa',
        status: 'AVAILABLE',
        transporterId: 'usr-transporter-01',
        transporterName: 'Simba Hauliers Kenya Ltd',
        transporterPhone: '254722998877',
      },
      {
        id: 'trk-02',
        registrationNo: 'KCY 771P / ZE 8812',
        equipmentType: 'FLATBED',
        maxCapacityTons: 30,
        currentLocation: 'Athi River Weighbridge',
        currentCounty: 'Machakos',
        status: 'AVAILABLE',
        transporterId: 'usr-transporter-01',
        transporterName: 'Simba Hauliers Kenya Ltd',
        transporterPhone: '254722998877',
      },
      {
        id: 'trk-03',
        registrationNo: 'KDD 405F / ZF 1120',
        equipmentType: 'REEFER',
        maxCapacityTons: 18,
        currentLocation: 'Naivasha Dry Port Interchange',
        currentCounty: 'Nakuru',
        status: 'AVAILABLE',
        transporterId: 'usr-transporter-01',
        transporterName: 'Simba Hauliers Kenya Ltd',
        transporterPhone: '254722998877',
      },
    ];

    defaultTrucks.forEach((t) => this.trucks.set(t.id, t));

    // 4. Seed an Active Booking with Escrow for demonstration
    const sampleBookingId = 'bk-kl-701';
    const sampleLoadId = 'load-kl-101';
    this.bookings.set(sampleBookingId, {
      id: sampleBookingId,
      loadId: sampleLoadId,
      transporterId: 'usr-transporter-01',
      transporterName: 'Simba Hauliers Kenya Ltd',
      truckId: 'trk-01',
      finalAgreedPrice: 185000,
      driverName: 'Juma Mwamburi',
      driverPhone: '254711882233',
      escrowStatus: 'HELD',
      epodToken: 'epod-sec-token-malaba-9941',
      epodOtpCode: '849201',
      epodOtpExpiresAt: new Date(Date.now() + 86400000).toISOString(),
      createdAt: new Date().toISOString(),
    });

    this.escrows.set('esc-kl-501', {
      id: 'esc-kl-501',
      bookingId: sampleBookingId,
      amountKes: 185000,
      shipperPhone: '254712345678',
      transporterPaybill: '600120',
      merchantRequestId: 'DAR-REQ-847291-KL',
      checkoutRequestId: 'ws_CO_0411202600412391',
      mpesaReceiptNumber: 'QHD893KJ12',
      status: 'HELD',
      heldAt: new Date().toISOString(),
      logs: [
        'STK Push dispatched to Shipper M-Pesa 254712345678 for KES 185,000.00',
        'Safaricom C2B Callback received: ResultCode 0 [The service request is processed successfully.]',
        'M-Pesa Receipt QHD893KJ12 locked in KenyaLoad Safaricom Escrow Trust Account',
        'Driver Juma Mwamburi (254711882233) assigned. e-POD verification OTP initialized.',
      ],
    });
  }

  // Supply/Demand County Heatmaps (Northern Corridor Focus)
  getCountyHeatmaps(): CountyMarketMetric[] {
    return [
      {
        county: 'Mombasa',
        corridorRole: 'PORT_HUB',
        availableLoads: 142,
        availableTrucks: 41,
        loadToTruckRatio: 3.46,
        avgRatePerTonKes: 6200,
        avgTransitHoursToNairobi: 12,
        demandIntensity: 'CRITICAL_SHORTAGE',
      },
      {
        county: 'Nairobi',
        corridorRole: 'COMMERCIAL_CAPITAL',
        availableLoads: 98,
        availableTrucks: 82,
        loadToTruckRatio: 1.19,
        avgRatePerTonKes: 4800,
        avgTransitHoursToNairobi: 0,
        demandIntensity: 'BALANCED',
      },
      {
        county: 'Machakos',
        corridorRole: 'TRANSIT_CORRIDOR',
        availableLoads: 36,
        availableTrucks: 22,
        loadToTruckRatio: 1.63,
        avgRatePerTonKes: 4400,
        avgTransitHoursToNairobi: 2,
        demandIntensity: 'HIGH_DEMAND',
      },
      {
        county: 'Nakuru',
        corridorRole: 'TRANSIT_CORRIDOR',
        availableLoads: 54,
        availableTrucks: 38,
        loadToTruckRatio: 1.42,
        avgRatePerTonKes: 4100,
        avgTransitHoursToNairobi: 3.5,
        demandIntensity: 'HIGH_DEMAND',
      },
      {
        county: 'Uasin Gishu',
        corridorRole: 'AGRI_EXPORT',
        availableLoads: 64,
        availableTrucks: 29,
        loadToTruckRatio: 2.21,
        avgRatePerTonKes: 5100,
        avgTransitHoursToNairobi: 6,
        demandIntensity: 'CRITICAL_SHORTAGE',
      },
      {
        county: 'Kisumu',
        corridorRole: 'TRANSIT_CORRIDOR',
        availableLoads: 43,
        availableTrucks: 31,
        loadToTruckRatio: 1.38,
        avgRatePerTonKes: 4600,
        avgTransitHoursToNairobi: 6.5,
        demandIntensity: 'BALANCED',
      },
      {
        county: 'Busia',
        corridorRole: 'BORDER_POINT',
        availableLoads: 28,
        availableTrucks: 52,
        loadToTruckRatio: 0.54,
        avgRatePerTonKes: 3400,
        avgTransitHoursToNairobi: 8,
        demandIntensity: 'SURPLUS_TRUCKS',
      },
      {
        county: 'Kilifi',
        corridorRole: 'PORT_HUB',
        availableLoads: 31,
        availableTrucks: 18,
        loadToTruckRatio: 1.72,
        avgRatePerTonKes: 5600,
        avgTransitHoursToNairobi: 14,
        demandIntensity: 'HIGH_DEMAND',
      },
    ];
  }
}

export const dbStore = new KenyaLoadStore();
