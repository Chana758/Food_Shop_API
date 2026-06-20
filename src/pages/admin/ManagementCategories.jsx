import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  LuPlus, LuPencil, LuTrash, LuShapes, LuImage, LuFolder, LuSave
} from "react-icons/lu";

import { categoryService } from "../../service/categoryService";

const ManagementCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const itemsPerPage = 6;
  const [formData, setFormData] = useState({ id: null, name: "", slug: "", description: "", image: null });

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      // categoryService.getAll() ត្រឡប់ response.data រួចហើយ ដូច្នេះមិនចាំបាច់ហៅ res.data ទៀតទេ
      const result = await categoryService.getAll();
      const data = result.data?.data || result.data || result || [];
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to load categories");
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await categoryService.delete(id);
      toast.success("Category deleted");
      fetchCategories();
    } catch (error) { toast.error("Failed to delete"); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const data = new FormData();
    data.append("name", formData.name);
    data.append("slug", formData.slug);
    data.append("description", formData.description);
    if (formData.image instanceof File) data.append("image", formData.image);

    try {
      if (isAddMode) {
        await categoryService.create(data);
      } else {
        // Laravel ត្រូវការ _method: PUT នៅពេលផ្ញើ FormData ដើម្បីឱ្យដឹងថាជា update (PUT មិនអាច parse multipart body ដោយផ្ទាល់បានទេ)
        data.append("_method", "PUT");
        await categoryService.update(formData.id, data);
      }
      toast.success("Saved successfully!");
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally { setIsSaving(false); }
  };

  const filteredData = categories.filter(c => c.name?.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 mb-4 not-even: bg-[#1f6f02]/10 rounded-2xl text-[#1f6f02]">
            <LuShapes size={30} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold underline text-[#103b01]">Category Catalog</h1>
            <p className="text-slate-500 mt-1">Manage and organize your restaurant menu items</p>
          </div>
        </div>
        <button onClick={() => { setIsAddMode(true); setFormData({name: '', slug: '', description: '', image: null}); setIsModalOpen(true); }} className="flex items-center gap-2 rounded-lg bg-[#1d6503] px-3 py-2.5 font-semibold text-white shadow-lg hover:bg-[#3D662E]">
          <LuPlus size={20} /> Add New Category
        </button>
      </div>

      {/* STATS */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[ 
          { 
            title: "Total Categories", 
            val: categories.length, 
            icon: LuShapes, 
            color: "text-emerald-600", 
            bg: "bg-emerald-100" 
          },
           {
             title: "With Media", 
             val: categories.filter(c => c.image).length, 
             icon: LuImage, color: "text-blue-600", 
             bg: "bg-blue-100" 
            },
           {
             title: "Filtered", 
             val: filteredData.length, 
             icon: LuFolder, 
             color: "text-orange-600", 
             bg: "bg-orange-100" } 
          ].map((item, i) => (
          <div key={i} className="rounded-xl bg-white p-6 border border-slate-50 shadow-md flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">{item.title}</p>
              <h2 className="text-3xl font-bold">{item.val}</h2>
            </div>
            <div className={`${item.bg} p-4 rounded-2xl ${item.color}`}>
              <item.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-50 overflow-hidden">
        <div className="p-6 ">
          <input 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full pl-4 py-3 bg-slate-50 rounded-lg outline-none border-1 border-transparent transition-all duration-300 hover:bg-slate-100 focus:bg-white focus:border-[#79ec4f] focus:shadow-lg" 
            placeholder="Search by name..." 
          />
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-green-600 underline text-xs uppercase">
            <tr>
              <th className="px-6 py-4">#.N</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Image</th>
              <th className="px-6 py-4">Description</th> {/* បន្ថែម Description Header */}
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-10">Loading...</td>
              </tr>
            ) : (
              currentItems.map((cat, index) => (
                <tr key={cat.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-semibold text-[#ba048d]"># {(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td className="px-6 py-4 font-bold">{cat.name}</td>
                  <td className="px-6 py-4">
                    <img 
                      src={cat.image ? `http://127.0.0.1:8000/storage/${cat.image}` : "https://placehold.co/100x100"} 
                      className="w-20 h-12 object-cover rounded-0" 
                    />
                  </td>
                  {/* បន្ថែម Description Cell */}
                  <td className="px-6 py-4 text-slate-600 text-sm max-w-[200px] truncate">
                    {cat.description || "No description"}
                  </td>
                  <td className="px-6 py-4 flex justify-center gap-2">
                    <button 
                      onClick={() => { setIsAddMode(false); setFormData(cat); setIsModalOpen(true); }} 
                      className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                      <LuPencil size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(cat.id)} 
                      className="p-2 bg-red-50 text-red-600 rounded-xl">
                      <LuTrash size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="p-4 flex justify-center gap-2">
          {[...Array(totalPages)].map((_, i) => <button key={i} onClick={() => setCurrentPage(i + 1)} className={`px-4 py-2 rounded-lg ${currentPage === i+1 ? 'bg-[#2D4A22] text-white' : 'bg-slate-200'}`}>{i + 1}</button>)}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form onSubmit={handleSave} className="bg-white p-8 rounded-3xl w-[400px]">
            <div className="flex items-center gap-3">
              <div className="p-3 mb-4 not-even: bg-[#1f6f02]/10 rounded-2xl text-[#1f6f02]">
                <LuPlus size={25} />
              </div>
              <h2 className="text-xl font-bold mb-4 text-[#195602]">
              {isAddMode ? 'Add' : 'Edit'} Category
              </h2>
            </div>
            <input className="w-full p-3 border rounded-xl mb-3" placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <input className="w-full p-3 border rounded-xl mb-3" placeholder="Slug" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
            <textarea className="w-full p-3 border rounded-xl mb-3" placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            <div className="border border-dashed p-4 rounded-xl mb-4 text-center">
              {!isAddMode && formData.image && 
                <img src={`http://127.0.0.1:8000/storage/${formData.image}`} 
                className="w-20 h-14 object-cover mx-auto mb-2 rounded-0" />}
              <input type="file" onChange={e => setFormData({...formData, image: e.target.files[0]})} />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="w-full p-3 border rounded-xl">Cancel</button>
              <button disabled={isSaving} type="submit" className="w-full p-3 bg-[#2D4A22] text-white rounded-xl flex items-center justify-center gap-2">{isSaving ? "Saving..." : <>
                <LuSave /> Save</>}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManagementCategories;