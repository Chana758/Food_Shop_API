import React, { useState } from 'react';
import { LuRotateCcw, LuTrash2, LuX, LuTriangleAlert } from 'react-icons/lu';

// Dummy data representing soft-deleted rows (Laravel SoftDeletes) across resources
const INITIAL_TRASH = [
  { id: 1, name: 'Beef Lok Lak', type: 'Product', deleted_at: '2026-06-17 09:12' },
  { id: 2, name: 'Seasonal Drinks', type: 'Category', deleted_at: '2026-06-17 14:30' },
  { id: 3, name: 'Table 09', type: 'Table', deleted_at: '2026-06-18 08:05' },
  { id: 4, name: 'Sreymom Kea', type: 'Staff', deleted_at: '2026-06-18 16:47' },
  { id: 5, name: 'Mango Smoothie', type: 'Product', deleted_at: '2026-06-19 10:02' },
];

const TYPES = ['All', 'Product', 'Category', 'Staff', 'Table'];

const TYPE_STYLES = {
  Product: 'bg-green-50 text-green-700 border-green-100',
  Category: 'bg-blue-50 text-blue-600 border-blue-100',
  Table: 'bg-orange-50 text-orange-600 border-orange-100',
  Staff: 'bg-purple-50 text-purple-600 border-purple-100',
};

const Trash = () => {
  const [items, setItems] = useState(INITIAL_TRASH);
  const [activeType, setActiveType] = useState('All');
  const [confirming, setConfirming] = useState(null); // item pending permanent delete
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
    <div className="p-8 bg-[#FDFDFD] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-[#1a2e35] uppercase tracking-tight">Trash</h1>
          <p className="text-xs text-gray-400 font-black uppercase tracking-widest mt-1">
            Restore or permanently delete removed records
          </p>
        </div>
        {items.length > 0 && (
          <button
            onClick={() => setEmptyConfirm(true)}
            className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-100 px-5 py-3 rounded-sm text-xs font-black uppercase tracking-widest hover:bg-red-100 transition-colors"
          >
            <LuTrash2 size={16} /> Empty Trash
          </button>
        )}
      </div>

      {/* Type filter tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setActiveType(t)}
            className={`px-4 py-2 rounded-sm text-xs font-black uppercase tracking-widest whitespace-nowrap transition-colors ${
              activeType === t
                ? 'bg-[#1c2e35] text-[#ffcc33]'
                : 'bg-white border border-gray-100 text-gray-400 hover:text-[#1a2e35]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Trash table */}
      <div className="bg-white rounded-sm border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#1c2e35] text-white text-[11px] font-black uppercase tracking-wider">
            <tr>
              <th className="p-4">Item</th>
              <th className="p-4">Type</th>
              <th className="p-4">Deleted At</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm font-bold text-gray-600">
            {filtered.map((item) => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="p-4 text-[#1a2e35]">{item.name}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${TYPE_STYLES[item.type]}`}>
                    {item.type}
                  </span>
                </td>
                <td className="p-4 text-gray-400 font-medium text-xs">{item.deleted_at}</td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-4">
                    <button
                      onClick={() => restore(item.id)}
                      className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-green-600 hover:text-green-700 transition-colors"
                    >
                      <LuRotateCcw size={13} /> Restore
                    </button>
                    <button
                      onClick={() => setConfirming(item)}
                      className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <LuTrash2 size={13} /> Delete Forever
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="p-12 text-center text-gray-300 text-xs font-black uppercase tracking-widest">
                  Trash is empty
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Confirm: permanent delete of a single item */}
      {confirming && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setConfirming(null)}>
          <div className="bg-white rounded-sm p-8 w-96" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-red-500">
                <LuTriangleAlert size={20} />
                <h2 className="text-lg font-black text-[#1a2e35] uppercase">Delete Forever?</h2>
              </div>
              <button onClick={() => setConfirming(null)} className="text-gray-400 hover:text-[#1a2e35]">
                <LuX size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-500 font-medium mb-6">
              <span className="font-black text-[#1a2e35]">{confirming.name}</span> will be permanently removed.
              This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirming(null)}
                className="flex-1 py-3 rounded-sm text-xs font-black uppercase tracking-widest bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteForever(confirming.id)}
                className="flex-1 py-3 rounded-sm text-xs font-black uppercase tracking-widest bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm: empty trash (bulk) */}
      {emptyConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setEmptyConfirm(false)}>
          <div className="bg-white rounded-sm p-8 w-96" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-red-500">
                <LuTriangleAlert size={20} />
                <h2 className="text-lg font-black text-[#1a2e35] uppercase">Empty Trash?</h2>
              </div>
              <button onClick={() => setEmptyConfirm(false)} className="text-gray-400 hover:text-[#1a2e35]">
                <LuX size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-500 font-medium mb-6">
              {activeType === 'All' ? 'All' : `All ${activeType}`} items in trash will be permanently deleted.
              This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setEmptyConfirm(false)}
                className="flex-1 py-3 rounded-sm text-xs font-black uppercase tracking-widest bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={emptyTrash}
                className="flex-1 py-3 rounded-sm text-xs font-black uppercase tracking-widest bg-red-600 text-white hover:bg-red-700 transition-colors"
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