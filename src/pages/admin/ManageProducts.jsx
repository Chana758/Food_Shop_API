import React, { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { FaEdit, FaTrash, FaBox, FaPlus, FaSearch } from "react-icons/fa";

// Import Services របស់អ្នក
import { categoryService } from '../../service/categoryService';
import { productService } from '../../service/productService';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddMode, setIsAddMode] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    id: null, name: '', description: '', price: '', discount_price: '',
    stock_quantity: '', category_id: '', sku: '', prep_time: '',
    is_active: 1, is_featured: 0, image: null, image_path: null
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        productService.getAll(),
        categoryService.getAll()
      ]);

      // 1. Set Products
      setProducts(prodRes?.data?.data || prodRes?.data || []);

      // 2. សម្អាតទិន្នន័យ Categories យ៉ាងមានសុវត្ថិភាព
      let catList = [];
      if (Array.isArray(catRes)) {
        catList = catRes;
      } else if (catRes?.data && Array.isArray(catRes.data)) {
        catList = catRes.data;
      } else if (catRes?.data?.data && Array.isArray(catRes.data.data)) {
        catList = catRes.data.data;
      }
      setCategories(catList);

    } catch (err) {
      toast.error("Failed to load data");
      console.error(err);
    }
  };

  const handleSave = async (e) => {z
    e.preventDefault();
    const data = new FormData();

    // feat: Automate slug generation from product name
    data.append('slug', formData.name.toLowerCase().replace(/\s+/g, '-'));

    // feat: Data normalization for FormData
    Object.keys(formData).forEach(key => {
        // chore: Skip internal UI state fields
        if (key === 'image_path') return;

        // feat: Handle file uploads (only if new file is selected)
        if (key === 'image' && formData.image instanceof File) {
            data.append('image', formData.image);
        }
        // feat: Cast boolean values to integer (Laravel requirement)
        else if (key === 'is_active' || key === 'is_featured') {
            data.append(key, formData[key] ? 1 : 0);
        }
        // feat: Append valid form values only
        else if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
            data.append(key, formData[key]);
        }
    });

    try {
        if (isAddMode) {
            await productService.create(data);
        } else {
            // _method ត្រូវជា 'PUT' (មិនមែន 'POST' ដូចកូដដើម) — Laravel ត្រូវការវា
            // ដើម្បីដឹងថា request នេះជា update មិនមែន create
            data.append('_method', 'PUT');
            await productService.update(formData.id, data);
        }

        toast.success("Successfully saved!");
        setIsModalOpen(false);
        fetchAll(); // refactor: Refresh product list
    } catch (err) {
        // FIXME: Log full response for debugging Laravel validation failures
        console.error("Error Detail:", err.response?.data);
        toast.error(err.response?.data?.message || "Error saving data");
    }
};

  const deleteProduct = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        await productService.delete(id);
        toast.success("Deleted!");
        fetchAll();
      } catch (err) { toast.error("Delete failed"); }
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <Toaster />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {[ {title: "Total Products", val: products.length, color: "bg-blue-500"}, {title: "In Stock", val: products.filter(p=>p.stock_quantity > 0).length, color: "bg-green-500"}, {title: "Out of Stock", val: products.filter(p=>p.stock_quantity <= 0).length, color: "bg-red-500"}, {title: "Categories", val: categories.length, color: "bg-purple-500"} ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border flex items-center justify-between">
            <div><p className="text-gray-400 text-xs font-bold uppercase">{item.title}</p><h2 className="text-2xl font-black">{item.val}</h2></div>
            <div className={`p-3 rounded-2xl text-white ${item.color}`}><FaBox /></div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-[#1d9d01]">PRODUCT MANAGEMENT</h1>
        <div className="flex gap-4">
          <input className="px-6 py-3 rounded-2xl border w-72 focus:outline-none" placeholder="Search products..." onChange={(e) => setSearchTerm(e.target.value)} />
          <button onClick={() => { setIsAddMode(true); setFormData({name:'', price:'', stock_quantity:'', sku:'', category_id:'', description:'', discount_price:'', prep_time:'', is_active:1, is_featured:0, image:null, image_path:null}); setIsModalOpen(true); }} className="bg-black text-white px-8 py-3 rounded-2xl font-bold hover:bg-gray-800">+ Add New</button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 gap-6">
        {products.filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
          <div key={p.id} className="bg-white p-5 rounded-3xl border shadow-sm hover:shadow-lg transition">
            <img src={`http://127.0.0.1:8000/storage/${p.image}`} className="w-full h-40 object-cover rounded-2xl mb-4" onError={(e) => e.target.src = 'https://placehold.co/400x300'} />
            <h3 className="font-bold text-lg">{p.name}</h3>
            <div className="flex justify-between items-center mt-4">
              <span className="text-xl font-black text-orange-500">${p.price}</span>
              <div className="flex gap-2">
                <button onClick={() => { setIsAddMode(false); setFormData({...p, image: null, image_path: p.image}); setIsModalOpen(true); }} className="p-3 bg-gray-100 rounded-xl"><FaEdit /></button>
                <button onClick={() => deleteProduct(p.id)} className="p-3 bg-red-50 text-red-600 rounded-xl"><FaTrash /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <form onSubmit={handleSave} className="bg-white p-8 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-2xl font-black mb-6">{isAddMode ? 'Add Product' : 'Edit Product'}</h2>
            <div className="grid grid-cols-2 gap-4">
              <input className="col-span-2 p-4 rounded-2xl border" placeholder="Product Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              <input type="number" className="p-4 rounded-2xl border" placeholder="Price" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              <input type="number" className="p-4 rounded-2xl border" placeholder="Discount" value={formData.discount_price} onChange={e => setFormData({...formData, discount_price: e.target.value})} />
              <input type="number" className="p-4 rounded-2xl border" placeholder="Stock Qty" value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: e.target.value})} />
              <input className="p-4 rounded-2xl border" placeholder="SKU" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
              <input type="number" className="col-span-2 p-4 rounded-2xl border" placeholder="Prep Time (min)" value={formData.prep_time} onChange={e => setFormData({...formData, prep_time: e.target.value})} />

              <select className="col-span-2 p-4 rounded-2xl border" value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})}>
                <option value="">Select Category</option>
                {Array.isArray(categories) && categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>

              <textarea className="col-span-2 p-4 rounded-2xl border" placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              <div className="col-span-2 flex gap-4">
                <label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_active == 1} onChange={e => setFormData({...formData, is_active: e.target.checked ? 1 : 0})} /> Active</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_featured == 1} onChange={e => setFormData({...formData, is_featured: e.target.checked ? 1 : 0})} /> Featured</label>
              </div>
              <input type="file" className="col-span-2 p-2 border rounded-2xl" onChange={e => setFormData({...formData, image: e.target.files[0]})} />
            </div>
            <div className="mt-8 flex gap-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 border rounded-2xl font-bold">Cancel</button>
              <button type="submit" className="flex-1 py-4 bg-[#1d9d01] text-white rounded-2xl font-bold">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;