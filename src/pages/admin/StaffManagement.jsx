
import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { LuPlus, LuPencil, LuTrash, LuUsers, LuShieldCheck, LuUserCheck, LuSave } from "react-icons/lu";
import axiosInstance from '../../api/axios';

const StaffManagement = () => {
  const { searchTerm = '' } = useOutletContext() || {};

  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const filteredStaff = staffList.filter((s) =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 bg-slate-100 min-h-screen space-y-6">
      <Toaster position="top-right" />

      {/* ── HEADER & ADD BUTTON ── */}
      <div className="bg-white rounded-xl border-2 border-slate-300 p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-sm font-black text-slate-900 uppercase tracking-wide">Staff Management</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Manage and organize your restaurant team members</p>
        </div>
        <button
          onClick={() => openModal('ADD')}
          className="bg-slate-900 text-white px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition cursor-pointer shadow-sm whitespace-nowrap flex items-center gap-2"
        >
          <LuPlus size={15} /> Add New Staff
        </button>
      </div>

      {/* ── STATS CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { 
            title: "TOTAL STAFF", 
            label: "All team members", 
            val: staffList.length, 
            icon: LuUsers, 
            textColor: "text-emerald-700", 
            bg: "bg-emerald-50",
            border: "border-emerald-100" 
          },
          { 
            title: "ADMINS", 
            label: "System administrators", 
            val: staffList.filter(s => s.role === 'admin').length, 
            icon: LuShieldCheck,  
            textColor: "text-blue-700", 
            bg: "bg-blue-50",
            border: "border-blue-100" 
          },
          { 
            title: "ACTIVE STAFF", 
            label: "Regular staff members", 
            val: staffList.filter(s => s.role !== 'admin').length, 
            icon: LuUserCheck, 
            textColor: "text-amber-700", 
            bg: "bg-amber-50",
            border: "border-amber-100" 
          },
        ].map((item, i) => (
          <div key={i} className="bg-white rounded-xl border-2 border-slate-300 p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">{item.title}</p>
                <h2 className="text-3xl font-black text-slate-900 mb-2">{item.val}</h2>
              </div>
              <div className={`${item.bg} p-3 rounded-xl ${item.textColor} border ${item.border} shadow-2xs`}>
                <item.icon size={20} />
              </div>
            </div>
            <p className={`text-xs font-bold ${item.textColor}`}>{item.label}</p>
          </div>
        ))}
      </div>

      {/* ── TABLE CONTAINER ── */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-slate-300 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-slate-600 text-[11px] font-black uppercase tracking-wider border-b-2 border-slate-300">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Phone</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3 text-center w-28">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr><td colSpan="5" className="text-center py-12 text-xs font-bold text-slate-500 uppercase tracking-widest">Loading...</td></tr>
            ) : filteredStaff.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-12 text-slate-500 font-bold text-xs uppercase tracking-wider">
                  {searchTerm ? `No staff match "${searchTerm}"` : 'No staff found.'}
                </td>
              </tr>
            ) : (
              filteredStaff.map((staff) => (
                <tr key={staff.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-xs text-slate-900">{staff.name}</td>
                  <td className="px-5 py-3.5 text-slate-600 text-xs font-medium">{staff.email}</td>
                  <td className="px-5 py-3.5 text-slate-600 text-xs font-medium">{staff.phone || 'N/A'}</td>
                  <td className="px-5 py-3.5">
                    <span className="bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-2xs">
                      {staff.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-center gap-1.5">
                      <button
                        onClick={() => openModal('EDIT', staff)}
                        className="p-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg cursor-pointer transition shadow-2xs"
                        title="Edit"
                      >
                        <LuPencil size={13} />
                      </button>
                      <button
                        onClick={() => handleRemove(staff.id)}
                        className="p-2 bg-white border border-rose-300 hover:bg-rose-50 text-rose-600 rounded-lg cursor-pointer transition shadow-2xs"
                        title="Remove"
                      >
                        <LuTrash size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── ADD / EDIT MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSave} className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl border-2 border-slate-300 space-y-4">
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
                  className="w-full p-2.5 rounded-lg border-2 border-slate-300 font-bold focus:outline-slate-900 bg-slate-50"
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
                  className="w-full p-2.5 rounded-lg border-2 border-slate-300 font-bold focus:outline-slate-900 bg-slate-50"
                  placeholder="e.g. john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Phone Number</label>
                <input
                  className="w-full p-2.5 rounded-lg border-2 border-slate-300 font-bold focus:outline-slate-900 bg-slate-50"
                  placeholder="e.g. 0972324523"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Role *</label>
                <select
                  className="w-full p-2.5 rounded-lg border-2 border-slate-300 font-bold focus:outline-slate-900 bg-slate-50"
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
                    className="w-full p-2.5 rounded-lg border-2 border-slate-300 font-bold focus:outline-slate-900 bg-slate-50"
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
                className="flex-1 py-2.5 border-2 border-slate-300 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-slate-100 cursor-pointer text-slate-700 transition"
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