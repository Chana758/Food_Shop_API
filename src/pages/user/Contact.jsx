import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaInstagram, FaTiktok, FaArrowRight } from "react-icons/fa";
import { BiLeaf } from "react-icons/bi";
import { LuLoaderCircle, LuCircleCheckBig, LuCircleAlert } from "react-icons/lu";
import AOS from "aos";
import "aos/dist/aos.css";
import { useContact } from '../../hooks/useContact';

const Contact = () => {
  const { t } = useTranslation();
  const { loading, success, error, sendMessage, reset } = useContact();

  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });

  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
    });
  }, []);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await sendMessage(form);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch {
      // error state already handled by the hook
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FDFDFD] pt-32 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* --- Header Section --- */}
        <div data-aos="fade-down" className="mb-16 border-l-4 border-[#2D4A22] pl-6 relative">
          <h1 className="text-3xl md:text-4xl font-bold text-[#2D4A22] uppercase tracking-tight">
            {t('contact.title')} <span className="text-[#F58220] font-light">/ Contact</span>
          </h1>
          <p className="text-gray-400 font-medium mt-2 text-sm tracking-widest uppercase">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* --- ផ្នែកព័ត៌មានទំនាក់ទំនង --- */}
          <div className="lg:col-span-5 space-y-10">
            
            {/* Phone */}
            <div data-aos="fade-right" className="space-y-1">
              <p className="text-[#F58220] font-bold text-[10px] uppercase tracking-widest">{t('contact.phone')}</p>
              <div className="flex items-center gap-3">
                <FaPhoneAlt className="text-[#2D4A22] text-sm" />
                <p className="text-[#2D4A22] font-semibold text-lg italic">0972325094 / 0973157848</p>
              </div>
            </div>

            {/* Email */}
            <div data-aos="fade-right" data-aos-delay="100" className="space-y-1">
              <p className="text-[#F58220] font-bold text-[10px] uppercase tracking-widest">{t('contact.email')}</p>
              <div className="flex items-center gap-3">
                <FaEnvelope className="text-[#2D4A22] text-sm" />
                <p className="text-[#2D4A22] font-semibold text-lg">support@khmerfresh.com</p>
              </div>
            </div>

            {/* Address */}
            <div data-aos="fade-right" data-aos-delay="200" className="space-y-1">
              <p className="text-[#F58220] font-bold text-[10px] uppercase tracking-widest">{t('contact.address')}</p>
              <div className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-[#2D4A22] text-sm mt-1" />
                <p className="text-[#2D4A22] font-semibold text-lg leading-snug">
                  #123 Phnom Penh, Cambodia
                </p>
              </div>
            </div>

            {/* Social Media */}
            <div data-aos="zoom-in" data-aos-delay="300" className="pt-4 flex gap-6">
              <FaFacebook className="text-[#2D4A22] text-2xl cursor-pointer hover:text-[#F58220] transition-colors" />
              <FaInstagram className="text-[#2D4A22] text-2xl cursor-pointer hover:text-[#F58220] transition-colors" />
              <FaTiktok className="text-[#2D4A22] text-2xl cursor-pointer hover:text-[#F58220] transition-colors" />
            </div>
          </div>

          {/* --- ផ្នែក Contact Form --- */}
          <div className="lg:col-span-7 bg-white p-8 md:p-12 border border-gray-100 shadow-sm rounded-lg">

            {/* Success message */}
            {success && (
              <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-100 text-green-700 rounded-xl px-4 py-3 text-sm font-semibold">
                <LuCircleCheckBig size={18} className="flex-shrink-0" />
                Your message has been sent successfully. We'll get back to you soon!
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm font-semibold">
                <LuCircleAlert size={18} className="flex-shrink-0" />
                {error}
              </div>
            )}

            <form className="space-y-8" onSubmit={handleSubmit}>
              {/* Full Name */}
              <div className="space-y-2 group">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 group-focus-within:text-[#2D4A22] transition-colors">
                  {t('contact.fullName')}
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  className="w-full bg-transparent border-b border-gray-200 py-2 focus:border-[#2D4A22] outline-none transition-all font-medium text-base text-gray-700 placeholder:text-gray-300 placeholder:font-light"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-2 group">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 group-focus-within:text-[#2D4A22] transition-colors">
                  {t('contact.emailAddress')}
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email@example.com"
                  className="w-full bg-transparent border-b border-gray-200 py-2 focus:border-[#2D4A22] outline-none transition-all font-medium text-base text-gray-700 placeholder:text-gray-300 placeholder:font-light"
                />
              </div>

              {/* Phone (optional) */}
              <div className="space-y-2 group">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 group-focus-within:text-[#2D4A22] transition-colors">
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="012 345 678"
                  className="w-full bg-transparent border-b border-gray-200 py-2 focus:border-[#2D4A22] outline-none transition-all font-medium text-base text-gray-700 placeholder:text-gray-300 placeholder:font-light"
                />
              </div>

              {/* Subject (optional) */}
              <div className="space-y-2 group">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 group-focus-within:text-[#2D4A22] transition-colors">
                  Subject (optional)
                </label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="What's this about?"
                  className="w-full bg-transparent border-b border-gray-200 py-2 focus:border-[#2D4A22] outline-none transition-all font-medium text-base text-gray-700 placeholder:text-gray-300 placeholder:font-light"
                />
              </div>

              {/* Message */}
              <div className="space-y-2 group">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 group-focus-within:text-[#2D4A22] transition-colors">
                  {t('contact.yourMessage')}
                </label>
                <textarea
                  name="message"
                  required
                  rows="3"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Write your message..."
                  className="w-full bg-transparent border-b border-gray-200 py-2 focus:border-[#2D4A22] outline-none transition-all font-medium text-base text-gray-700 resize-none placeholder:text-gray-300 placeholder:font-light"
                ></textarea>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-3 px-10 py-3 bg-[#2D4A22] text-white font-bold text-xs uppercase tracking-widest hover:bg-[#F58220] transition-all duration-300 shadow-lg rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <LuLoaderCircle size={14} className="animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      {t('contact.sendMessage')}
                      <FaArrowRight size={12} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* --- Footer Simple --- */}
        <div data-aos="fade-up" className="mt-20 pt-8 border-t border-gray-50 flex justify-between items-center text-[10px] text-gray-300 font-bold uppercase tracking-[0.3em]">
             <span>Khmer-Fresh Organic Store</span>
             <BiLeaf size={20} className="opacity-20"/>
             <span>Established 2018</span>
        </div>

      </div>
    </div>
  );
};

export default Contact;