import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import {
  LuPlus, LuPencil, LuTrash, LuUsers, LuUserCheck, LuUserX, LuSave, LuEye, LuX,
  LuChevronLeft, LuChevronRight,
} from "react-icons/lu";
import axiosInstance from '../../api/axios';

const PAGE_SIZE = 8;

const CustomersManagement = () => {
  const { searchTerm = '' } = useOutletContext() || {};

  const [customerList, setCustomerList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewData, setViewData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({ id: '', name: '', email: '', phone: '', password: '' });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/admin/customers');
      const data = response?.data?.data || response?.data || [];
      setCustomerList(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  // Reset to page 1 whenever the search term changes
  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const filteredCustomers = customerList.filter((customer) =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedCustomers = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredCustomers.slice(start, start + PAGE_SIZE);
  }, [filteredCustomers, safePage]);

  const openEditModal = (customer) => {
    setFormData({ id: customer.id, name: customer.name, email: customer.email, phone: customer.phone || '' });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await axiosInstance.put(`/admin/customers/${formData.id}`, formData);
      toast.success("Customer updated successfully!");
      setIsEditModalOpen(false);
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating customer");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await axiosInstance.post('/admin/customers', formData);
      toast.success("Customer added successfully!");
      setIsAddModalOpen(false);
      setFormData({ name: '', email: '', phone: '', password: '' });
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding customer");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = async (customer) => {
    const actionName = customer.status === 'blocked' ? 'unblock' : 'block';
    if (window.confirm(`Are you sure you want to ${actionName} this customer?`)) {
      try {
        setCustomerList(prevList => prevList.map(item =>
          item.id === customer.id ? { ...item, status: item.status === 'blocked' ? 'active' : 'blocked' } : item
        ));
        await axiosInstance.put(`/admin/customers/${customer.id}/toggle-status`, {});
        toast.success(`Customer ${actionName}ed successfully`);
      } catch (error) {
        toast.error("Failed to change status");
        fetchCustomers();
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("WARNING: Are you sure you want to delete this customer?")) {
      try {
        await axiosInstance.delete(`/admin/customers/${id}`);
        toast.success("Customer deleted successfully");
        fetchCustomers();
      } catch (error) { 
        toast.error("Delete failed"); 
      }
    }
  };

  const activeCount = customerList.filter(c => c.status !== 'blocked').length;
  const blockedCount = customerList.filter(c => c.status === 'blocked').length;

  return (
    <div className="p-6 md:p-8 min-h-screen space-y-6" style={{ background: 'var(--page-bg)' }}>
      <Toaster position="top-right" />

      {/* ── HEADER & ADD BUTTON ── */}
      <div className="bg-white rounded-xl border-2 border-slate-300 p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-sm font-black text-slate-900 uppercase tracking-wide">Customer Management</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">View and manage registered clients</p>
        </div>
        <button
          onClick={() => {
            setFormData({ name: '', email: '', phone: '', password: '' });
            setIsAddModalOpen(true);
          }}
          className="bg-slate-900 text-white px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition cursor-pointer shadow-sm whitespace-nowrap flex items-center gap-2"
        >
          <LuPlus size={15} /> Add Customer
        </button>
      </div>

      {/* ── STATS CARDS (solid color) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            title: "Total Customers",
            label: "All registered clients",
            val: customerList.length,
            icon: LuUsers,
            card: "bg-slate-900",
            badge: "TOTAL",
            badgeText: "text-slate-300",
          },
          {
            title: "Active",
            label: "Active accounts",
            val: activeCount,
            icon: LuUserCheck,
            card: "bg-emerald-700",
            badge: "STATUS",
            badgeText: "text-emerald-100",
          },
          {
            title: "Blocked",
            label: "Restricted accounts",
            val: blockedCount,
            icon: LuUserX,
            card: "bg-rose-700",
            badge: "STATUS",
            badgeText: "text-rose-100",
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

      {/* ── TABLE CONTAINER ── */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-slate-300 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-slate-600 text-[11px] font-black uppercase tracking-wider border-b-2 border-slate-300">
            <tr>
              <th className="px-5 py-3 w-16">No.</th>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3 w-32">Status</th>
              <th className="px-5 py-3 text-center w-48">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr><td colSpan="5" className="text-center py-12 text-xs font-bold text-slate-500 uppercase tracking-widest">Loading...</td></tr>
            ) : filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-12 text-slate-500 font-bold text-xs uppercase tracking-wider">
                  {searchTerm ? `No customers match "${searchTerm}"` : 'No customers found.'}
                </td>
              </tr>
            ) : (
              paginatedCustomers.map((c, i) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-black text-xs text-slate-400">
                    {String((safePage - 1) * PAGE_SIZE + i + 1).padStart(2, '0')}
                  </td>
                  <td className="px-5 py-3.5 font-bold text-xs text-slate-900">{c.name}</td>
                  <td className="px-5 py-3.5 text-slate-600 text-xs font-medium">{c.email}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-md border uppercase tracking-widest shadow-2xs ${
                      c.status === 'blocked' 
                        ? 'bg-rose-50 text-rose-700 border-rose-200' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {c.status || 'active'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-center gap-1.5">
                      <button
                        onClick={() => setViewData(c)}
                        className="p-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg cursor-pointer transition shadow-2xs"
                        title="View Details"
                      >
                        <LuEye size={13} />
                      </button>
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg cursor-pointer transition shadow-2xs"
                        title="Edit"
                      >
                        <LuPencil size={13} />
                      </button>
                      <button
                        onClick={() => toggleStatus(c)}
                        className={`px-2.5 py-1.5 border rounded-lg text-[10px] font-black uppercase transition cursor-pointer shadow-2xs ${
                          c.status === 'blocked' 
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100' 
                            : 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
                        }`}
                      >
                        {c.status === 'blocked' ? 'Unblock' : 'Block'}
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-2 bg-white border border-rose-300 hover:bg-rose-50 text-rose-600 rounded-lg cursor-pointer transition shadow-2xs"
                        title="Delete"
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

        {/* ── PAGINATION ── */}
        {!loading && filteredCustomers.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t-2 border-slate-200 bg-slate-50">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filteredCustomers.length)} of {filteredCustomers.length}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="p-2 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
              >
                <LuChevronLeft size={14} />
              </button>

              {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === '...' ? (
                    <span key={`dots-${idx}`} className="px-1.5 text-slate-400 text-xs font-bold">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-black transition cursor-pointer ${
                        p === safePage
                          ? 'bg-slate-900 text-white'
                          : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="p-2 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
              >
                <LuChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── VIEW MODAL ── */}
      {viewData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl border-2 border-slate-300 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider">Customer Details</h2>
              <button onClick={() => setViewData(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <LuX size={16} />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400">Full Name</span>
                <p className="font-bold text-slate-900 mt-0.5">{viewData.name}</p>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400">Email Address</span>
                <p className="font-bold text-slate-900 mt-0.5">{viewData.email}</p>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400">Phone Number</span>
                <p className="font-bold text-slate-900 mt-0.5">{viewData.phone || 'N/A'}</p>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400">Account Status</span>
                <p className="font-bold text-slate-900 mt-0.5 uppercase">{viewData.status || 'active'}</p>
              </div>
            </div>
            <button
              onClick={() => setViewData(null)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── ADD MODAL ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAdd} className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl border-2 border-slate-300 space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
              <div className="p-2 bg-slate-900 text-white rounded-lg">
                <LuPlus size={16} />
              </div>
              <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider">Add New Customer</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Full Name *</label>
                <input
                  className="w-full p-2.5 rounded-lg border-2 border-slate-300 font-bold focus:outline-slate-900 bg-slate-50"
                  placeholder="e.g. Sam Channa"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Email *</label>
                <input
                  type="email"
                  className="w-full p-2.5 rounded-lg border-2 border-slate-300 font-bold focus:outline-slate-900 bg-slate-50"
                  placeholder="e.g. customer@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Phone</label>
                <input
                  className="w-full p-2.5 rounded-lg border-2 border-slate-300 font-bold focus:outline-slate-900 bg-slate-50"
                  placeholder="e.g. 0972324523"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Password *</label>
                <input
                  type="password"
                  className="w-full p-2.5 rounded-lg border-2 border-slate-300 font-bold focus:outline-slate-900 bg-slate-50"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 py-2.5 border-2 border-slate-300 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-slate-100 cursor-pointer text-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 py-2.5 bg-slate-900 text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-slate-800 cursor-pointer transition shadow-sm flex items-center justify-center gap-1.5"
              >
                {isSaving ? "Saving..." : <><LuSave size={13} /> Create</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleUpdate} className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl border-2 border-slate-300 space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
              <div className="p-2 bg-slate-900 text-white rounded-lg">
                <LuPencil size={16} />
              </div>
              <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider">Edit Customer</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Full Name *</label>
                <input
                  className="w-full p-2.5 rounded-lg border-2 border-slate-300 font-bold focus:outline-slate-900 bg-slate-50"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Email *</label>
                <input
                  type="email"
                  className="w-full p-2.5 rounded-lg border-2 border-slate-300 font-bold focus:outline-slate-900 bg-slate-50"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Phone</label>
                <input
                  className="w-full p-2.5 rounded-lg border-2 border-slate-300 font-bold focus:outline-slate-900 bg-slate-50"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
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

export default CustomersManagement;