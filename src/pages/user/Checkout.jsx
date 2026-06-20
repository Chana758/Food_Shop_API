import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaCreditCard, FaMoneyBillWave, FaArrowLeft, 
  FaTimes, FaCamera, FaCheckCircle 
} from 'react-icons/fa';
import { MdOutlineReceiptLong } from 'react-icons/md';
import axios from 'axios';

// Import រូបភាព QR Code ពី Folder Assets
import MyQRCode from '../../assets/image/ac.png'; 

const Checkout = () => {
  const navigate = useNavigate();
  
  // --- States ---
  const [cartItems, setCartItems] = useState([]); 
  const [selectedItems, setSelectedItems] = useState([]); 
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
    paymentMethod: 'cash' 
  });
  
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); 

  // ==================== IMAGE FIX (NEW) ====================
  // មុខងារសម្រាប់ដោះស្រាយ Path រូបភាពពី Laravel Storage
  // - គ្មាន path → placeholder
  // - path ចាប់ http → external URL ប្រើដោយផ្ទាល់
  // - path relative → បន្ថែម Laravel base URL
  // =========================================================
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-food.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://127.0.0.1:8000/storage/${imagePath}`;
  };

  // --- Timer Logic សម្រាប់ Modal បង់លុយ ---
  useEffect(() => {
    let timer;
    if (showPaymentModal && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setShowPaymentModal(false); 
    }
    return () => clearInterval(timer);
  }, [showPaymentModal, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // --- ទាញយកទិន្នន័យពី LocalStorage ពេល Component ចាប់ផ្ដើម ---
  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      navigate('/login');
      return;
    }
    const storedCart = localStorage.getItem('cart');
    const storedSelected = localStorage.getItem('selectedItems');
    if (storedCart) {
      const cart = JSON.parse(storedCart);
      const selected = storedSelected ? JSON.parse(storedSelected) : [];
      const itemsToCheckout = cart.filter(item => selected.includes(`${item.id}-${item.type}`));
      
      if (itemsToCheckout.length === 0) {
        navigate('/cart');
        return;
      }
      setCartItems(itemsToCheckout);
      setSelectedItems(selected);
    } else {
      navigate('/cart');
    }
  }, [navigate]);

  // --- Handlers សម្រាប់ Form ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPaymentScreenshot(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{9,10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (!formData.address.trim()) newErrors.address = 'Delivery address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateSubtotal = () => cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const subtotal = calculateSubtotal();
  const delivery = subtotal > 0 ? 2.00 : 0;
  const total = subtotal + delivery;

  const handlePlaceOrder = () => {
    if (!validateForm()) return;
    if (formData.paymentMethod === 'card') {
      setTimeLeft(180); 
      setShowPaymentModal(true); 
    } else {
      executeOrder(); 
    }
  };

  // --- Logic បញ្ជូនទិន្នន័យ និងលោតទៅទំព័រ Success ---
  const executeOrder = async () => {
    if (formData.paymentMethod === 'card' && !paymentScreenshot) {
      alert("សូមមេត្តា Upload រូបភាពវិក្កយបត្រដែលបានបាញ់លុយរួច!");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderHistoryData = {
        id: Date.now(),
        customerInfo: formData,
        items: cartItems,
        subtotal: subtotal,
        delivery: delivery,
        total: total,
        date: new Date().toISOString(),
        paymentProof: previewUrl
      };

      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      localStorage.setItem('orders', JSON.stringify([...existingOrders, orderHistoryData]));

      const currentFullCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const updatedCart = currentFullCart.filter(
        item => !selectedItems.includes(`${item.id}-${item.type}`)
      );
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      localStorage.removeItem('selectedItems');
      window.dispatchEvent(new Event('cartUpdated'));

      setShowPaymentModal(false);

      navigate('/order-success', { 
        state: { order: orderHistoryData } 
      });

    } catch (error) {
      console.error("Order Error:", error);
      alert("មានបញ្ហាក្នុងការបញ្ជាទិញ។ សូមព្យាយាមម្ដងទៀត!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FDFDFD] pt-20 pb-20 px-6 md:px-14">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-12 border-b border-gray-100 pb-10">
          <button onClick={() => navigate('/cart')} className="flex items-center gap-2 text-[#2D4A22] font-black text-[10px] uppercase tracking-[0.3em] hover:text-[#F58220] transition-colors mb-6 group">
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Cart
          </button>
          <h1 className="text-4xl font-black text-[#2D4A22] uppercase tracking-tighter">
            Final <span className="text-[#F58220]">Checkout</span>
          </h1>
        </div>

        <div className="grid lg:grid-cols-12 gap-16">
          
          {/* LEFT: DELIVERY FORM */}
          <div className="lg:col-span-7 space-y-12">
            <section>
              <h2 className="text-[11px] font-black text-[#2D4A22] uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                <span className="w-8 h-[1px] bg-[#F58220]"></span> 01. Shipping Details
              </h2>
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="md:col-span-2">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Full Name *</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="E.g. John Doe" className={`w-full py-3 bg-transparent border-b-2 outline-none text-sm font-bold text-[#2D4A22] transition-colors ${errors.fullName ? 'border-red-400' : 'border-gray-100 focus:border-[#2D4A22]'}`} />
                  {errors.fullName && <p className="text-red-400 text-[9px] font-bold mt-1 uppercase italic">{errors.fullName}</p>}
                </div>
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Phone Number *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="012345678" className={`w-full py-3 bg-transparent border-b-2 outline-none text-sm font-bold text-[#2D4A22] transition-colors ${errors.phone ? 'border-red-400' : 'border-gray-100 focus:border-[#2D4A22]'}`} />
                  {errors.phone && <p className="text-red-400 text-[9px] font-bold mt-1 uppercase italic">{errors.phone}</p>}
                </div>
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">City *</label>
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="Phnom Penh" className={`w-full py-3 bg-transparent border-b-2 outline-none text-sm font-bold text-[#2D4A22] transition-colors ${errors.city ? 'border-red-400' : 'border-gray-100 focus:border-[#2D4A22]'}`} />
                  {errors.city && <p className="text-red-400 text-[9px] font-bold mt-1 uppercase italic">{errors.city}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Address *</label>
                  <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Street, Building, Room Number" className={`w-full py-3 bg-transparent border-b-2 outline-none text-sm font-bold text-[#2D4A22] transition-colors ${errors.address ? 'border-red-400' : 'border-gray-100 focus:border-[#2D4A22]'}`} />
                  {errors.address && <p className="text-red-400 text-[9px] font-bold mt-1 uppercase italic">{errors.address}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Delivery Notes (Optional)</label>
                  <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows="2" placeholder="Special instructions..." className="w-full py-3 bg-transparent border-b-2 border-gray-100 outline-none text-sm font-bold text-[#2D4A22] focus:border-[#2D4A22] resize-none transition-colors" />
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-[11px] font-black text-[#2D4A22] uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                <span className="w-8 h-[1px] bg-[#F58220]"></span> 02. Payment Method
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className={`cursor-pointer p-6 border-2 flex items-center gap-4 transition-all ${formData.paymentMethod === 'cash' ? 'border-[#2D4A22] bg-gray-50' : 'border-gray-100'}`}>
                  <input type="radio" name="paymentMethod" value="cash" checked={formData.paymentMethod === 'cash'} onChange={handleInputChange} className="hidden" />
                  <FaMoneyBillWave className={formData.paymentMethod === 'cash' ? 'text-[#F58220]' : 'text-gray-300'} size={24} />
                  <div>
                    <p className="text-[10px] font-black text-[#2D4A22] uppercase tracking-widest">Cash on Delivery</p>
                    <p className="text-[8px] text-gray-400 font-bold uppercase mt-1">Pay at your door</p>
                  </div>
                </label>
                <label className={`cursor-pointer p-6 border-2 flex items-center gap-4 transition-all ${formData.paymentMethod === 'card' ? 'border-[#F58220] bg-orange-50/30' : 'border-gray-100'}`}>
                  <input type="radio" name="paymentMethod" value="card" checked={formData.paymentMethod === 'card'} onChange={handleInputChange} className="hidden" />
                  <FaCreditCard className={formData.paymentMethod === 'card' ? 'text-[#F58220]' : 'text-gray-300'} size={24} />
                  <div>
                    <p className="text-[10px] font-black text-[#2D4A22] uppercase tracking-widest">KHQR Payment</p>
                    <p className="text-[8px] text-gray-400 font-bold uppercase mt-1">ABA / ACLEDA / Bakong</p>
                  </div>
                </label> 
              </div>
            </section>
          </div>

          {/* RIGHT: ORDER SUMMARY */}
          <div className="lg:col-span-5">
            <div className="bg-gray-50 p-8 sticky top-32 border border-gray-100 rounded-sm">
              <h2 className="text-xs font-black text-[#2D4A22] uppercase tracking-[0.3em] mb-8 border-b border-gray-200 pb-4 flex items-center gap-2">
                <MdOutlineReceiptLong size={16}/> Order Summary
              </h2>

              <div className="space-y-4 mb-8 max-h-[260px] overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map((item) => (
                  <div key={`${item.id}-${item.type}`} className="flex justify-between items-center group">
                    <div className="flex items-center gap-4">
                      {/* IMAGE FIX: ប្រើ getImageUrl() + onError fallback */}
                      <div className="w-12 h-12 bg-white p-1 border border-gray-100 flex-shrink-0">
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
                        <p className="text-[10px] font-black text-[#2D4A22] uppercase tracking-tighter leading-none">{item.name}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-[#2D4A22]">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6 border-t border-gray-200">
                <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span className="text-[#2D4A22]">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  <span className="flex items-center gap-2 italic text-[#F58220]">Delivery Fee</span>
                  <span className="text-[#2D4A22]">${delivery.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-end pt-6">
                  <span className="text-[10px] font-black text-[#2D4A22] uppercase tracking-[0.2em]">Total Amount</span>
                  <span className="text-3xl font-black text-[#2D4A22]">${total.toFixed(2)}</span>
                </div>
              </div>

              <button 
                onClick={handlePlaceOrder} 
                disabled={isSubmitting}
                className="w-full bg-[#2D4A22] text-white py-4 mt-10 font-black text-[11px] uppercase tracking-[0.4em] hover:bg-[#F58220] transition-all shadow-xl shadow-[#2D4A22]/20 active:scale-95 disabled:bg-gray-400"
              >
                {isSubmitting ? 'Processing...' : 'Place Order Now'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- PAYMENT MODAL (KHQR) --- */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-[#1a2e14]/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-[540px] rounded-[2.5rem] shadow-2xl relative animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
            
            <div className="pt-6 px-8 flex justify-between items-center">
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                <div className="w-1.5 h-1.5 bg-[#F58220] rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black text-[#2D4A22] tracking-widest">{formatTime(timeLeft)}</span>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all">
                <FaTimes size={18} />
              </button>
            </div>

            <div className="p-8 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                
                {/* ផ្នែកខាងឆ្វេង: QR Code */}
                <div className="space-y-4">
                  <div className="bg-white p-5 flex items-center justify-center">
                    <img src={MyQRCode} alt="KHQR" className="w-full h-auto rounded-xl hover:scale-105 transition-transform" />
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-[#2D4A22] uppercase tracking-[0.2em]">Scan with any bank</p>
                    <p className="text-[16px] font-black text-[#F58220] tracking-tight mt-1 uppercase">Total: ${total.toFixed(2)}</p>
                  </div>
                </div>

                {/* ផ្នែកខាងស្តាំ: ព័ត៌មាន & Upload Receipt */}
                <div className="flex flex-col h-full justify-between py-1">
                  <div>
                    <h3 className="text-xl font-black text-[#245c0f] tracking-tighter uppercase leading-tight">SAM CHANNA</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-5">Verified Merchant</p>
                    
                    <label className="group block relative cursor-pointer overflow-hidden rounded-2xl">
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                      <div className={`border-2 border-dashed p-4 transition-all duration-500 flex items-center gap-3 ${
                        paymentScreenshot 
                        ? 'border-[#2D4A22] bg-[#2D4A22]/5' 
                        : 'border-gray-100 bg-gray-50 group-hover:border-[#F58220]'
                      }`}>
                        {previewUrl ? (
                          <>
                            <img src={previewUrl} alt="Preview" className="w-12 h-12 rounded-lg object-cover shadow-md" />
                            <p className="text-[9px] font-black text-[#2D4A22] uppercase">Receipt Attached!</p>
                            <FaCheckCircle className="ml-auto text-[#2D4A22]" size={18} />
                          </>
                        ) : (
                          <>
                            <div className="w-6 h-6 rounded-xl bg-white shadow-sm flex items-center justify-center">
                              <FaCamera className="text-gray-300 group-hover:text-[#F58220]" size={16} />
                            </div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Upload Receipt</p>
                          </>
                        )}
                      </div>
                    </label>
                  </div>

                  <div className="mt-8">
                    <button 
                      onClick={executeOrder}
                      disabled={isSubmitting || !paymentScreenshot}
                      className={`w-full py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.3em] transition-all duration-300 shadow-xl ${
                        paymentScreenshot 
                        ? 'bg-[#2D4A22] text-white shadow-[#2D4A22]/20 hover:bg-[#1a2e14]' 
                        : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      {isSubmitting ? 'Processing...' : 'Confirm My Payment'}
                    </button>
                    <p className="text-center text-[7px] font-bold text-gray-300 uppercase tracking-[0.2em] mt-4">
                      Powered by Next-Gen KHQR Technology
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
