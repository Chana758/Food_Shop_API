import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CustomersManagement = () => {
  // State management for customer data and UI states
  const [customerList, setCustomerList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewData, setViewData] = useState(null);
  
  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Form data: Added password field
  const [formData, setFormData] = useState({ id: '', name: '', email: '', phone: '', password: '' });
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch initial data
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:8000/api/admin/customers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomerList(response.data.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const filteredCustomers = customerList.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openEditModal = (customer) => {
    setFormData({ id: customer.id, name: customer.name, email: customer.email, phone: customer.phone });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://127.0.0.1:8000/api/admin/customers/${formData.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Customer updated successfully!");
      setIsEditModalOpen(false);
      fetchCustomers();
    } catch (error) {
      alert("Error updating customer: " + (error.response?.data?.message || "Server error"));
    }
  };

  const handleAdd = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://127.0.0.1:8000/api/admin/customers', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Customer added successfully!");
      setIsAddModalOpen(false);
      setFormData({ name: '', email: '', phone: '', password: '' }); // Reset form
      fetchCustomers();
    } catch (error) {
      alert("Error adding customer: " + (error.response?.data?.message || "Server error"));
    }
  };

  const toggleStatus = async (customer) => {
    const actionName = customer.status === 'blocked' ? 'unblock' : 'block';
    if (window.confirm(`Are you sure you want to ${actionName} this customer?`)) {
      try {
        const token = localStorage.getItem('token');
        setCustomerList(prevList => prevList.map(item => 
          item.id === customer.id ? { ...item, status: item.status === 'blocked' ? 'active' : 'blocked' } : item
        ));
        await axios.put(`http://127.0.0.1:8000/api/admin/customers/${customer.id}/toggle-status`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) { 
        console.error(error);
        fetchCustomers();
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("WARNING: Are you sure you want to delete this customer?")) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://127.0.0.1:8000/api/admin/customers/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchCustomers();
      } catch (error) { alert("Delete failed"); }
    }
  };

  const activeCount = customerList.filter(c => c.status !== 'blocked').length;
  const blockedCount = customerList.filter(c => c.status === 'blocked').length;

  return (
    <div className="p-8 bg-[#FDFDFD] min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#1e922c] uppercase tracking-tight">Customers Management</h1>
          <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">View and manage registered clients</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#1e922c] text-white px-6 py-3 rounded-sm text-xs font-black uppercase hover:bg-[#16701a] transition"
        >
          + Add Customer
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-100 shadow-sm rounded-sm p-6">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Total</span>
          <p className="text-3xl font-black text-[#1e922c]">{customerList.length}</p>
        </div>
        <div className="bg-white border border-gray-100 shadow-sm rounded-sm p-6">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Active</span>
          <p className="text-3xl font-black text-[#1e922c]">{activeCount}</p>
        </div>
        <div className="bg-white border border-gray-100 shadow-sm rounded-sm p-6">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Blocked</span>
          <p className="text-3xl font-black text-red-500">{blockedCount}</p>
        </div>
      </div>

      <input 
        type="text" 
        placeholder="Search customers..." 
        className="w-full p-3 mb-6 border border-gray-200 rounded-sm text-sm"
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="bg-white border border-gray-100 shadow-sm rounded-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 text-[11px] font-black text-gray-500 uppercase">No.</th>
              <th className="p-4 text-[11px] font-black text-gray-500 uppercase">Name</th>
              <th className="p-4 text-[11px] font-black text-gray-500 uppercase">Email</th>
              <th className="p-4 text-[11px] font-black text-gray-500 uppercase">Status</th>
              <th className="p-4 text-[11px] font-black text-gray-500 uppercase text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="5" className="p-8 text-center text-gray-400">Loading...</td></tr> : 
            filteredCustomers.slice(0, 6).map((c, i) => (
              <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="p-4 text-xs font-mono text-gray-400">0{i+1}</td>
                <td className="p-4 text-sm font-bold text-[#1a2e35]">{c.name}</td>
                <td className="p-4 text-sm text-gray-600">{c.email}</td>
                <td className="p-4"><span className={`text-[10px] font-black px-3 py-1 rounded-full border ${c.status === 'blocked' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{c.status}</span></td>
                <td className="p-4 text-center space-x-2">
                  <button onClick={() => setViewData(c)} className="text-[10px] font-black text-green-700 uppercase">View</button>
                  <button onClick={() => openEditModal(c)} className="text-[10px] font-black text-blue-600 uppercase">Edit</button>
                  <button onClick={() => toggleStatus(c)} className="text-[10px] font-black text-orange-600 uppercase">{c.status === 'blocked' ? 'Unblock' : 'Block'}</button>
                  <button onClick={() => handleDelete(c.id)} className="text-[10px] font-black text-red-600 uppercase">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal: Added Password Input */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-sm w-96 shadow-xl space-y-4">
            <h2 className="font-black text-lg text-[#1e922c] border-b pb-2 uppercase">Add New Customer</h2>
            <input className="w-full p-2 border text-sm" placeholder="Name" onChange={(e) => setFormData({...formData, name: e.target.value})} />
            <input className="w-full p-2 border text-sm" placeholder="Email" onChange={(e) => setFormData({...formData, email: e.target.value})} />
            <input className="w-full p-2 border text-sm" placeholder="Phone" onChange={(e) => setFormData({...formData, phone: e.target.value})} />
            <input type="password" className="w-full p-2 border text-sm" placeholder="Password" onChange={(e) => setFormData({...formData, password: e.target.value})} />
            <div className="flex gap-2 pt-4">
              <button onClick={() => setIsAddModalOpen(false)} className="flex-1 py-2 border text-xs font-black uppercase">Cancel</button>
              <button onClick={handleAdd} className="flex-1 py-2 bg-[#1e922c] text-white text-xs font-black uppercase">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-sm w-96 shadow-xl space-y-4">
            <h2 className="font-black text-lg text-[#2D4A22] border-b pb-2 uppercase">Edit Customer</h2>
            <input className="w-full p-2 border text-sm" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            <input className="w-full p-2 border text-sm" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            <input className="w-full p-2 border text-sm" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
            <div className="flex gap-2 pt-4">
              <button onClick={() => setIsEditModalOpen(false)} className="flex-1 py-2 border text-xs font-black uppercase">Cancel</button>
              <button onClick={handleUpdate} className="flex-1 py-2 bg-[#1d6105] text-white text-xs font-black uppercase">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersManagement;