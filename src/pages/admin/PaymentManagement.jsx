import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PaymentManagement = () => {
  const [paymentList, setPaymentList] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔄 ទាញយកទិន្នន័យពី Laravel API
  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:8000/api/admin/payments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPaymentList(response.data.data);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // 🎯 មុខងារពេល Staff ចុចប៊ូតុង Confirm Payment
  const handleConfirmPayment = async (orderId) => {
    if (window.confirm("Are you sure you want to confirm this payment?")) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.put(`http://127.0.0.1:8000/api/admin/payments/${orderId}/confirm`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.status === 'success') {
          alert("Payment status updated to PAID!");
          fetchPayments(); // រត់ទាញទិន្នន័យថ្មីមកបន្តិចដើម្បីឱ្យ Update លើអេក្រង់
        }
      } catch (error) {
        console.error("Error confirming payment:", error);
        alert("Failed to confirm payment.");
      }
    }
  };

  return (
    // ដកឃ្លាចម្ងាយពី Sidebar ស្មើគ្នាស្អាតជារួម (ml-72)
    <div className="p-8 bg-[#FDFDFD] min-h-screen">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#1e922c] uppercase tracking-tight">Payment Management</h1>
          <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Track and verify customer invoices</p>
        </div>
        <div className="bg-white border border-gray-100 shadow-sm rounded-sm px-6 py-3 flex flex-col items-end">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Total Transactions</span>
          <span className="text-2xl font-black text-[#1e922c]">{paymentList.length} Invoices</span>
        </div>
      </div>

      {/* 📊 TABLE SECTION */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 text-[11px] font-black uppercase tracking-wider text-gray-500">Order ID</th>
              <th className="p-4 text-[11px] font-black uppercase tracking-wider text-gray-500">Customer</th>
              <th className="p-4 text-[11px] font-black uppercase tracking-wider text-gray-500">Amount</th>
              <th className="p-4 text-[11px] font-black uppercase tracking-wider text-gray-500">Method</th>
              <th className="p-4 text-[11px] font-black uppercase tracking-wider text-gray-500">Status</th>
              <th className="p-4 text-[11px] font-black uppercase tracking-wider text-gray-500 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-sm font-bold text-gray-400">Loading payments data...</td>
              </tr>
            ) : paymentList.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-sm font-bold text-gray-400">No payment transactions found.</td>
              </tr>
            ) : (
              paymentList.map((payment) => (
                <tr key={payment.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 text-sm font-bold text-gray-700">#ORD-{payment.id}</td>
                  <td className="p-4 text-sm font-bold text-[#1a2e35]">{payment.user?.name || 'Walk-in Customer'}</td>
                  <td className="p-4 text-sm font-black text-gray-900">${parseFloat(payment.total_amount).toFixed(2)}</td>
                  <td className="p-4 text-sm text-gray-600 uppercase font-semibold">{payment.payment_method || 'ABA'}</td>
                  <td className="p-4">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                      payment.payment_status === 'Paid' 
                        ? 'bg-green-50 text-green-700 border-green-100' 
                        : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                    }`}>
                      {payment.payment_status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {payment.payment_status !== 'Paid' ? (
                      <button 
                        onClick={() => handleConfirmPayment(payment.id)}
                        className="bg-[#1e922c] hover:bg-[#14631e] text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded transition-colors"
                      >
                        Confirm Paid
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-gray-400">Verified ✓</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentManagement;