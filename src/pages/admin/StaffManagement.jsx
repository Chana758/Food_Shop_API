import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StaffManagement = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States for handling Modal and form data
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('ADD'); // Can be 'ADD' or 'EDIT'
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', role: 'staff' });

  // Fetch all staff members from Laravel API
  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:8000/api/admin/staff', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStaffList(response.data.data);
    } catch (error) {
      console.error("Error fetching staff:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Open modal and set mode (Add or Edit)
  const openModal = (mode, staff = null) => {
    setModalMode(mode);
    setFormData(staff ? { ...staff } : { name: '', email: '', phone: '', password: '', role: 'staff' });
    setIsModalOpen(true);
  };

  // Handle Add/Edit logic
  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // 1. បង្កើត Object ថ្មី ដើម្បីសម្អាតទិន្នន័យមុនផ្ញើ
      let dataToSave = { ...formData };

      // 2. សំខាន់៖ បើ Edit គឺដក password ចេញ (ព្រោះ backend update មិនត្រូវការ password)
      if (modalMode === 'EDIT') {
        delete dataToSave.password;
      }

      const url = modalMode === 'EDIT' 
        ? `http://127.0.0.1:8000/api/admin/staff/${formData.id}` 
        : 'http://127.0.0.1:8000/api/admin/staff';
      
      const method = modalMode === 'EDIT' ? 'put' : 'post';

      // 3. ផ្ញើ Request
      const response = await axios[method](url, dataToSave, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      // 4. បង្ហាញដំណឹងជោគជ័យ
      alert(response.data.message || "Operation successful!");
      
      setIsModalOpen(false);
      fetchStaff(); // នេះគឺជាជំហានសំខាន់បំផុតដើម្បីឱ្យទិន្នន័យ Update ថ្មីភ្លាមៗ
    } catch (error) {
      // 5. បង្ហាញ Error ពី Backend ឱ្យច្បាស់ (ដើម្បីងាយស្រួលដឹងថាខុសត្រង់ណា)
      const errorMessage = error.response?.data?.message || "Something went wrong!";
      alert("Error: " + errorMessage);
      console.error("Full Error:", error.response?.data);
    }
  };
  return (
    <div className="p-8 bg-[#FDFDFD] min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#1e922c] uppercase tracking-tight">Staff Management</h1>
          <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Manage your restaurant team members</p>
        </div>
        <button 
          onClick={() => openModal('ADD')}
          className="bg-[#1d6105] hover:bg-[#1e3317] text-white text-xs font-black uppercase tracking-widest px-6 py-4 rounded-sm shadow-md transition-all"
        >
          + Add New Staff
        </button>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm rounded-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 text-[11px] font-black uppercase tracking-wider text-gray-500">Name</th>
              <th className="p-4 text-[11px] font-black uppercase tracking-wider text-gray-500">Email</th>
              <th className="p-4 text-[11px] font-black uppercase tracking-wider text-gray-500">Phone</th>
              <th className="p-4 text-[11px] font-black uppercase tracking-wider text-gray-500">Role</th>
              <th className="p-4 text-[11px] font-black uppercase tracking-wider text-gray-500 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="p-8 text-center text-sm font-bold text-gray-400">Loading...</td></tr>
            ) : staffList.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-sm font-bold text-gray-400">No staff found.</td></tr>
            ) : (
              staffList.map((staff) => (
                <tr key={staff.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 text-sm font-bold text-[#2D4A22]">{staff.name}</td>
                  <td className="p-4 text-sm text-gray-600">{staff.email}</td>
                  <td className="p-4 text-sm text-gray-600">{staff.phone || 'N/A'}</td>
                  <td className="p-4">
                    <span className="bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">{staff.role}</span>
                  </td>
                  <td className="p-4 text-center space-x-4">
                    <button onClick={() => openModal('EDIT', staff)} className="text-xs font-black text-blue-600 uppercase hover:text-blue-800 transition-colors">Edit</button>
                    <button onClick={() => handleRemove(staff.id)} className="text-xs font-black text-red-500 uppercase hover:text-red-700 transition-colors">Remove</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ADD/EDIT Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-sm w-96 shadow-xl space-y-4">
            <h2 className="font-black text-lg text-[#038709] uppercase tracking-widest border-b pb-2">
              {modalMode === 'ADD' ? 'Add New Staff' : 'Edit Staff'}
            </h2>
            <div className="space-y-3">
              <input className="w-full p-2 border text-sm" placeholder="Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              <input className="w-full p-2 border text-sm" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              <input className="w-full p-2 border text-sm" placeholder="Phone" value={formData.phone || ''} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              {modalMode === 'ADD' && (
                <input className="w-full p-2 border text-sm" type="password" placeholder="Password" onChange={(e) => setFormData({...formData, password: e.target.value})} />
              )}
            </div>
            <div className="flex gap-2 pt-4">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2 border text-xs font-black uppercase">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2 bg-[#1d6105] text-white text-xs font-black uppercase">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;