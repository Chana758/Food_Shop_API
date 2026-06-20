import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCheckCircle, FaMapMarkerAlt, FaPhone, FaUser, FaRegCreditCard, FaMoneyBillWave, FaHome, FaHistory } from 'react-icons/fa';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderData, setOrderData] = useState(null);

  // Improved Image URL handler
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-food.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://127.0.0.1:8000/storage/${imagePath}`;
  };

  useEffect(() => {
    if (location.state?.order) {
      setOrderData(location.state.order);
    } else {
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      if (orders.length > 0) {
        setOrderData(orders[orders.length - 1]);
      } else {
        navigate('/');
      }
    }
  }, [location, navigate]);

  if (!orderData) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="w-full min-h-screen bg-[#FDFDFD] pt-24 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-[#4A5D23] rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <FaCheckCircle className="text-white text-3xl" />
            </div>
          </div>
          <h1 className="text-4xl font-black text-[#4A5D23] tracking-tight uppercase mb-2">Success!</h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
            Your order has been received and is being prepared
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          
          <div className="bg-white border border-gray-100 p-8 rounded-sm shadow-sm">
            <h2 className="text-[11px] font-black text-[#4A5D23] uppercase tracking-[0.2em] mb-8 border-b border-gray-50 pb-4">Receipt Details</h2>
            
            <div className="space-y-0 mb-8">
              {orderData.items?.map((item, index) => (
                <div key={index} className="flex justify-between items-start border-b border-gray-50 pb-6 last:border-0">
                  <div className="flex gap-4">
                    <div className="w-15 h-15 bg-gray-50 border border-gray-100 overflow-hidden rounded-0 shadow-sm">
                      <img
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder-food.jpg';
                          }}
                        />                     
                    </div>
                    <div>
                      <h3 className="text-[11px] font-black text-[#4A5D23] uppercase leading-tight">{item.name}</h3>
                      <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">
                        {item.quantity} Unit x ${Number(item.price).toFixed(2)}
                      </p>
                      <p className="text-[10px] font-black text-[#F58220] mt-3 bg-orange-50 inline-block px-2 py-0.5 rounded">
                        Item Total: ${(item.quantity * item.price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <span className="text-[12px] font-black text-[#4A5D23]">${Number(item.price).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 p-6 space-y-3">
              <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <span>Subtotal</span>
                <span className="text-[#4A5D23]">${Number(orderData.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <span>Delivery Service</span>
                <span className="text-[#4A5D23]">${Number(orderData.delivery).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <span className="text-[11px] font-black text-[#4A5D23] uppercase tracking-widest">Total Amount</span>
                <span className="text-3xl font-black text-[#F58220] tracking-tighter">
                  ${Number(orderData.total).toFixed(2)}
                </span>
              </div>
            </div>

            {orderData.paymentProof && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Payment Confirmation</p>
                <img 
                  src={getImageUrl(orderData.paymentProof)} 
                  alt="Receipt" 
                  className="w-32 h-auto rounded-lg border border-gray-100 shadow-sm"
                  onError={(e) => { e.target.style.display = 'none'; }} 
                />
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-[#4A5D23] p-8 rounded-sm text-white relative overflow-hidden shadow-xl">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#F58220] mb-2">Estimated Arrival</p>
              <h2 className="text-5xl font-black tracking-tighter mb-6">30-45 MIN</h2>
              <div className="space-y-1 relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest">Order ID: #{orderData.id}</p>
                <p className="text-[9px] font-medium text-gray-300 uppercase tracking-widest">
                  {formatDate(orderData.date)}
                </p>
              </div>
            </div>

            <div className="bg-white border border-gray-100 p-8 rounded-sm shadow-sm">
              <h2 className="text-[11px] font-black text-[#4A5D23] uppercase tracking-[0.2em] mb-8">Delivery To</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <FaUser className="text-[#F58220] mt-1" size={12} />
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Full Name</p>
                    <p className="text-[11px] font-black text-[#4A5D23] uppercase">{orderData.customerInfo?.fullName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <FaPhone className="text-[#F58220] mt-1" size={12} />
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Contact</p>
                    <p className="text-[11px] font-black text-[#4A5D23] uppercase">{orderData.customerInfo?.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <FaMapMarkerAlt className="text-[#F58220] mt-1" size={12} />
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Location</p>
                    <p className="text-[11px] font-black text-[#4A5D23] uppercase leading-relaxed">
                      {orderData.customerInfo?.address}, {orderData.customerInfo?.city}
                    </p>
                  </div>
                </div>
                <div className="pt-6 border-t border-gray-50 flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-50 flex items-center justify-center rounded-full text-[#4A5D23] border border-gray-100">
                    {orderData.customerInfo?.paymentMethod === 'cash' ? <FaMoneyBillWave size={16} /> : <FaRegCreditCard size={16} />}
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Method</p>
                    <p className="text-[11px] font-black text-[#4A5D23] uppercase">
                      {orderData.customerInfo?.paymentMethod === 'cash' ? 'Cash on Delivery' : 'Digital Payment'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => navigate('/')} className="px-10 py-4 bg-[#4A5D23] text-white font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#3a4a1c] transition-all shadow-lg shadow-[#4A5D23]/20">
            <FaHome size={14} /> Back to Home
          </button>
          <button onClick={() => navigate('/order-history')} className="px-10 py-4 border border-[#4A5D23] text-[#4A5D23] font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-gray-50 transition-all">
            <FaHistory size={14} /> View History
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;