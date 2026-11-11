
import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { LuPlus, LuUsers, LuPencil, LuX, LuTrash2, LuEye } from 'react-icons/lu';
import useTable from '../../hooks/useTable';
import { useTranslation } from 'react-i18next';

const STATUS_STYLES = {
  available: { label: 'status.available', dot: 'bg-green-500', badge: 'bg-green-50 text-green-700 border-green-100', ring: 'border-l-green-500' },
  occupied:  { label: 'status.occupied',  dot: 'bg-red-500',   badge: 'bg-red-50 text-red-700 border-red-100',       ring: 'border-l-red-500'   },
  reserved:  { label: 'status.reserved',  dot: 'bg-orange-500',badge: 'bg-orange-50 text-orange-600 border-orange-100', ring: 'border-l-orange-500' },
};

const EMPTY_FORM = { name: '', capacity: '', status: 'available' };

// Reusable Modal ─
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
    <div className="bg-white rounded-sm p-8 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-black text-[#1a2e35] uppercase tracking-wide">{title}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-[#1a2e35] cursor-pointer"><LuX size={20} /></button>
      </div>
      {children}
    </div>
  </div>
);

//  Table Form (Add / Edit) 
const TableForm = ({ initial = EMPTY_FORM, onSubmit, onClose, submitting }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit({ name: form.name, capacity: Number(form.capacity), status: form.status });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="text-xs font-black uppercase tracking-widest text-gray-500 block mb-1">{t('admin.tables.name')}</label>
        <input
          required
          value={form.name}
          onChange={e => set('name', e.target.value)}
          placeholder={t('admin.tables.namePlaceholder')}
          className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#1c2e35]"
        />
      </div>
      <div>
        <label className="text-xs font-black uppercase tracking-widest text-gray-500 block mb-1">{t('admin.tables.capacitySeats')}</label>
        <input
          required type="number" min={1}
          value={form.capacity}
          onChange={e => set('capacity', e.target.value)}
          placeholder={t('admin.tables.capacityPlaceholder')}
          className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#1c2e35]"
        />
      </div>
      <div>
        <label className="text-xs font-black uppercase tracking-widest text-gray-500 block mb-1">{t('admin.common.status')}</label>
        <select
          value={form.status}
          onChange={e => set('status', e.target.value)}
          className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#1c2e35]"
        >
          <option value="available">{t('status.available')}</option>
          <option value="occupied">{t('status.occupied')}</option>
          <option value="reserved">{t('status.reserved')}</option>
        </select>
      </div>
      <div className="flex gap-3 mt-2">
        <button type="button" onClick={onClose}
          className="flex-1 border border-gray-200 text-gray-500 py-2 rounded-sm text-xs font-black uppercase tracking-widest hover:bg-gray-50 cursor-pointer">
          {t('common.cancel')}
        </button>
        <button type="submit" disabled={submitting}
          className="flex-1 bg-[#1c2e35] text-white py-2 rounded-sm text-xs font-black uppercase tracking-widest hover:bg-[#2a3f32] disabled:opacity-50 cursor-pointer">
          {submitting ? t('admin.common.saving') : t('common.save')}
        </button>
      </div>
    </form>
  );
};

// Main Component 
const ManageTables = () => {
  const { t } = useTranslation();
  const { searchTerm = '' } = useOutletContext() || {};

  const { tables, loading, error, addTable, editTable, cycleStatus, removeTable } = useTable();

  // modal state
  const [modal, setModal]       = useState(null); // null | 'add' | 'edit' | 'view' | 'delete'
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const openModal = (type, table = null) => { setModal(type); setSelected(table); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleAdd = async (payload) => {
    setSubmitting(true);
    try { await addTable(payload); }
    finally { setSubmitting(false); }
  };

  const handleEdit = async (payload) => {
    setSubmitting(true);
    try { await editTable(selected.id, payload); }
    finally { setSubmitting(false); }
  };

  const handleRemove = async () => {
    setSubmitting(true);
    try { await removeTable(selected.id); closeModal(); }
    finally { setSubmitting(false); }
  };

  const counts = tables.reduce((acc, t) => ({ ...acc, [t.status]: (acc[t.status] || 0) + 1 }), {});

  const filteredTables = tables.filter(t => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      t.name?.toLowerCase().includes(term) ||
      t.status?.toLowerCase().includes(term) ||
      String(t.capacity).includes(term)
    );
  });

  if (loading) return <div className="p-8 text-center text-gray-400 font-bold">{t('common.loading')}</div>;
  if (error)   return <div className="p-8 text-center text-red-400 font-bold">{t('admin.tables.loadFailed')}</div>;

  return (
    <div className="p-8 min-h-screen" style={{ background: 'var(--page-bg)' }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <p className="text-sm text-gray-500 font-black uppercase tracking-widest">
          {t('admin.tables.subtitle')}
        </p>
        <button
          onClick={() => openModal('add')}
          className="flex items-center gap-2 bg-[#1c2e35] text-white px-5 py-3 rounded-sm text-xs font-black uppercase tracking-widest hover:bg-[#2a3f32] transition-colors cursor-pointer"
        >
          <LuPlus size={16} /> {t('admin.tables.add')}
        </button>
      </div>

      {/* ── Status Legend ── */}
      <div className="flex items-center gap-6 mb-6">
        {Object.entries(STATUS_STYLES).map(([key, s]) => (
          <div key={key} className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              {t(s.label)} <span className="text-[#1a2e35]">({counts[key] || 0})</span>
            </span>
          </div>
        ))}
      </div>

      {/* ── Grid ── */}
      {filteredTables.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-sm bg-white">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
            {searchTerm ? t('admin.tables.noMatch', { term: searchTerm }) : t('admin.tables.none')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredTables.map((table) => {
            const s = STATUS_STYLES[table.status] || STATUS_STYLES.available;
            return (
              <div key={table.id}
                className={`bg-white rounded-sm border border-gray-100 border-l-4 ${s.ring} shadow-sm p-5 flex flex-col justify-between gap-4`}>

                <div>
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-black text-[#1a2e35]">{table.name}</h3>
                    {/* Action icons */}
                    <div className="flex items-center gap-2">
                      <button onClick={() => openModal('view', table)} className="text-gray-300 hover:text-blue-500 transition-colors cursor-pointer">
                        <LuEye size={14} />
                      </button>
                      <button onClick={() => openModal('edit', table)} className="text-gray-300 hover:text-[#1a2e35] transition-colors cursor-pointer">
                        <LuPencil size={14} />
                      </button>
                      <button onClick={() => openModal('delete', table)} className="text-gray-300 hover:text-red-500 transition-colors cursor-pointer">
                        <LuTrash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-500 mt-2">
                    <LuUsers size={15} />
                    <span className="text-sm font-bold">{t('admin.tables.seats', { count: Number(table.capacity) })}</span>
                  </div>

                  <div className="mt-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${s.badge}`}>
                      {t(s.label)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => cycleStatus(table.id)}
                  className="mt-1 text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-[#1a2e35] border-t border-gray-50 pt-3 text-left transition-colors cursor-pointer w-full"
                >
                  {t('admin.tables.changeStatus')} →
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── ADD Modal ── */}
      {modal === 'add' && (
        <Modal title={t('admin.tables.add')} onClose={closeModal}>
          <TableForm onSubmit={handleAdd} onClose={closeModal} submitting={submitting} />
        </Modal>
      )}

      {/* ── EDIT Modal ── */}
      {modal === 'edit' && selected && (
        <Modal title={t('admin.tables.edit')} onClose={closeModal}>
          <TableForm
            initial={{ name: selected.name, capacity: selected.capacity, status: selected.status }}
            onSubmit={handleEdit}
            onClose={closeModal}
            submitting={submitting}
          />
        </Modal>
      )}

      {/* ── VIEW Modal ── */}
      {modal === 'view' && selected && (
        <Modal title={t('admin.tables.details')} onClose={closeModal}>
          <div className="flex flex-col gap-4">
            {[
              { label: t('admin.tables.name'),     value: selected.name },
              { label: t('admin.tables.capacity'), value: t('admin.tables.seats', { count: Number(selected.capacity) }) },
              { label: t('admin.common.status'),   value: t(`status.${selected.status}`, selected.status) },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between border-b border-gray-50 pb-3">
                <span className="text-xs font-black uppercase tracking-widest text-gray-400">{label}</span>
                <span className="text-sm font-bold text-[#1a2e35] capitalize">{value}</span>
              </div>
            ))}
            <button onClick={closeModal}
              className="mt-2 w-full bg-[#1c2e35] text-white py-2 rounded-sm text-xs font-black uppercase tracking-widest hover:bg-[#2a3f32] cursor-pointer">
              {t('common.close')}
            </button>
          </div>
        </Modal>
      )}

      {/* ── DELETE Confirm Modal ── */}
      {modal === 'delete' && selected && (
        <Modal title={t('admin.tables.remove')} onClose={closeModal}>
          <p className="text-sm text-gray-500 mb-6">
            {t('admin.tables.removeQ1')} <span className="font-black text-[#1a2e35]">{selected.name}</span>{t('admin.tables.removeQ2')}
            <br /><span className="text-xs text-gray-400 mt-1 block">{t('admin.tables.removeNote')}</span>
          </p>
          <div className="flex gap-3">
            <button onClick={closeModal}
              className="flex-1 border border-gray-200 text-gray-500 py-2 rounded-sm text-xs font-black uppercase tracking-widest hover:bg-gray-50 cursor-pointer">
              {t('common.cancel')}
            </button>
            <button onClick={handleRemove} disabled={submitting}
              className="flex-1 bg-red-500 text-white py-2 rounded-sm text-xs font-black uppercase tracking-widest hover:bg-red-600 disabled:opacity-50 cursor-pointer">
              {submitting ? t('admin.tables.removing') : t('admin.tables.removeBtn')}
            </button>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default ManageTables;