import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import {
  LuPlus, LuPencil, LuTrash, LuUsers, LuShieldCheck, LuUserCheck,
  LuSave, LuRefreshCw, LuMail, LuPhone,
} from "react-icons/lu";
import axiosInstance from '../../api/axios';

const ROLE_FILTERS = ['ALL', 'ADMIN', 'STAFF'];

const StaffManagement = () => {
  const { searchTerm = '' } = useOutletContext() || {};

  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('ADD');
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', role: 'staff' });

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/admin/staff');
      const data = response?.data?.data || response?.data || [];
      setStaffList(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to load staff list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const openModal = (mode, staff = null) => {
    setModalMode(mode);
    setFormData(staff ? { ...staff } : { name: '', email: '', phone: '', password: '', role: 'staff' });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let dataToSave = { ...formData };

      if (modalMode === 'EDIT') {
        delete dataToSave.password;
      }

      const url = modalMode === 'EDIT'
        ? `/admin/staff/${formData.id}`
        : '/admin/staff';

      const method = modalMode === 'EDIT' ? 'put' : 'post';

      const response = await axiosInstance[method](url, dataToSave);

      toast.success(response.data.message || "Operation successful!");
      setIsModalOpen(false);
      fetchStaff();
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Something went wrong!";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Are you sure you want to remove this staff member?")) return;
    try {
      await axiosInstance.delete(`/admin/staff/${id}`);
      toast.success("Staff removed successfully");
      fetchStaff();
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Something went wrong!";
      toast.error(errorMessage);
    }
  };

  const adminCount = useMemo(() => staffList.filter(s => s.role === 'admin').length, [staffList]);
  const staffCount = useMemo(() => staffList.filter(s => s.role !== 'admin').length, [staffList]);

  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole =
      roleFilter === 'ALL' ||
      (roleFilter === 'ADMIN' && s.role === 'admin') ||
      (roleFilter === 'STAFF' && s.role !== 'admin');
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-6 md:p-8 min-h-screen space-y-6" style={{ background: 'var(--page-bg)' }}>
      <Toaster position="top-right" />

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900">Staff Management</h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">Manage and organize your restaurant team members</p>
        </div>
        <button
          onClick={() => openModal('ADD')}
          className="bg-slate-900 text-white px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition cursor-pointer shadow-sm whitespace-nowrap flex items-center gap-2"
        >
          <LuPlus size={15} /> Add New Staff
        </button>
      </div>

      {/* ── STATS CARDS (solid color, matches Contact Messages report style) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            title: "TOTAL STAFF",
            label: "All team members",
            val: staffList.length,
            icon: LuUsers,
            card: "bg-slate-900",
            badge: "TOTAL",
            badgeText: "text-slate-300",
          },
          {
            title: "Admins",
            label: "System administrators",
            val: adminCount,
            icon: LuShieldCheck,
            card: "bg-blue-700",
            badge: "ROLE",
            badgeText: "text-blue-100",
          },
          {
            title: "Active staff",
            label: "Regular staff members",
            val: staffCount,
            icon: LuUserCheck,
            card: "bg-emerald-700",
            badge: "ROLE",
            badgeText: "text-emerald-100",
          },
        ].map((item, i) => (
          <div key={i} className={`${item.card} rounded-xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between text-white`}>
            <div className="flex justify-between items-start mb-3">
              <div className="p-2 bg-white/15 rounded-lg">
                <item.icon size={18} />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-wider ${item.badgeText} border border-white/25 rounded-full px-2 py-0.5`}>
                {item.badge}
              </span>
            </div>
            <p className="text-xs font-bold uppercase tracking-wide text-white/70">{item.title}</p>
            <h2 className="text-3xl font-black mt-1">{item.val}</h2>
            <p className="text-xs font-semibold text-white/60 mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      {/* ── FILTER + LIST CONTAINER (matches Contact Messages filter/list style) ── */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Filter:</span>
            {ROLE_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setRoleFilter(f)}
                className={`text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  roleFilter === f
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            onClick={fetchStaff}
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition cursor-pointer"
            title="Refresh"
          >
            <LuRefreshCw size={14} />
          </button>
        </div>

        <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">All Staff</span>
          </div>
          <span className="text-[11px] font-bold bg-white border border-slate-200 text-slate-500 px-2.5 py-1 rounded-full">
            {filteredStaff.length} {filteredStaff.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="text-center py-14 text-xs font-bold text-slate-400 uppercase tracking-widest">Loading...</div>
          ) : filteredStaff.length === 0 ? (
            <div className="text-center py-14 text-slate-400 font-bold text-xs uppercase tracking-wider">
              {searchTerm ? `No staff match "${searchTerm}"` : 'No staff found.'}
            </div>
          ) : (
            filteredStaff.map((staff) => (
              <div key={staff.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 ${
                  staff.role === 'admin' ? 'bg-blue-700' : 'bg-emerald-700'
                }`}>
                  {staff.name?.slice(0, 1)?.toUpperCase() || '?'}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{staff.name}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-0.5">
                    <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <LuMail size={12} /> {staff.email}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <LuPhone size={12} /> {staff.phone || 'N/A'}
                    </span>
                  </div>
                </div>

                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shrink-0 ${
                  staff.role === 'admin'
                    ? 'bg-blue-50 border border-blue-200 text-blue-700'
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                }`}>
                  {staff.role}
                </span>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => openModal('EDIT', staff)}
                    className="p-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg cursor-pointer transition"
                    title="Edit"
                  >
                    <LuPencil size={13} />
                  </button>
                  <button
                    onClick={() => handleRemove(staff.id)}
                    className="p-2 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-lg cursor-pointer transition"
                    title="Remove"
                  >
                    <LuTrash size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── ADD / EDIT MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSave} className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
              <div className="p-2 bg-slate-900 text-white rounded-lg">
                <LuPlus size={16} />
              </div>
              <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                {modalMode === 'ADD' ? 'Add New Staff' : 'Edit Staff'}
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Full Name *</label>
                <input
                  className="w-full p-2.5 rounded-lg border border-slate-200 font-bold focus:outline-slate-900 bg-slate-50"
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Email Address *</label>
                <input
                  type="email"
                  className="w-full p-2.5 rounded-lg border border-slate-200 font-bold focus:outline-slate-900 bg-slate-50"
                  placeholder="e.g. john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Phone Number</label>
                <input
                  className="w-full p-2.5 rounded-lg border border-slate-200 font-bold focus:outline-slate-900 bg-slate-50"
                  placeholder="e.g. 0972324523"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Role *</label>
                <select
                  className="w-full p-2.5 rounded-lg border border-slate-200 font-bold focus:outline-slate-900 bg-slate-50"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {modalMode === 'ADD' && (
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Password *</label>
                  <input
                    type="password"
                    className="w-full p-2.5 rounded-lg border border-slate-200 font-bold focus:outline-slate-900 bg-slate-50"
                    placeholder="••••••••"
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 border border-slate-200 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-slate-100 cursor-pointer text-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 py-2.5 bg-slate-900 text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-slate-800 cursor-pointer transition shadow-sm flex items-center justify-center gap-1.5"
              >
                {isSaving ? "Saving..." : <><LuSave size={13} /> Save</>}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;