/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  CreditCard, 
  Smartphone, 
  CheckCircle2, 
  ShieldCheck, 
  FileText, 
  KeyRound, 
  ArrowRight, 
  X, 
  AlertCircle,
  Truck,
  Building2,
  RefreshCw
} from 'lucide-react';
import { initiateEscrow, releaseEscrow } from '../services/api.ts';
import { Load } from '../types.ts';

interface MpesaEscrowModalProps {
  load: Load | null;
  isOpen: boolean;
  onClose: () => void;
  onEscrowSuccess?: () => void;
}

export const MpesaEscrowModal: React.FC<MpesaEscrowModalProps> = ({
  load,
  isOpen,
  onClose,
  onEscrowSuccess,
}) => {
  const [step, setStep] = useState<'INITIATE' | 'STK_SIMULATION' | 'HELD' | 'EPOD_VERIFY' | 'DISBURSED'>('INITIATE');
  const [shipperPhone, setShipperPhone] = useState('254712345678');
  const [pinInput, setPinInput] = useState('');
  const [driverOtp, setDriverOtp] = useState('');
  const [generatedDriverOtp, setGeneratedDriverOtp] = useState('849201');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [escrowResult, setEscrowResult] = useState<any>(null);
  const [disbursementResult, setDisbursementResult] = useState<any>(null);

  if (!isOpen || !load) return null;

  const handleSendStkPush = () => {
    setError(null);
    setLoading(true);
    // Simulate phone receiving Daraja STK Push prompt
    setTimeout(() => {
      setLoading(false);
      setStep('STK_SIMULATION');
    }, 800);
  };

  const handleConfirmPin = async () => {
    setLoading(true);
    setError(null);

    const res = await initiateEscrow({
      bookingId: 'bk-kl-701', // uses active demo booking
      shipperPhone,
      amountKes: load.budgetKes,
    });

    setLoading(false);
    if (!res.success) {
      setError(res.message || 'Escrow initiation failed');
      return;
    }

    setEscrowResult(res.rawJson?.escrow || res.data);
    if (res.rawJson?.escrow?.driverOtpForTesting) {
      setGeneratedDriverOtp(res.rawJson.escrow.driverOtpForTesting);
    }
    setStep('HELD');
  };

  const handleVerifyOtpAndRelease = async () => {
    if (!driverOtp.trim()) {
      setError('Please enter the 6-digit driver OTP code');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await releaseEscrow({
      bookingId: 'bk-kl-701',
      otpCode: driverOtp.trim(),
      remarks: 'Signed consignment note verified at destination gate',
    });

    setLoading(false);
    if (!res.success) {
      setError(res.message || 'e-POD OTP verification failed');
      return;
    }

    setDisbursementResult(res.rawJson?.disbursement || res.data);
    setStep('DISBURSED');
    if (onEscrowSuccess) onEscrowSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">Safaricom M-Pesa Escrow Terminal</h3>
              <p className="text-xs text-slate-400 font-mono">Consignment: {load.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {/* Freight Summary Card */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Consignment:</span>
              <span className="font-bold text-white truncate max-w-[260px]">{load.title}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Transit Corridor:</span>
              <span className="text-slate-300 font-mono">{load.originCity} ➔ {load.destinationCity}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-800/80">
              <span className="text-slate-400 font-semibold">Agreed Escrow Freight Fee:</span>
              <span className="text-base font-black text-emerald-400 font-mono">
                KES {load.budgetKes.toLocaleString('en-KE')}
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: INITIATE STK PUSH */}
          {step === 'INITIATE' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Shipper Safaricom M-Pesa Number:
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={shipperPhone}
                    onChange={(e) => setShipperPhone(e.target.value)}
                    placeholder="2547XXXXXXXX or 07XXXXXXXX"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  M-Pesa STK Push will be sent to this phone. Funds are locked in KenyaLoad Safaricom Trust Escrow until verified cargo handover.
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Zero-Risk Escrow Guarantee
                </div>
                <p>
                  Transporter cannot claim payout until driver delivers cargo and the receiver enters the 6-digit OTP code on the e-POD.
                </p>
              </div>

              <button
                onClick={handleSendStkPush}
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-extrabold py-3 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                Trigger Safaricom M-Pesa STK Push
              </button>
            </div>
          )}

          {/* STEP 2: SIMULATED HANDSET STK PROMPT */}
          {step === 'STK_SIMULATION' && (
            <div className="space-y-4">
              <div className="bg-emerald-950/40 border-2 border-emerald-500 rounded-2xl p-5 text-center space-y-3 shadow-xl">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto shadow-md">
                  <Smartphone className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">Safaricom Daraja STK Push Received</h4>
                  <p className="text-xs text-slate-300 font-mono mt-1">
                    Pay KenyaLoad Escrow KES {load.budgetKes.toLocaleString('en-KE')} for Consignment {load.id}?
                  </p>
                </div>

                <div className="max-w-xs mx-auto">
                  <input
                    type="password"
                    maxLength={4}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="Enter M-Pesa PIN (e.g. 1234)"
                    className="w-full text-center bg-slate-900 border border-emerald-500/60 rounded-xl py-2 text-lg tracking-widest text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              </div>

              <button
                onClick={handleConfirmPin}
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg transition"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Confirm PIN & Lock Escrow
              </button>
            </div>
          )}

          {/* STEP 3: ESCROW HELD & IN-TRANSIT */}
          {step === 'HELD' && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-emerald-500/40 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  M-Pesa Funds Safely Locked in Escrow
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono pt-2">
                  <div>
                    <span className="text-slate-500 block text-[10px]">M-PESA RECEIPT:</span>
                    <span className="font-bold text-white">{escrowResult?.mpesaReceiptNumber || 'QHD893KJ12'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">ESCROW STATUS:</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">HELD</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">CARRIER DISBURSEMENT PAYBILL:</span>
                    <span className="text-slate-300">600120 (Simba Hauliers)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">DRIVER OTP CODE:</span>
                    <span className="font-bold text-amber-400 tracking-wider text-sm bg-amber-500/10 px-1 rounded">
                      {generatedDriverOtp}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
                <p className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-sky-400" />
                  Truck is En Route along Northern Corridor
                </p>
                <p>
                  When the driver reaches the destination yard, they provide the 6-digit OTP code to the receiver
                  upon signed physical/digital delivery inspection.
                </p>
              </div>

              <button
                onClick={() => setStep('EPOD_VERIFY')}
                className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold py-3 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg transition"
              >
                <span>Proceed to Destination e-POD Handover</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 4: e-POD OTP VERIFICATION */}
          {step === 'EPOD_VERIFY' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Enter Driver 6-Digit Delivery OTP Code:
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    maxLength={6}
                    value={driverOtp}
                    onChange={(e) => setDriverOtp(e.target.value)}
                    placeholder={`e.g. ${generatedDriverOtp}`}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-base text-white font-mono tracking-widest focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
                  <span>Code sent to driver mobile (+254711882233)</span>
                  <button
                    type="button"
                    onClick={() => setDriverOtp(generatedDriverOtp)}
                    className="text-emerald-400 hover:underline"
                  >
                    Auto-fill: {generatedDriverOtp}
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-2">
                <div className="flex items-center gap-2 text-slate-300 font-semibold">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  Electronic Proof of Delivery (e-POD)
                </div>
                <div className="h-20 bg-slate-900 rounded-lg border border-dashed border-slate-700 flex items-center justify-center text-slate-500 text-[11px] gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Stamped Consignment Note Attached (Gate Pass Verified)
                </div>
              </div>

              <button
                onClick={handleVerifyOtpAndRelease}
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black py-3 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                Verify OTP & Trigger Safaricom B2C Payout
              </button>
            </div>
          )}

          {/* STEP 5: ESCROW DISBURSED */}
          {step === 'DISBURSED' && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-black text-white">Escrow Released & Disbursed!</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Safaricom Daraja B2C payment executed instantly to Transporter Paybill 600120.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-left text-xs font-mono text-slate-300 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount Disbursed:</span>
                  <span className="font-bold text-emerald-400">
                    KES {load.budgetKes.toLocaleString('en-KE')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">B2C Reference:</span>
                  <span className="text-white">{disbursementResult?.safaricomPayoutReceipt || 'QHD893KJ12'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Conversation ID:</span>
                  <span className="text-slate-400 truncate max-w-[200px]">
                    {disbursementResult?.b2cConversationId || 'AG_04112026_B2C'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Consignment Status:</span>
                  <span className="text-emerald-400 font-bold">COMPLETED</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-xs transition"
              >
                Close Escrow Terminal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
