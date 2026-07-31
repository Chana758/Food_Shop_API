// src/pages/admin/ManagementCategories.jsx
import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
  LuPlus, LuPencil, LuTrash, LuShapes, LuImage, LuFolder, LuSave
} from "react-icons/lu";
import { categoryService } from "../../service/categoryService";

const ManagementCategories = () => {
  const { searchTerm = "" } = useOutletContext() || {};

  const [categories, setCategories]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddMode, setIsAddMode]     = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSaving, setIsSaving]       = useState(false);
  const [formData, setFormData]       = useState({ id: null, name: "", slug: "", description: "", image: null });

  const ITEMS_PER_PAGE = 6;

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const result = await categoryService.getAll({ per_page: 100 });
      const data   = result?.data?.data || result?.data || result || [];
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await categoryService.delete(id);
      toast.success("Category deleted");
      fetchCategories();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const data = new FormData();
    data.append("name",        formData.name);
    data.append("slug",        formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'));
    data.append("description", formData.description);
    if (formData.image instanceof File) data.append("image", formData.image);

    try {
      if (isAddMode) {
        await categoryService.create(data);
      } else {
        data.append("_method", "PUT");
        await categoryService.update(formData.id, data);
      }
      toast.success("Saved successfully!");
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredData  = categories.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages    = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const currentItems  = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="p-6 md:p-8 bg-slate-100 min-h-screen space-y-6">
      <Toaster position="top-right" />

      {/* ── HEADER & ADD BUTTON ── */}
      <div className="bg-white rounded-xl border-2 border-slate-300 p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-sm font-black text-slate-900 uppercase tracking-wide">Category Management</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Manage and organize your restaurant menu categories</p>
        </div>
        <button
          onClick={() => {
            setIsAddMode(true);
            setFormData({ id: null, name: "", slug: "", description: "", image: null });
            setIsModalOpen(true);
          }}
          className="bg-slate-900 text-white px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition cursor-pointer shadow-sm whitespace-nowrap flex items-center gap-2"
        >
          <LuPlus size={15} /> Add New Category
        </button>
      </div>

      {/* ── STATS CARDS (Updated matching Model 1) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { 
            title: "TOTAL CATEGORIES", 
            label: "All categories", 
            val: categories.length, 
            icon: LuShapes, 
            textColor: "text-emerald-700", 
            bg: "bg-emerald-50",
            border: "border-emerald-100" 
          },
          { 
            title: "WITH MEDIA", 
            label: "Contains image", 
            val: categories.filter(c=>c.image).length, 
            icon: LuImage,  
            textColor: "text-blue-700", 
            bg: "bg-blue-50",
            border: "border-blue-100" 
          },
          { 
            title: "FILTERED", 
            label: "Search results", 
            val: filteredData.length, 
            icon: LuFolder, 
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
              <th className="px-5 py-3 w-16">#</th>
              <th className="px-5 py-3 w-48">Name</th>
              <th className="px-5 py-3 w-32">Image</th>
              <th className="px-5 py-3">Description</th>
              <th className="px-5 py-3 text-center w-28">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr><td colSpan="5" className="text-center py-12 text-xs font-bold text-slate-500 uppercase tracking-widest">Loading...</td></tr>
            ) : currentItems.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-12 text-slate-500 font-bold text-xs uppercase tracking-wider">
                  No categories found {searchTerm && `for "${searchTerm}"`}
                </td>
              </tr>
            ) : (
              currentItems.map((cat, index) => (
                <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-black text-xs text-slate-400">
                    #{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                  </td>
                  <td className="px-5 py-3.5 font-bold text-xs text-slate-900">{cat.name}</td>
                  <td className="px-5 py-3.5">
                    <img
                      src={cat.image ? `http://127.0.0.1:8000/storage/${cat.image}` : "https://placehold.co/100x100"}
                      className="w-16 h-10 object-cover rounded-md border border-slate-200 bg-slate-100 shadow-2xs"
                      alt={cat.name}
                      onError={e => e.target.src = "https://placehold.co/100x100"}
                    />
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 text-xs font-medium max-w-xs truncate">
                    {cat.description || "No description"}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-center gap-1.5">
                      <button
                        onClick={() => { setIsAddMode(false); setFormData(cat); setIsModalOpen(true); }}
                        className="p-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg cursor-pointer transition shadow-2xs"
                        title="Edit"
                      >
                        <LuPencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
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
        {totalPages > 1 && (
          <div className="p-3 flex justify-center gap-1.5 border-t border-slate-200 bg-slate-50">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-lg font-bold text-xs transition cursor-pointer border-2 shadow-2xs ${
                  currentPage === i + 1
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
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
                {isAddMode ? "Add New Category" : "Edit Category"}
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Category Name *</label>
                <input
                  className="w-full p-2.5 rounded-lg border-2 border-slate-300 font-bold focus:outline-slate-900 bg-slate-50"
                  placeholder="e.g. Main Dish"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Slug (optional)</label>
                <input
                  className="w-full p-2.5 rounded-lg border-2 border-slate-300 font-bold focus:outline-slate-900 bg-slate-50"
                  placeholder="e.g. main-dish"
                  value={formData.slug}
                  onChange={e => setFormData({ ...formData, slug: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Description</label>
                <textarea
                  className="w-full p-2.5 rounded-lg border-2 border-slate-300 font-bold focus:outline-slate-900 bg-slate-50"
                  placeholder="Category description..."
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Category Image</label>
                <div className="border-2 border-dashed border-slate-300 p-3 rounded-lg text-center bg-slate-50">
                  {!isAddMode && formData.image && !(formData.image instanceof File) && (
                    <div className="mb-2">
                      <p className="text-[10px] text-slate-400 mb-1 font-semibold">Current Image:</p>
                      <img
                        src={`http://127.0.0.1:8000/storage/${formData.image}`}
                        className="w-16 h-10 object-cover mx-auto rounded border border-slate-300"
                        alt="Current"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[11px] file:font-bold file:bg-slate-900 file:text-white cursor-pointer"
                    onChange={e => setFormData({ ...formData, image: e.target.files[0] })}
                  />
                </div>
              </div>
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

export default ManagementCategories;