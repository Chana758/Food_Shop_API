import React, { useState } from 'react';
import { LuRotateCcw, LuTrash2, LuX, LuTriangleAlert } from 'react-icons/lu';

// Dummy data representing soft-deleted rows across resources
const INITIAL_TRASH = [
  { id: 1, name: 'Beef Lok Lak', type: 'Product', deleted_at: '2026-06-17 09:12' },
  { id: 2, name: 'Seasonal Drinks', type: 'Category', deleted_at: '2026-06-17 14:30' },
  { id: 3, name: 'Table 09', type: 'Table', deleted_at: '2026-06-18 08:05' },
  { id: 4, name: 'Sreymom Kea', type: 'Staff', deleted_at: '2026-06-18 16:47' },
  { id: 5, name: 'Mango Smoothie', type: 'Product', deleted_at: '2026-06-19 10:02' },
];

const TYPES = ['All', 'Product', 'Category', 'Staff', 'Table'];

const TYPE_STYLES = {
  Product: 'bg-[#E4F0E7] text-[#2F6844] border-[#C8E1CE]',
  Category: 'bg-[#E3EDF3] text-[#2E5975] border-[#C2D8E6]',
  Table: 'bg-[#FBEDD9] text-[#B9791F] border-[#F2D7B3]',
  Staff: 'bg-[#EFE8F5] text-[#6B46C1] border-[#D7C7EE]',
};

const Trash = () => {
  const [items, setItems] = useState(INITIAL_TRASH);
  const [activeType, setActiveType] = useState('All');
  const [confirming, setConfirming] = useState(null);
  const [emptyConfirm, setEmptyConfirm] = useState(false);

  const filtered = activeType === 'All' ? items : items.filter((i) => i.type === activeType);

  const restore = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

  const deleteForever = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setConfirming(null);
  };

  const emptyTrash = () => {
    setItems((prev) => (activeType === 'All' ? [] : prev.filter((i) => i.type !== activeType)));
    setEmptyConfirm(false);
  };

  return (
    <div className="p-8 bg-[#F8F6F0] min-h-screen space-y-6">
      
      {/* 1. HEADER SECTION */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#1E2A2E] tracking-tight">Trash Management</h1>
          <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mt-1">
            Restore or permanently delete removed records
          </p>
        </div>
        {items.length > 0 && (
          <button
            onClick={() => setEmptyConfirm(true)}
            className="flex items-center gap-2 bg-[#FCE8E6] text-[#C53030] border border-[#FAD2CF] px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-[#F8D7D4] transition-colors"
          >
            <LuTrash2 size={15} /> Empty Trash
          </button>
        )}
      </div>

      {/* 2. TYPE FILTER TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setActiveType(t)}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider whitespace-nowrap transition-colors ${
              activeType === t
                ? 'bg-[#1E2A2E] text-white shadow-sm'
                : 'bg-white border border-[#E8E3D8] text-gray-500 hover:text-[#1E2A2E] hover:border-gray-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* 3. TRASH TABLE */}
      <div className="bg-white rounded-xl border border-[#E8E3D8] shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#1E2A2E] text-white text-[11px] font-black uppercase tracking-wider">
            <tr>
              <th className="p-4 pl-6">Item Name</th>
              <th className="p-4">Type</th>
              <th className="p-4">Deleted At</th>
              <th className="p-4 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm font-bold text-gray-700">
            {filtered.map((item) => (
              <tr key={item.id} className="border-b border-[#F4F1EA] hover:bg-[#FAF8F5] transition-colors">
                <td className="p-4 pl-6 text-[#1E2A2E]">{item.name}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${TYPE_STYLES[item.type]}`}>
                    {item.type}
                  </span>
                </td>
                <td className="p-4 text-gray-400 font-medium text-xs">{item.deleted_at}</td>
                <td className="p-4 pr-6">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => restore(item.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider text-[#2F6844] bg-[#E4F0E7] hover:bg-[#D5EADA] transition-colors"
                    >
                      <LuRotateCcw size={13} /> Restore
                    </button>
                    <button
                      onClick={() => setConfirming(item)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider text-[#C53030] bg-[#FCE8E6] hover:bg-[#FAD2CF] transition-colors"
                    >
                      <LuTrash2 size={13} /> Delete Forever
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="p-16 text-center text-gray-400 text-xs font-black uppercase tracking-widest">
                  Trash is empty
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CONFIRM MODAL: SINGLE ITEM */}
      {confirming && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setConfirming(null)}>
          <div className="bg-white rounded-2xl border border-[#E8E3D8] p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 text-[#C53030]">
                <div className="p-2.5 rounded-xl bg-[#FCE8E6]">
                  <LuTriangleAlert size={20} />
                </div>
                <h2 className="text-lg font-black text-[#1E2A2E] uppercase">Delete Forever?</h2>
              </div>
              <button onClick={() => setConfirming(null)} className="text-gray-400 hover:text-[#1E2A2E]">
                <LuX size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-600 font-medium mb-6">
              <span className="font-black text-[#1E2A2E]">{confirming.name}</span> will be permanently removed from the system. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirming(null)}
                className="flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteForever(confirming.id)}
                className="flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-[#C53030] text-white hover:bg-red-700 transition-colors"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM MODAL: EMPTY TRASH */}
      {emptyConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setEmptyConfirm(false)}>
          <div className="bg-white rounded-2xl border border-[#E8E3D8] p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 text-[#C53030]">
                <div className="p-2.5 rounded-xl bg-[#FCE8E6]">
                  <LuTriangleAlert size={20} />
                </div>
                <h2 className="text-lg font-black text-[#1E2A2E] uppercase">Empty Trash?</h2>
              </div>
              <button onClick={() => setEmptyConfirm(false)} className="text-gray-400 hover:text-[#1E2A2E]">
                <LuX size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-600 font-medium mb-6">
              {activeType === 'All' ? 'All' : `All ${activeType}`} items in the trash will be permanently deleted. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setEmptyConfirm(false)}
                className="flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={emptyTrash}
                className="flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-[#C53030] text-white hover:bg-red-700 transition-colors"
              >
                Empty Trash
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Trash;