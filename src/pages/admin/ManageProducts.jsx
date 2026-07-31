// src/pages/admin/ManageProducts.jsx
import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { FaEdit, FaTrash, FaTag } from 'react-icons/fa';
import { categoryService } from '../../service/categoryService';
import { productService }  from '../../service/productService';
import { hasDiscount, getFinalPrice, getDiscountPercent, fmt } from '../../utils/priceUtils';

const LOW_STOCK_THRESHOLD = 10;

const getStockBadge = (qty) => {
  const quantity = Number(qty) || 0;
  if (quantity <= 0)                    return { label: 'Out of Stock',           className: 'bg-red-600 text-white font-black' };
  if (quantity <= LOW_STOCK_THRESHOLD)  return { label: `Low Stock: ${quantity}`, className: 'bg-amber-500 text-slate-950 font-black' };
  return                                       { label: `In Stock: ${quantity}`,  className: 'bg-emerald-700 text-white font-black' };
};

const ManageProducts = () => {
  const { searchTerm = '' } = useOutletContext() || {};

  const [allProducts,  setAllProducts]  = useState([]);
  const [categories,   setCategories]   = useState([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [isModalOpen,  setIsModalOpen]  = useState(false);
  const [isAddMode,    setIsAddMode]    = useState(true);
  const [isSaving,     setIsSaving]     = useState(false);
  const [stockFilter,    setStockFilter]    = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const PER_PAGE = 12;
  const [currentPage, setCurrentPage] = useState(1);

  const [formData, setFormData] = useState({
    id: null, name: '', description: '', price: '', discount_price: '',
    stock_quantity: '', category_id: '', sku: '', prep_time: '',
    is_active: 1, is_featured: 0, image: null, image_path: null,
  });

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          categoryService.getAll({ per_page: 100 }),
          productService.getAll({ per_page: 100 }),
        ]);
        if (!isMounted) return;
        const catList  = catRes?.data?.data  || catRes?.data  || [];
        const prodList = prodRes?.data?.data || prodRes?.data || [];
        setCategories(Array.isArray(catList)  ? catList  : []);
        setAllProducts(Array.isArray(prodList) ? prodList : []);
      } catch { toast.error('Failed to load data'); }
      finally  { if (isMounted) setIsLoading(false); }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, categoryFilter, stockFilter]);

  const refreshProducts = async () => {
    try {
      const res  = await productService.getAll({ per_page: 100 });
      const list = res?.data?.data || res?.data || [];
      setAllProducts(Array.isArray(list) ? list : []);
    } catch { toast.error('Failed to reload products'); }
  };

  const visibleProducts = allProducts.filter((p) => {
    const catName = p.category?.name || '';
    const qty     = Number(p.stock_quantity) || 0;
    const matchCategory = categoryFilter === 'all' || catName === categoryFilter;
    const matchStock    =
      stockFilter === 'low' ? (qty > 0 && qty <= LOW_STOCK_THRESHOLD) :
      stockFilter === 'out' ? qty <= 0 : true;
    const matchSearch =
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      catName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchStock && matchSearch;
  });

  const lastPage      = Math.max(1, Math.ceil(visibleProducts.length / PER_PAGE));
  const pagedProducts = visibleProducts.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
  const inStock       = allProducts.filter(p => Number(p.stock_quantity) > 0).length;
  const outOfStock    = allProducts.filter(p => Number(p.stock_quantity) <= 0).length;
  const onSale        = allProducts.filter(p => hasDiscount(p.price, p.discount_price)).length;

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const data = new FormData();
    data.append('slug', formData.name.toLowerCase().replace(/\s+/g, '-'));
    Object.keys(formData).forEach(key => {
      if (key === 'image_path') return;
      if (key === 'image' && formData.image instanceof File) { data.append('image', formData.image); return; }
      if (key === 'is_active' || key === 'is_featured') { data.append(key, formData[key] ? 1 : 0); return; }
      if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') data.append(key, formData[key]);
    });
    try {
      if (isAddMode) { await productService.create(data); }
      else           { data.append('_method', 'PUT'); await productService.update(formData.id, data); }
      toast.success('Saved successfully!');
      setIsModalOpen(false);
      refreshProducts();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving product'); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try { await productService.delete(id); toast.success('Product deleted'); refreshProducts(); }
    catch { toast.error('Delete failed'); }
  };

  const openAddModal = () => {
    setIsAddMode(true);
    setFormData({ id: null, name: '', description: '', price: '', discount_price: '',
      stock_quantity: '', category_id: '', sku: '', prep_time: '',
      is_active: 1, is_featured: 0, image: null, image_path: null });
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setIsAddMode(false);
    setFormData({ ...product, image: null, image_path: product.image });
    setIsModalOpen(true);
  };

  if (isLoading) return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-8">
      <div className="w-10 h-10 border-4 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
      <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mt-4">Loading products...</p>
    </div>
  );

  return (
    <div className="p-6 md:p-8 bg-slate-100 min-h-screen space-y-6">
      <Toaster />

      {/* ── PRODUCT PERFORMANCE REPORT ── */}
      <div className="bg-white rounded-xl border-2 border-slate-300 p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider">PRODUCT PERFORMANCE REPORT</h2>
          <p className="text-sm font-bold text-slate-900 mt-0.5">Daily, monthly, and yearly product metrics with actionable data</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'TOTAL PRODUCTS', val: allProducts.length, filter: 'all', desc: 'Active tracking', textClass: 'text-slate-900' },
            { title: 'IN STOCK',       val: inStock,            filter: null,  desc: 'Available items',   textClass: 'text-emerald-700' },
            { title: 'OUT OF STOCK',   val: outOfStock,         filter: 'out', desc: 'Requires restock',  textClass: 'text-red-700' },
            { title: 'ON SALE',        val: onSale,             filter: null,  desc: 'Discounted items',  textClass: 'text-amber-700' },
          ].map((item, i) => (
            <button key={i}
              onClick={() => item.filter && setStockFilter(item.filter)}
              disabled={!item.filter}
              className={`bg-white p-4 rounded-lg border-2 border-slate-300 flex flex-col justify-between text-left transition relative shadow-2xs
                ${item.filter ? 'hover:border-slate-400 hover:bg-slate-50 cursor-pointer' : 'cursor-default'}
                ${stockFilter === item.filter && item.filter ? 'ring-2 ring-slate-900 border-transparent' : ''}`}
            >
              <div>
                <p className="text-[11px] font-black uppercase text-slate-600 tracking-wider mb-1">{item.title}</p>
                <p className={`text-3xl font-black mt-1 ${item.textClass}`}>{item.val}</p>
              </div>
              <span className="text-xs text-slate-600 font-semibold mt-3 inline-block">{item.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── PRODUCT MANAGEMENT HEADER ── */}
      <div className="bg-white rounded-xl border-2 border-slate-300 p-6 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-base font-black text-slate-900 uppercase tracking-wide">Product Management</h1>
          {searchTerm && <p className="text-xs text-slate-600 mt-1 font-semibold">Results for "<span className="font-bold text-slate-900">{searchTerm}</span>"</p>}
          {stockFilter !== 'all' && (
            <p className="text-xs text-slate-600 mt-1 font-semibold">
              Filtered: <span className="font-bold text-slate-900 capitalize">{stockFilter === 'out' ? 'Out of Stock' : 'Low Stock'}</span>
              <button onClick={() => setStockFilter('all')} className="ml-2 text-xs underline text-slate-600 hover:text-slate-900 cursor-pointer font-bold">clear</button>
            </p>
          )}
        </div>
        <button onClick={openAddModal} className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition cursor-pointer shadow-md whitespace-nowrap">
          + Add New Product
        </button>
      </div>

      {/* ── CATEGORY TABS ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {['all', ...categories.map(c => c.name)].map((name, i) => {
          const isAll    = name === 'all';
          const isActive = isAll ? categoryFilter === 'all' : categoryFilter === name;
          return (
            <button key={i} onClick={() => setCategoryFilter(isAll ? 'all' : name)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition cursor-pointer border-2
                ${isActive ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900'}`}>
              {isAll ? 'All Categories' : name}
            </button>
          );
        })}
      </div>

      {/* ── PRODUCT GRID (Updated to match Image Style 1: horizontal image card with cleaner top image layout) ── */}
      {visibleProducts.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-slate-300 p-16 text-center text-slate-500 font-bold text-xs uppercase tracking-wider">
          {searchTerm ? `No products found for "${searchTerm}"` : 'No products match this filter'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pagedProducts.map(p => {
            const stockBadge = getStockBadge(p.stock_quantity);
            const discPct    = getDiscountPercent(p.price, p.discount_price);
            const finalPrice = getFinalPrice(p.price, p.discount_price);
            const discounted = hasDiscount(p.price, p.discount_price);
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group">
                <div>
                  <div className="p-3 pb-0">
                    <div className="relative rounded-xl overflow-hidden bg-slate-100 shadow-sm">
                      <img
                        src={p.image ? `http://127.0.0.1:8000/storage/${p.image}` : 'https://placehold.co/400x300'}
                        className={`w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500 ${Number(p.stock_quantity) <= 0 ? 'opacity-40 grayscale' : ''}`}
                        onError={e => e.target.src = 'https://placehold.co/400x300'}
                        alt={p.name}
                      />
                      <span className={`absolute top-2.5 right-2.5 px-2.5 py-1 rounded-md text-[10px] font-black shadow-md ${stockBadge.className}`}>
                        {stockBadge.label}
                      </span>
                      {discPct && (
                        <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase shadow-md bg-amber-400 text-slate-950 flex items-center gap-1">
                          <FaTag size={8} /> {discPct}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 pt-3">
                    <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">{p.category?.name || 'General'}</span>
                    <h3 className="font-black text-sm text-slate-900 line-clamp-1 mt-0.5">{p.name}</h3>
                  </div>
                </div>

                <div className="p-4 pt-0 flex justify-between items-center mt-2">
                  <div className="flex flex-col">
                    {discounted ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-400 line-through font-bold">{fmt(p.price)}</span>
                        <span className="text-base font-black text-rose-600">{fmt(finalPrice)}</span>
                      </div>
                    ) : (
                      <span className="text-base font-black text-slate-900">{fmt(p.price)}</span>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => openEditModal(p)} className="p-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg cursor-pointer transition-colors shadow-2xs" title="Edit">
                      <FaEdit size={13} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 bg-slate-50 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-lg cursor-pointer transition-colors shadow-2xs" title="Delete">
                      <FaTrash size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── PAGINATION ── */}
      {lastPage > 1 && (
        <div className="flex justify-center items-center gap-1.5 pt-4">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
            className="w-9 h-9 rounded-lg font-bold text-xs border-2 border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer flex items-center justify-center shadow-xs">‹</button>
          {Array.from({ length: lastPage }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setCurrentPage(p)}
              className={`w-9 h-9 rounded-lg font-bold text-xs transition cursor-pointer border-2 shadow-xs ${currentPage === p ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'}`}>
              {p}
            </button>
          ))}
          <button onClick={() => setCurrentPage(p => Math.min(lastPage, p + 1))} disabled={currentPage === lastPage}
            className="w-9 h-9 rounded-lg font-bold text-xs border-2 border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer flex items-center justify-center shadow-xs">›</button>
        </div>
      )}

      {/* ── MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs flex justify-center items-center p-4 z-50">
          <form onSubmit={handleSave} className="bg-white p-6 rounded-xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-4 border-2 border-slate-300">
            <h2 className="text-sm font-black uppercase text-slate-900 mb-2">{isAddMode ? 'Add New Product' : 'Edit Product'}</h2>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <input className="col-span-2 p-3 rounded-lg border-2 border-slate-300 font-bold focus:outline-slate-900 bg-slate-50" placeholder="Product Name *"
                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
              
              <input type="number" className="p-3 rounded-lg border-2 border-slate-300 font-bold focus:outline-slate-900 bg-slate-50" placeholder="Original Price *"
                value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
              
              <input type="number" className="p-3 rounded-lg border-2 border-slate-300 font-bold focus:outline-slate-900 bg-slate-50" placeholder="Discount Price (optional)"
                value={formData.discount_price} onChange={e => setFormData({ ...formData, discount_price: e.target.value })} />

              {hasDiscount(formData.price, formData.discount_price) && (
                <div className="col-span-2 bg-amber-50 border-2 border-amber-300 rounded-lg px-4 py-2.5 flex items-center gap-3">
                  <FaTag className="text-amber-700" size={13} />
                  <span className="font-bold text-amber-950">
                    <span className="line-through text-slate-500">{fmt(formData.price)}</span>
                    {' → '}
                    <span className="text-rose-600">{fmt(formData.discount_price)}</span>
                    {' '}
                    <span className="bg-amber-400 text-amber-950 px-2 py-0.5 rounded text-[10px] ml-1 font-black">
                      {getDiscountPercent(formData.price, formData.discount_price)}
                    </span>
                  </span>
                </div>
              )}

              <div className="relative">
                <input type="number" className="p-3 rounded-lg border-2 border-slate-300 font-bold w-full focus:outline-slate-900 bg-slate-50" placeholder="Stock Qty *"
                  value={formData.stock_quantity} onChange={e => setFormData({ ...formData, stock_quantity: e.target.value })} required />
                <p className="text-[10px] text-slate-600 mt-1 ml-1 font-semibold">≤ {LOW_STOCK_THRESHOLD} = Low Stock warning</p>
              </div>

              <input className="p-3 rounded-lg border-2 border-slate-300 font-bold focus:outline-slate-900 bg-slate-50" placeholder="SKU"
                value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} />

              <input type="number" className="col-span-2 p-3 rounded-lg border-2 border-slate-300 font-bold focus:outline-slate-900 bg-slate-50" placeholder="Prep Time (min)"
                value={formData.prep_time} onChange={e => setFormData({ ...formData, prep_time: e.target.value })} />

              <select className="col-span-2 p-3 rounded-lg border-2 border-slate-300 font-bold focus:outline-slate-900 bg-slate-50" value={formData.category_id}
                onChange={e => setFormData({ ...formData, category_id: e.target.value })} required>
                <option value="">Select Category *</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>

              <textarea className="col-span-2 p-3 rounded-lg border-2 border-slate-300 font-bold focus:outline-slate-900 bg-slate-50" placeholder="Description" rows={3}
                value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />

              <div className="col-span-2 flex gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input type="checkbox" checked={formData.is_active == 1}
                    onChange={e => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })} /> Active
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input type="checkbox" checked={formData.is_featured == 1}
                    onChange={e => setFormData({ ...formData, is_featured: e.target.checked ? 1 : 0 })} /> Featured
                </label>
              </div>

              {!isAddMode && formData.image_path && (
                <div className="col-span-2">
                  <p className="text-xs text-slate-600 mb-1 font-semibold">Current Image</p>
                  <img src={`http://127.0.0.1:8000/storage/${formData.image_path}`} className="w-20 h-14 object-cover rounded border-2 border-slate-300" alt="Current" />
                </div>
              )}

              <input type="file" accept="image/*" className="col-span-2 p-2 border-2 border-slate-300 rounded-lg file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white cursor-pointer bg-slate-50"
                onChange={e => setFormData({ ...formData, image: e.target.files[0] })} />
            </div>

            <div className="mt-6 flex gap-3 pt-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border-2 border-slate-300 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-slate-100 cursor-pointer text-slate-700 transition">Cancel</button>
              <button type="submit" disabled={isSaving} className="flex-1 py-3 bg-slate-900 text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-slate-800 cursor-pointer transition shadow-md">
                {isSaving ? 'Saving...' : 'Save Product'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;