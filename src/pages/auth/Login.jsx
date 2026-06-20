import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import { authService } from '../../service/authService';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); 
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      //  បាញ់ API ទៅកាន់ Laravel Backend តាមរយៈ authService
      const data = await authService.login(formData);
      
      if (data.status === 'success') {
        /* ==========================================================================
           ១. រក្សាទុកព័ត៌មានចាំបាច់ទៅក្នុង LocalStorage (Client-side State Management)
           ========================================================================== */
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        localStorage.setItem('token', data.access_token);      // រក្សាទុក Token សម្រាប់បាញ់សុំទិន្នន័យ (Bearer Token)
        localStorage.setItem('user_role', data.user.role);    // រក្សាទុក Role (admin, staff, customer) ដើម្បីឆែកក្នុង AdminRoute
        localStorage.setItem('user_name', data.user.name);    // បន្ថែមថ្មី៖ រក្សាទុកឈ្មោះពិត (ដូចជា Sarina) សម្រាប់បង្ហាញលើ Dashboard Header

        /* ==========================================================================
           ២. ជូនដំណឹងទៅកាន់ Components ផ្សេងៗ (Navbar/Sidebar) ឱ្យដឹងថាមានការ Login
           ========================================================================== */
        window.dispatchEvent(new Event('authChanged'));
        
        /* ==========================================================================
           ៣.  លក្ខខណ្ឌបែងចែកផ្លូវរត់ទៅតាមតួនាទីពិតប្រាកដ (Role-Based Redirection)
           ========================================================================== */
        // បង្ខំឱ្យអក្សរតូចទាំងអស់ដើម្បីការពារការខុសទម្រង់អក្សរ (Case-Insensitive)
        const role = data.user.role.toLowerCase(); 

        if (role === 'admin' || role === 'staff') {
            // 🟢 បើជា Admin ឬ Staff ៖ ឱ្យហោះទៅកាន់ទំព័រ Dashboard ដូចគ្នា
            // ប្រើ window.location.href ដើម្បីឱ្យ Browser Refresh គណនា Layout ថ្មីភ្លាមៗ
            window.location.href = '/admin/dashboard'; 
        } else {
            // 🔵 បើជា Customer ធម្មតា (ដូចជា Vyza) ៖ ឱ្យទៅកាន់ទំព័រមុខ (Homepage)
            navigate('/'); 
            alert('Login Successful!');
        }
      }
    } catch (err) {
      // បង្ហាញសារ Error ឱ្យចំបញ្ហាដែលបោះមកពី Laravel
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FDFDFD] flex items-center justify-center py-20 px-6">
      <div className="max-w-md w-full">
        
        {/* --- ប៊ូតុងត្រឡប់ទៅទំព័រដើម --- */}
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-[#2D4A22] font-black text-[10px] uppercase tracking-[0.3em] hover:text-[#F58220] transition-colors mb-12 group"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Home
        </button>

        {/* --- ចំណងជើងទំព័រ --- */}
        <div className="mb-12">
          <h1 className="text-5xl font-black text-[#2D4A22] uppercase tracking-tighter mb-4">
            Sign <span className="text-[#F58220]">In</span>
          </h1>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.3em]">
            Enter your credentials to access your account
          </p>
        </div>

        {/* --- ផ្ទាំង Form បញ្ចូលទិន្នន័យ --- */}
        <div className="bg-white border border-gray-100 p-8 md:p-10 shadow-sm rounded-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* ផ្ទាំងបង្ហាញសារ Error ពេល Login ខុស */}
            {error && (
              <div className="bg-red-50 p-4 border-l-4 border-red-500 text-red-700 text-[10px] font-black uppercase tracking-widest">
                {error}
              </div>
            )}

            {/* ប្រឡោះបញ្ចូល Email */}
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-[#2D4A22] uppercase tracking-[0.2em]">Email Address</label>
              <div className="relative group">
                <FaEnvelope className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#F58220] transition-colors" size={14} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b-2 border-gray-100 py-3 pl-8 text-sm font-bold text-[#2D4A22] outline-none focus:border-[#2D4A22] transition-all placeholder:text-gray-200"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            {/* ប្រឡោះបញ្ចូល Password */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-black text-[#2D4A22] uppercase tracking-[0.2em]">Password</label>
                <a href="#" className="text-[9px] font-black text-gray-400 hover:text-[#2D4A22] uppercase tracking-widest transition-colors">Forgot?</a>
              </div>
              <div className="relative group">
                <FaLock className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#F58220] transition-colors" size={14} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b-2 border-gray-100 py-3 pl-8 pr-10 text-sm font-bold text-[#2D4A22] outline-none focus:border-[#2D4A22] transition-all placeholder:text-gray-200"
                  placeholder="••••••••"
                  required
                />
                {/* ប៊ូតុង បើក/បិទ មើលលេខសម្ងាត់ */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#2D4A22]"
                >
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>

            {/* ប៊ូតុងចុច Submit ផ្ញើទិន្នន័យ */}
            <button
              type="submit"
              disabled={loading} 
              className={`w-full py-5 text-[11px] font-black uppercase tracking-[0.4em] transition-all shadow-xl active:scale-[0.98] 
              ${loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-[#2D4A22] hover:bg-[#1e3317] text-white shadow-[#2D4A22]/10'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </span>
              ) : (
                'Sign In Now'
              )}
            </button>
          </form>

          {/* លីងសម្រាប់រត់ទៅទំព័រចុះឈ្មោះ (Register) */}
          <div className="mt-10 pt-8 border-t border-gray-50 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#F58220] hover:text-[#2D4A22] font-black ml-2 transition-colors underline underline-offset-4">
                Register Free
              </Link>
            </p>
          </div>
        </div>

        {/* ប្រអប់បង្ហាញគណនីគំរូ (Demo Credentials) */}
        <div className="mt-8 flex items-center justify-center gap-4 py-4 px-6 bg-gray-50 border border-gray-100">
           <div className="w-2 h-2 rounded-full bg-[#F58220] animate-pulse"></div>
           <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
             Demo: admin@foodshop.com / password123
           </p>
        </div>
      </div>
    </div>
  );
};

export default Login;