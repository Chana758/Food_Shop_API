// src/components/payment/POSKhqrModal.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { generateDynamicKHQR } from '../../utils/khqr';
import paymentService from '../../service/paymentService';
import BankBadges from './BankBadges';

const EXPIRY_SECONDS = 180;     // 3 នាទី — ស្របនឹង expirationTimestamp ក្នុង khqr.js
const POLL_INTERVAL_MS = 4000;  // 4 វិនាទី/ដង → max ~15 requests/min < throttle 20/min

/**
 * Modal បង្ហាញ KHQR code សម្រាប់ order មួយ
 *
 * @param {object}   props
 * @param {boolean}  props.isOpen       - បើក/បិទ modal
 * @param {Function} props.onClose      - callback ពេលបិទ modal
 * @param {number}   props.orderId      - ID របស់ order ត្រូវបង់
 * @param {number}   props.amount       - ទឹកប្រាក់ត្រូវបង់ (USD)
 * @param {Function} props.onPaid       - callback ពេលបានបញ្ជាក់ថាបង់រួច (data payment)
 */
const POSKhqrModal = ({ isOpen, onClose, orderId, amount, onPaid }) => {
  const [qrData, setQrData]       = useState(null);   // { qr, md5 }
  const [payment, setPayment]     = useState(null);   // Payment record ពី backend
  const [status, setStatus]       = useState('idle');  // idle | generating | waiting | paid | expired | error
  const [secondsLeft, setSecondsLeft] = useState(EXPIRY_SECONDS);
  const [errorMsg, setErrorMsg]   = useState('');

  const pollRef    = useRef(null);
  const countdownRef = useRef(null);

  // ── ជំហានទី១: បង្កើត KHQR + បង្កើត pending payment record ក្នុង backend ──────
  const initPayment = useCallback(async () => {
    setStatus('generating');
    setErrorMsg('');

    const billNumber = `KF-ORD${orderId}-${Date.now()}`;
    const generated = generateDynamicKHQR({ amount, billNumber });

    if (!generated) {
      setStatus('error');
      setErrorMsg('មិនអាចបង្កើត QR code បានទេ។ សូមព្យាយាមម្តងទៀត។');
      return;
    }

    setQrData(generated);

    try {
      // ✅ transaction_ref = md5 ពី QR — Bakong ប្រើ md5 នេះដើម្បី match transaction
      const createdPayment = await paymentService.create({
        order_id: orderId,
        method: 'khqr',
        transaction_ref: generated.md5,
      });

      setPayment(createdPayment);
      setStatus('waiting');
      setSecondsLeft(EXPIRY_SECONDS);
    } catch (err) {
      console.error('Failed to create payment record:', err.response ?? err);
      setStatus('error');
      setErrorMsg(
        err.response?.data?.message || 'មិនអាចបង្កើត payment record បានទេ។'
      );
    }
  }, [orderId, amount]);

  // ── ជំហានទី២: Poll checkStatus រហូតទាល់តែបានបង់ ឬផុតកំណត់ ──────────────────
  const poll = useCallback(async () => {
    if (!payment?.id) return;

    try {
      const res = await paymentService.checkStatus(payment.id);

      if (res.paid) {
        setStatus('paid');
        clearInterval(pollRef.current);
        clearInterval(countdownRef.current);
        onPaid?.(res.data);
      }
      // res.paid === false → នៅតែបន្ត poll ដដែល (មិនចាំបាច់ធ្វើអ្វី)
    } catch (err) {
      // FIX: កុំបញ្ឈប់ poll ព្រោះ error មួយដង (network blip) —
      // log ចោលហើយបន្តព្យាយាមទៀតរហូតដល់ expire
      console.error('checkStatus poll error:', err.response ?? err);
    }
  }, [payment, onPaid]);

  // ── Effect: ចាប់ផ្ដើម init ពេល modal បើក ───────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      initPayment();
    } else {
      // Reset state ពេល modal បិទ
      setQrData(null);
      setPayment(null);
      setStatus('idle');
      setSecondsLeft(EXPIRY_SECONDS);
    }

    return () => {
      clearInterval(pollRef.current);
      clearInterval(countdownRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // ── Effect: ចាប់ផ្ដើម polling + countdown ពេល status = 'waiting' ──────────
  useEffect(() => {
    if (status !== 'waiting') return;

    pollRef.current = setInterval(poll, POLL_INTERVAL_MS);

    countdownRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(pollRef.current);
          clearInterval(countdownRef.current);
          setStatus('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(pollRef.current);
      clearInterval(countdownRef.current);
    };
  }, [status, poll]);

  if (!isOpen) return null;

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl leading-none"
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="text-center text-lg font-bold text-gray-800 mb-1">
          ស្កេន KHQR ដើម្បីបង់ប្រាក់
        </h2>
        <p className="text-center text-2xl font-black text-primary mb-4">
          ${Number(amount).toFixed(2)}
        </p>

        {/* ── Generating ─────────────────────────────────────────────── */}
        {status === 'generating' && (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            <p className="text-sm text-gray-500">កំពុងបង្កើត QR...</p>
          </div>
        )}

        {/* ── Waiting for scan ───────────────────────────────────────── */}
        {status === 'waiting' && qrData && (
          <>
            <div className="flex justify-center p-3 bg-white border border-gray-100 rounded-xl">
              <QRCodeSVG value={qrData.qr} size={220} level="M" />
            </div>

            <p className="text-center text-sm text-gray-500 mt-3">
              QR នេះនឹងផុតកំណត់ក្នុងរយៈពេល{' '}
              <span className="font-bold text-red-500">
                {mm}:{ss}
              </span>
            </p>

            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs text-gray-400">កំពុងរង់ចាំការទូទាត់...</span>
            </div>

            <BankBadges />
          </>
        )}

        {/* ── Paid ────────────────────────────────────────────────────── */}
        {status === 'paid' && (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-3xl">
              ✓
            </div>
            <p className="text-green-600 font-bold text-lg">បង់ប្រាក់ជោគជ័យ!</p>
          </div>
        )}

        {/* ── Expired ─────────────────────────────────────────────────── */}
        {status === 'expired' && (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <p className="text-red-500 font-bold">QR Code ផុតកំណត់ហើយ</p>
            <button
              onClick={initPayment}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold"
            >
              បង្កើត QR ថ្មី
            </button>
          </div>
        )}

        {/* ── Error ───────────────────────────────────────────────────── */}
        {status === 'error' && (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <p className="text-red-500 font-bold text-center">{errorMsg}</p>
            <button
              onClick={initPayment}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold"
            >
              ព្យាយាមម្តងទៀត
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default POSKhqrModal;