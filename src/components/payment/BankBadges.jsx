// src/components/payment/BankBadges.jsx
import React from 'react';
import { SUPPORTED_BANKS } from '../../config/khqrConfig';

const BankBadges = () => (
  <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
    {SUPPORTED_BANKS.map((bank) => (
      <span
        key={bank.code}
        title={bank.label}
        className="px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100 text-[8px] font-black uppercase tracking-wider text-gray-500"
      >
        {bank.code}
      </span>
    ))}
  </div>
);

export default BankBadges;