import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import {
  FaEdit, FaTrash, FaTag, FaClock, FaBoxOpen, FaImage,
  FaInfoCircle, FaDollarSign, FaLayerGroup, FaTimes
} from 'react-icons/fa';
import { categoryService } from '../../service/categoryService';
import { productService }  from '../../service/productService';
import { hasDiscount, getFinalPrice, getDiscountPercent, getDiscountExpiryLabel, fmt } from '../../utils/priceUtils';
import { getPublicImageUrl } from '../../utils/imageUrl';

const FONT_SERIF = { fontFamily: "'Fraunces', Georgia, serif" };
const CARD = "bg-white rounded-xl border border-[#E8E3D8] shadow-[0_1px_3px_rgba(30,42,46,0.05)]";
const PAGE_BG = "var(--page-bg)";

const LOW_STOCK_THRESHOLD = 10;

const getStockBadge = (qty) => {
  const quantity = Number(qty) || 0;
  if (quantity <= 0)                    return { label: 'Out of Stock',           className: 'bg-[#B5453B] text-white font-black' };
  if (quantity <= LOW_STOCK_THRESHOLD)  return { label: `Low Stock: ${quantity}`, className: 'bg-[#D99A3D] text-white font-black' };
  return                                       { label: `In Stock: ${quantity}`,  className: 'bg-[#3F7D58] text-white font-black' };
};

const STAT_FILL = {
  ink:   'bg-[#1E2A2E]',
  herb:  'bg-[#3F7D58]',
  chili: 'bg-[#B5453B]',
  gold:  'bg-[#D99A3D]',
};

// Shared input styling helpers (keeps the form visually consistent)
const FIELD_LABEL = "block text-[10px] font-black uppercase tracking-wider text-[#8B9296] mb-1.5";
const FIELD_INPUT = "w-full p-3 rounded-lg border border-[#E8E3D8] font-bold text-[#1E2A2E] text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2A2E]/10 focus:border-[#1E2A2E] bg-[#FBF9F5] transition placeholder:font-semibold placeholder:text-[#B0AA9C]";
const SECTION_TITLE = "flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#1E2A2E] pb-2 mb-4 border-b border-[#EFEAE0]";

// Convert an ISO datetime (from backend) to the `datetime-local` input format
const toDatetimeLocalValue = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
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
    discount_expires_at: '',
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
  const onSale        = allProducts.filter(p => hasDiscount(p.price, p.discount_price, p.discount_expires_at)).length;

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const data = new FormData();
    data.append('slug', formData.name.toLowerCase().replace(/\s+/g, '-'));
    Object.keys(formData).forEach(key => {
      if (key === 'image_path') return;
      if (key === 'image' && formData.image instanceof File) { data.append('image', formData.image); return; }
      if (key === 'is_active' || key === 'is_featured') { data.append(key, formData[key] ? 1 : 0); return; }
      if (key === 'discount_expires_at') { data.append(key, formData[key] || ''); return; }
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
    setFormData({
      id: null, name: '', description: '', price: '', discount_price: '',
      discount_expires_at: '',
      stock_quantity: '', category_id: '', sku: '', prep_time: '',
      is_active: 1, is_featured: 0, image: null, image_path: null,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setIsAddMode(false);
    setFormData({
      ...product,
      discount_expires_at: toDatetimeLocalValue(product.discount_expires_at),
      image: null,
      image_path: product.image,
    });
    setIsModalOpen(true);
  };

  const discountActive = hasDiscount(formData.price, formData.discount_price, formData.discount_expires_at);

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8" style={{ background: PAGE_BG }}>
      <div className="w-10 h-10 border-4 border-[#E8E3D8] border-t-[#1E2A2E] rounded-full animate-spin" />
      <p className="text-xs font-bold uppercase tracking-widest text-[#8B9296] mt-4">Loading products...</p>
    </div>
  );

  return (
    <div className="p-6 md:p-8 min-h-screen space-y-6" style={{ background: PAGE_BG }}>
      <Toaster />

      {/* ── PRODUCT PERFORMANCE REPORT ── */}
      <div className={`${CARD} p-6 space-y-4`}>
        <div>
          <h2 className="text-xs font-black text-[#8B9296] uppercase tracking-wider">Product performance report</h2>
          <p style={FONT_SERIF} className="text-[16px] font-semibold text-[#1E2A2E] mt-0.5">Daily, monthly, and yearly product metrics with actionable data</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'TOTAL PRODUCTS', val: allProducts.length, filter: 'all', desc: 'Active tracking',    fill: 'ink' },
            { title: 'IN STOCK',       val: inStock,            filter: null,  desc: 'Available items',    fill: 'herb' },
            { title: 'OUT OF STOCK',   val: outOfStock,         filter: 'out', desc: 'Requires restock',   fill: 'chili' },
            { title: 'ON SALE',        val: onSale,             filter: null,  desc: 'Discounted items',   fill: 'gold' },
          ].map((item, i) => (
            <button key={i}
              onClick={() => item.filter && setStockFilter(item.filter)}
              disabled={!item.filter}
              className={`${STAT_FILL[item.fill]} p-4 rounded-xl flex flex-col justify-between text-left transition relative shadow-[0_4px_14px_rgba(30,42,46,0.12)]
                ${item.filter ? 'hover:brightness-110 cursor-pointer' : 'cursor-default'}
                ${stockFilter === item.filter && item.filter ? 'ring-2 ring-white ring-offset-2 ring-offset-[#FBF9F5]' : ''}`}
            >
              <div>
                <p className="text-[11px] font-black uppercase text-white/70 tracking-wider mb-1">{item.title}</p>
                <p className="text-3xl font-black mt-1 text-white">{item.val}</p>
              </div>
              <span className="text-xs text-white/80 font-semibold mt-3 inline-block">{item.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── PRODUCT MANAGEMENT HEADER ── */}
      <div className={`${CARD} p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4`}>
        <div>
          <h1 style={FONT_SERIF} className="text-[16px] font-semibold text-[#1E2A2E]">Product Management</h1>
          {searchTerm && <p className="text-xs text-[#8B9296] mt-1 font-semibold">Results for "<span className="font-bold text-[#1E2A2E]">{searchTerm}</span>"</p>}
          {stockFilter !== 'all' && (
            <p className="text-xs text-[#8B9296] mt-1 font-semibold">
              Filtered: <span className="font-bold text-[#1E2A2E] capitalize">{stockFilter === 'out' ? 'Out of Stock' : 'Low Stock'}</span>
              <button onClick={() => setStockFilter('all')} className="ml-2 text-xs underline text-[#5B6B6F] hover:text-[#1E2A2E] cursor-pointer font-bold">clear</button>
            </p>
          )}
        </div>
        <button onClick={openAddModal} className="bg-[#1E2A2E] text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#2A3B3F] transition cursor-pointer shadow-md whitespace-nowrap">
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
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition cursor-pointer border
                ${isActive ? 'bg-[#1E2A2E] text-white border-[#1E2A2E] shadow-sm' : 'bg-white border-[#E8E3D8] text-[#5B6B6F] hover:bg-[#FBF9F5] hover:text-[#1E2A2E]'}`}>
              {isAll ? 'All Categories' : name}
            </button>
          );
        })}
      </div>

      {/* ── PRODUCT GRID ── */}
      {visibleProducts.length === 0 ? (
        <div className={`${CARD} p-16 text-center text-[#9AA0A0] font-bold text-xs uppercase tracking-wider`}>
          {searchTerm ? `No products found for "${searchTerm}"` : 'No products match this filter'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pagedProducts.map(p => {
            const stockBadge = getStockBadge(p.stock_quantity);
            const discounted = hasDiscount(p.price, p.discount_price, p.discount_expires_at);
            const finalPrice = getFinalPrice(p.price, p.discount_price, p.discount_expires_at);
            const discPct    = getDiscountPercent(p.price, p.discount_price, p.discount_expires_at);
            const expiry     = discounted ? getDiscountExpiryLabel(p.discount_expires_at) : null;
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-[#E8E3D8] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group">
                <div>
                  <div className="p-3 pb-0">
                    <div className="relative rounded-xl overflow-hidden bg-[#FBF9F5] shadow-sm">
                      <img
                        src={getPublicImageUrl(p.image, 'https://placehold.co/400x300')}
                        className={`w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500 ${Number(p.stock_quantity) <= 0 ? 'opacity-40 grayscale' : ''}`}
                        onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x300'; }}
                        alt={p.name}
                      />
                      <span className={`absolute top-2.5 right-2.5 px-2.5 py-1 rounded-md text-[10px] font-black shadow-md ${stockBadge.className}`}>
                        {stockBadge.label}
                      </span>
                      {discPct && (
                        <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase shadow-md bg-[#D99A3D] text-white flex items-center gap-1">
                          <FaTag size={8} /> {discPct}
                        </span>
                      )}
                      {expiry && (
                        <span className={`absolute bottom-2.5 left-2.5 px-2 py-1 rounded-md text-[9px] font-black shadow-md flex items-center gap-1 ${
                          expiry.urgent ? 'bg-[#B5453B] text-white' : 'bg-[#1E2A2E]/80 text-white'
                        }`}>
                          <FaClock size={8} /> {expiry.label}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 pt-3">
                    <span className="text-[10px] text-[#3F7D58] font-bold uppercase tracking-wider block">{p.category?.name || 'General'}</span>
                    <h3 className="font-black text-sm text-[#1E2A2E] line-clamp-1 mt-0.5">{p.name}</h3>
                  </div>
                </div>

                <div className="p-4 pt-0 flex justify-between items-center mt-2">
                  <div className="flex flex-col">
                    {discounted ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-[#C4C0B4] line-through font-bold">{fmt(p.price)}</span>
                        <span className="text-base font-black text-[#B5453B]">{fmt(finalPrice)}</span>
                      </div>
                    ) : (
                      <span className="text-base font-black text-[#1E2A2E]">{fmt(p.price)}</span>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => openEditModal(p)} className="p-2 bg-[#FBF9F5] border border-[#E8E3D8] hover:bg-[#F3F0E9] text-[#5B6B6F] rounded-lg cursor-pointer transition-colors shadow-2xs" title="Edit">
                      <FaEdit size={13} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 bg-[#FBF9F5] border border-[#EBC7C1] hover:bg-[#F5E1DE] text-[#B5453B] rounded-lg cursor-pointer transition-colors shadow-2xs" title="Delete">
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
            className="w-9 h-9 rounded-lg font-bold text-xs border border-[#E8E3D8] bg-white hover:bg-[#FBF9F5] disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer flex items-center justify-center shadow-xs text-[#5B6B6F]">‹</button>
          {Array.from({ length: lastPage }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setCurrentPage(p)}
              className={`w-9 h-9 rounded-lg font-bold text-xs transition cursor-pointer border shadow-xs ${currentPage === p ? 'bg-[#1E2A2E] text-white border-[#1E2A2E]' : 'bg-white border-[#E8E3D8] text-[#5B6B6F] hover:bg-[#FBF9F5]'}`}>
              {p}
            </button>
          ))}
          <button onClick={() => setCurrentPage(p => Math.min(lastPage, p + 1))} disabled={currentPage === lastPage}
            className="w-9 h-9 rounded-lg font-bold text-xs border border-[#E8E3D8] bg-white hover:bg-[#FBF9F5] disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer flex items-center justify-center shadow-xs text-[#5B6B6F]">›</button>
        </div>
      )}

      {/* ══════════════════════════ MODAL ══════════════════════════ */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#1E2A2E]/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <form
            onSubmit={handleSave}
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] shadow-2xl border border-[#E8E3D8] flex flex-col overflow-hidden"
          >
            {/* ── Sticky Header ── */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EFEAE0] bg-white flex-shrink-0">
              <div>
                <h2 style={FONT_SERIF} className="text-lg font-semibold text-[#1E2A2E]">
                  {isAddMode ? 'Add New Product' : 'Edit Product'}
                </h2>
                <p className="text-[11px] text-[#8B9296] font-semibold mt-0.5">
                  {isAddMode ? 'Fill in the details to create a new menu item' : `Editing "${formData.name || 'product'}"`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#8B9296] hover:bg-[#FBF9F5] hover:text-[#1E2A2E] transition"
              >
                <FaTimes size={14} />
              </button>
            </div>

            {/* ── Scrollable Body ── */}
            <div className="overflow-y-auto px-6 py-6 space-y-6 flex-1">

              {/* SECTION 1 — Basic Info */}
              <section>
                <h3 className={SECTION_TITLE}><FaInfoCircle size={11} /> Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className={FIELD_LABEL}>Product Name *</label>
                    <input className={FIELD_INPUT} placeholder="e.g. Amok Trey"
                      value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                  </div>

                  <div className="col-span-2">
                    <label className={FIELD_LABEL}>Category *</label>
                    <select className={FIELD_INPUT} value={formData.category_id}
                      onChange={e => setFormData({ ...formData, category_id: e.target.value })} required>
                      <option value="">Select a category…</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className={FIELD_LABEL}>Description</label>
                    <textarea className={`${FIELD_INPUT} resize-none`} placeholder="Short description shown to customers…" rows={3}
                      value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                  </div>
                </div>
              </section>

              {/* SECTION 2 — Pricing & Discount */}
              <section>
                <h3 className={SECTION_TITLE}><FaDollarSign size={11} /> Pricing & Discount</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={FIELD_LABEL}>Original Price *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B9296] font-bold text-sm">$</span>
                      <input type="number" step="0.01" className={`${FIELD_INPUT} pl-6`} placeholder="0.00"
                        value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                    </div>
                  </div>

                  <div>
                    <label className={FIELD_LABEL}>Discount Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B9296] font-bold text-sm">$</span>
                      <input type="number" step="0.01" className={`${FIELD_INPUT} pl-6`} placeholder="Optional"
                        value={formData.discount_price} onChange={e => setFormData({ ...formData, discount_price: e.target.value })} />
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className={FIELD_LABEL}>Discount Expires At</label>
                    <input
                      type="datetime-local"
                      className={`${FIELD_INPUT} ${!formData.discount_price ? 'opacity-50 cursor-not-allowed' : ''}`}
                      value={formData.discount_expires_at || ''}
                      onChange={e => setFormData({ ...formData, discount_expires_at: e.target.value })}
                      disabled={!formData.discount_price}
                    />
                    {!formData.discount_price && (
                      <p className="text-[10px] text-[#B0AA9C] mt-1.5 ml-0.5">Set a discount price first to enable an expiry date.</p>
                    )}
                  </div>

                  {discountActive && (
                    <div className="col-span-2 bg-[#FBEDD9] border border-[#F1D9AE] rounded-lg px-4 py-3 flex items-center gap-3 flex-wrap">
                      <FaTag className="text-[#8A5A12] flex-shrink-0" size={13} />
                      <span className="font-bold text-[#5C3D0C] text-sm">
                        <span className="line-through text-[#B0A177]">{fmt(formData.price)}</span>
                        {' → '}
                        <span className="text-[#B5453B]">{fmt(formData.discount_price)}</span>
                        {' '}
                        <span className="bg-[#D99A3D] text-white px-2 py-0.5 rounded text-[10px] ml-1 font-black">
                          {getDiscountPercent(formData.price, formData.discount_price, formData.discount_expires_at)}
                        </span>
                      </span>
                      {formData.discount_expires_at && (
                        <span className="text-[10px] text-[#8A5A12] font-bold flex items-center gap-1 ml-auto">
                          <FaClock size={9} /> {getDiscountExpiryLabel(formData.discount_expires_at)?.label}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </section>

              {/* SECTION 3 — Inventory */}
              <section>
                <h3 className={SECTION_TITLE}><FaBoxOpen size={11} /> Inventory & Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={FIELD_LABEL}>Stock Quantity *</label>
                    <input type="number" className={FIELD_INPUT} placeholder="0"
                      value={formData.stock_quantity} onChange={e => setFormData({ ...formData, stock_quantity: e.target.value })} required />
                    <p className="text-[10px] text-[#8B9296] mt-1.5 ml-0.5 font-semibold">≤ {LOW_STOCK_THRESHOLD} triggers Low Stock warning</p>
                  </div>

                  <div>
                    <label className={FIELD_LABEL}>SKU</label>
                    <input className={FIELD_INPUT} placeholder="Optional"
                      value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} />
                  </div>

                  <div>
                    <label className={FIELD_LABEL}>Prep Time (minutes)</label>
                    <input type="number" className={FIELD_INPUT} placeholder="Optional"
                      value={formData.prep_time} onChange={e => setFormData({ ...formData, prep_time: e.target.value })} />
                  </div>

                  <div className="flex items-end pb-1">
                    <div className="flex gap-5 w-full">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 rounded accent-[#1E2A2E]" checked={formData.is_active == 1}
                          onChange={e => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })} />
                        <span className="text-xs font-bold text-[#3A4548]">Active</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 rounded accent-[#1E2A2E]" checked={formData.is_featured == 1}
                          onChange={e => setFormData({ ...formData, is_featured: e.target.checked ? 1 : 0 })} />
                        <span className="text-xs font-bold text-[#3A4548]">Featured</span>
                      </label>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION 4 — Media */}
              <section>
                <h3 className={SECTION_TITLE}><FaImage size={11} /> Product Image</h3>
                <div className="flex items-start gap-4">
                  {!isAddMode && formData.image_path && (
                    <div className="flex-shrink-0">
                      <img
                        src={getPublicImageUrl(formData.image_path)}
                        className="w-20 h-20 object-cover rounded-xl border border-[#E8E3D8] shadow-sm"
                        alt="Current"
                      />
                      <p className="text-[9px] text-[#8B9296] font-bold uppercase text-center mt-1">Current</p>
                    </div>
                  )}
                  <div className="flex-1">
                    <label className={FIELD_LABEL}>{isAddMode ? 'Upload Image' : 'Replace Image'}</label>
                    <label className="flex items-center justify-center gap-2 w-full p-4 rounded-lg border-2 border-dashed border-[#E8E3D8] bg-[#FBF9F5] hover:bg-[#F3F0E9] hover:border-[#D9D2C3] transition cursor-pointer">
                      <FaImage size={14} className="text-[#8B9296]" />
                      <span className="text-xs font-bold text-[#5B6B6F]">
                        {formData.image instanceof File ? formData.image.name : 'Click to choose a file…'}
                      </span>
                      <input
                        type="file" accept="image/*" className="hidden"
                        onChange={e => setFormData({ ...formData, image: e.target.files[0] })}
                      />
                    </label>
                    <p className="text-[10px] text-[#B0AA9C] mt-1.5 ml-0.5">JPG, PNG or WEBP — recommended 800×600px</p>
                  </div>
                </div>
              </section>
            </div>

            {/* ── Sticky Footer ── */}
            <div className="flex gap-3 px-6 py-4 border-t border-[#EFEAE0] bg-[#FBF9F5] flex-shrink-0">
              <button type="button" onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 border border-[#E8E3D8] bg-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-[#F3F0E9] cursor-pointer text-[#5B6B6F] transition">
                Cancel
              </button>
              <button type="submit" disabled={isSaving}
                className="flex-1 py-3 bg-[#1E2A2E] text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-[#2A3B3F] cursor-pointer transition shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {isSaving && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                {isSaving ? 'Saving...' : (isAddMode ? 'Create Product' : 'Save Changes')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;