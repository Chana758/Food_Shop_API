import React, { useState } from 'react';
import { LuPlus, LuUsers, LuPencil, LuX } from 'react-icons/lu';

// Maps directly to the `tables.status` enum: available, occupied, reserved
const STATUS_STYLES = {
  available: { label: 'Available', dot: 'bg-green-500', badge: 'bg-green-50 text-green-700 border-green-100', ring: 'border-l-green-500' },
  occupied: { label: 'Occupied', dot: 'bg-red-500', badge: 'bg-red-50 text-red-700 border-red-100', ring: 'border-l-red-500' },
  reserved: { label: 'Reserved', dot: 'bg-orange-500', badge: 'bg-orange-50 text-orange-600 border-orange-100', ring: 'border-l-orange-500' },
};

// Dummy data shaped like the `tables` table (id, name, capacity, status)
const INITIAL_TABLES = [
  { id: 1, name: 'Table 01', capacity: 2, status: 'available' },
  { id: 2, name: 'Table 02', capacity: 4, status: 'occupied' },
  { id: 3, name: 'Table 03', capacity: 4, status: 'available' },
  { id: 4, name: 'Table 04', capacity: 6, status: 'reserved' },
  { id: 5, name: 'Table 05', capacity: 2, status: 'available' },
  { id: 6, name: 'Table 06', capacity: 4, status: 'occupied' },
  { id: 7, name: 'Table 07', capacity: 8, status: 'available' },
  { id: 8, name: 'Table 08', capacity: 4, status: 'reserved' },
];

const ManageTables = () => {
  const [tables, setTables] = useState(INITIAL_TABLES);
  const [editingId, setEditingId] = useState(null);

  // Click-through status cycle: available -> occupied -> reserved -> available
  const cycleStatus = (id) => {
    const order = ['available', 'occupied', 'reserved'];
    setTables((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: order[(order.indexOf(t.status) + 1) % order.length] } : t
      )
    );
  };

  const counts = tables.reduce((acc, t) => ({ ...acc, [t.status]: (acc[t.status] || 0) + 1 }), {});

  return (
    <div className="p-8 bg-[#FDFDFD] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#1a2e35] uppercase tracking-tight">Table Management</h1>
          <p className="text-xs text-gray-400 font-black uppercase tracking-widest mt-1">
            Manage dining tables and seating status
          </p>
        </div>
        <button className="flex items-center gap-2 bg-[#1c2e35] text-white px-5 py-3 rounded-sm text-xs font-black uppercase tracking-widest hover:bg-[#2a3f32] transition-colors">
          <LuPlus size={16} /> Add Table
        </button>
      </div>

      {/* Status legend / counts */}
      <div className="flex items-center gap-6 mb-6">
        {Object.entries(STATUS_STYLES).map(([key, s]) => (
          <div key={key} className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              {s.label} <span className="text-[#1a2e35]">({counts[key] || 0})</span>
            </span>
          </div>
        ))}
      </div>

      {/* Table grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {tables.map((table) => {
          const s = STATUS_STYLES[table.status];
          return (
            <div
              key={table.id}
              className={`bg-white rounded-sm border border-gray-100 border-l-4 ${s.ring} shadow-sm p-5 flex flex-col gap-4`}
            >
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-black text-[#1a2e35]">{table.name}</h3>
                <button onClick={() => setEditingId(table.id)} className="text-gray-300 hover:text-[#1a2e35] transition-colors">
                  <LuPencil size={15} />
                </button>
              </div>

              <div className="flex items-center gap-2 text-gray-500">
                <LuUsers size={15} />
                <span className="text-sm font-bold">{table.capacity} Seats</span>
              </div>

              <span className={`self-start px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${s.badge}`}>
                {s.label}
              </span>

              <button
                onClick={() => cycleStatus(table.id)}
                className="mt-1 text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-[#1a2e35] border-t border-gray-50 pt-3 text-left transition-colors"
              >
                Change Status →
              </button>
            </div>
          );
        })}
      </div>

      {/* Simple edit dialog placeholder */}
      {editingId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setEditingId(null)}>
          <div className="bg-white rounded-sm p-8 w-96" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-[#1a2e35] uppercase">Edit Table</h2>
              <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-[#1a2e35]">
                <LuX size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-400 font-medium">
              Connect this dialog to your update-table endpoint to edit name, capacity, or status.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTables;