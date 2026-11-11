import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LuRotateCcw, LuTrash2, LuX, LuTriangleAlert, LuArchive, LuPackage, LuLayers, LuRefreshCw } from 'react-icons/lu';
import axiosInstance from '../../api/axios';

// Soft-deleted rows the API can list, restore and delete for good.
// (Staff and tables are deleted directly, so they never reach the trash.)
const SOURCES = {
  product: {
    list:    '/admin/products/trashed',
    restore: (id) => `/products/${id}/restore`,
    destroy: (id) => `/products/${id}/force-delete`,
  },
  category: {
    list:    '/admin/categories/trashed',
    restore: (id) => `/categories/${id}/restore`,
    destroy: (id) => `/categories/${id}/force-delete`,
  },
};

const TYPES = ['all', 'product', 'category'];

const TYPE_STYLES = {
  product:  'bg-[#E4F0E7] text-[#2F6844] border-[#C8E1CE]',
  category: 'bg-[#E3EDF3] text-[#2E5975] border-[#C2D8E6]',
};

// Solid colors + icon for the stat cards, matched to each type's badge hue
const TYPE_STATS = {
  product:  { card: 'bg-emerald-700', icon: LuPackage },
  category: { card: 'bg-blue-700',    icon: LuLayers },
};

const Trash = () => {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [busyKey, setBusyKey] = useState(null);       // `${type}-${id}` while a request runs
  const [notice, setNotice] = useState(null);         // { type: 'error' | 'success', text }
  const [activeType, setActiveType] = useState('all');
  const [confirming, setConfirming] = useState(null);
  const [emptyConfirm, setEmptyConfirm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const results = await Promise.all(
        Object.entries(SOURCES).map(async ([type, src]) => {
          const res = await axiosInstance.get(src.list);
          return (res.data?.data ?? []).map((row) => ({
            key: `${type}-${row.id}`,
            id: row.id,
            type,
            name: row.name,
            deleted_at: row.deleted_at,
          }));
        })
      );
      setItems(results.flat().sort((a, b) => new Date(b.deleted_at) - new Date(a.deleted_at)));
    } catch (err) {
      console.error('[Trash] load failed', err);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const formatDate = (value) =>
    value
      ? new Date(value).toLocaleString(i18n.language === 'kh' ? 'km-KH' : 'en-US', {
          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
        })
      : '—';

  const filtered = activeType === 'all' ? items : items.filter((i) => i.type === activeType);

  const removeFromList = (item) => setItems((prev) => prev.filter((i) => i.key !== item.key));

  const restore = async (item) => {
    setBusyKey(item.key);
    setNotice(null);
    try {
      await axiosInstance.post(SOURCES[item.type].restore(item.id));
      removeFromList(item);
      setNotice({ type: 'success', text: t('admin.trash.restored', { name: item.name }) });
    } catch (err) {
      console.error('[Trash] restore failed', err);
      setNotice({ type: 'error', text: t('admin.trash.actionFailed') });
    } finally {
      setBusyKey(null);
    }
  };

  // Returns true when the item was deleted
  const destroy = async (item) => {
    try {
      await axiosInstance.delete(SOURCES[item.type].destroy(item.id));
      removeFromList(item);
      return true;
    } catch (err) {
      const count = err.response?.data?.product_count;
      setNotice({
        type: 'error',
        text: count
          ? t('admin.trash.categoryHasProducts', { name: item.name, count })
          : t('admin.trash.actionFailed'),
      });
      return false;
    }
  };

  const deleteForever = async (item) => {
    setBusyKey(item.key);
    setNotice(null);
    setConfirming(null);
    if (await destroy(item)) setNotice({ type: 'success', text: t('admin.trash.deleted', { name: item.name }) });
    setBusyKey(null);
  };

  const emptyTrash = async () => {
    setEmptyConfirm(false);
    setNotice(null);
    setBusyKey('all');
    // Products first: a category can only be deleted once it has no products
    const queue = [...filtered].sort((a, b) => (a.type === b.type ? 0 : a.type === 'product' ? -1 : 1));
    for (const item of queue) {
      await destroy(item);
    }
    setBusyKey(null);
  };

  const typeLabel = (type, count) => t(`admin.trash.type.${type}`, { count });

  const typeCounts = TYPES.slice(1).map((type) => ({
    type,
    count: items.filter((i) => i.type === type).length,
  }));

  return (
    <div className="p-8 min-h-screen space-y-6" style={{ background: 'var(--page-bg)' }}>

      {/* 1. HEADER SECTION */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#1E2A2E] tracking-tight">{t('admin.trash.title')}</h1>
          <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mt-1">
            {t('admin.trash.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 bg-white border border-[#E8E3D8] text-gray-600 px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider hover:text-[#1E2A2E] transition-colors disabled:opacity-50"
          >
            <LuRefreshCw size={14} className={loading ? 'animate-spin' : ''} /> {t('admin.common.refresh')}
          </button>
          {filtered.length > 0 && (
            <button
              onClick={() => setEmptyConfirm(true)}
              disabled={busyKey !== null}
              className="flex items-center gap-2 bg-[#FCE8E6] text-[#C53030] border border-[#FAD2CF] px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-[#F8D7D4] transition-colors disabled:opacity-50"
            >
              <LuTrash2 size={15} /> {t('admin.trash.emptyTrash')}
            </button>
          )}
        </div>
      </div>

      {notice && (
        <div className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-bold border ${
          notice.type === 'error'
            ? 'bg-[#FCE8E6] text-[#C53030] border-[#FAD2CF]'
            : 'bg-[#E4F0E7] text-[#2F6844] border-[#C8E1CE]'
        }`}>
          <span>{notice.text}</span>
          <button onClick={() => setNotice(null)} aria-label={t('common.close')}><LuX size={16} /></button>
        </div>
      )}

      {/* 2. STATS CARDS (solid color, matches Staff/Customer/Report/Backup style) */}
      <div className="flex gap-4 flex-wrap">
        <div className="bg-[#1E2A2E] rounded-xl p-5 flex flex-col justify-between shadow-sm flex-1 min-w-[180px] text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/15">
              <LuArchive size={18} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-white/70">{t('admin.common.total')}</span>
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight">{items.length}</div>
            <p className="text-[11px] font-bold text-white/60 mt-1">{t('admin.trash.itemsInTrash')}</p>
          </div>
        </div>

        {typeCounts.map(({ type, count }) => {
          const { card, icon: TypeIcon } = TYPE_STATS[type];
          return (
            <div key={type} className={`${card} rounded-xl p-5 flex flex-col justify-between shadow-sm flex-1 min-w-[180px] text-white`}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/15">
                  <TypeIcon size={18} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-white/70">{typeLabel(type, 2)}</span>
              </div>
              <div>
                <div className="text-2xl font-black tracking-tight">{count}</div>
                <p className="text-[11px] font-bold text-white/60 mt-1">{t(`admin.trash.deleted_${type}`)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. TYPE FILTER TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider whitespace-nowrap transition-colors ${
              activeType === type
                ? 'bg-[#1E2A2E] text-white shadow-sm'
                : 'bg-white border border-[#E8E3D8] text-gray-500 hover:text-[#1E2A2E] hover:border-gray-300'
            }`}
          >
            {type === 'all' ? t('status.all') : typeLabel(type, 2)}
          </button>
        ))}
      </div>

      {/* 4. TRASH TABLE */}
      <div className="bg-white rounded-xl border border-[#E8E3D8] shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#1E2A2E] text-white text-[11px] font-black uppercase tracking-wider">
            <tr>
              <th className="p-4 pl-6">{t('admin.trash.itemName')}</th>
              <th className="p-4">{t('admin.trash.typeCol')}</th>
              <th className="p-4">{t('admin.trash.deletedAt')}</th>
              <th className="p-4 pr-6 text-right">{t('admin.common.actions')}</th>
            </tr>
          </thead>
          <tbody className="text-sm font-bold text-gray-700">
            {!loading && !loadError && filtered.map((item) => (
              <tr key={item.key} className="border-b border-[#F4F1EA] hover:bg-[#FAF8F5] transition-colors">
                <td className="p-4 pl-6 text-[#1E2A2E]">{item.name}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${TYPE_STYLES[item.type]}`}>
                    {typeLabel(item.type, 1)}
                  </span>
                </td>
                <td className="p-4 text-gray-400 font-medium text-xs">{formatDate(item.deleted_at)}</td>
                <td className="p-4 pr-6">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => restore(item)}
                      disabled={busyKey !== null}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider text-[#2F6844] bg-[#E4F0E7] hover:bg-[#D5EADA] transition-colors disabled:opacity-50"
                    >
                      <LuRotateCcw size={13} className={busyKey === item.key ? 'animate-spin' : ''} /> {t('admin.trash.restore')}
                    </button>
                    <button
                      onClick={() => setConfirming(item)}
                      disabled={busyKey !== null}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider text-[#C53030] bg-[#FCE8E6] hover:bg-[#FAD2CF] transition-colors disabled:opacity-50"
                    >
                      <LuTrash2 size={13} /> {t('admin.trash.deleteForever')}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {(loading || loadError || filtered.length === 0) && (
              <tr>
                <td colSpan={4} className="p-16 text-center text-gray-400 text-xs font-black uppercase tracking-widest">
                  {loading ? t('common.loading') : loadError ? t('admin.trash.loadFailed') : t('admin.trash.empty')}
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
                <h2 className="text-lg font-black text-[#1E2A2E] uppercase">{t('admin.trash.deleteForeverQ')}</h2>
              </div>
              <button onClick={() => setConfirming(null)} className="text-gray-400 hover:text-[#1E2A2E]">
                <LuX size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-600 font-medium mb-6">
              <span className="font-black text-[#1E2A2E]">{confirming.name}</span> {t('admin.trash.deleteForeverDesc')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirming(null)}
                className="flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => deleteForever(confirming)}
                className="flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-[#C53030] text-white hover:bg-red-700 transition-colors"
              >
                {t('admin.trash.deleteForever')}
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
                <h2 className="text-lg font-black text-[#1E2A2E] uppercase">{t('admin.trash.emptyTrashQ')}</h2>
              </div>
              <button onClick={() => setEmptyConfirm(false)} className="text-gray-400 hover:text-[#1E2A2E]">
                <LuX size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-600 font-medium mb-6">
              {t('admin.trash.emptyTrashDesc', { count: filtered.length })}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setEmptyConfirm(false)}
                className="flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={emptyTrash}
                className="flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-[#C53030] text-white hover:bg-red-700 transition-colors"
              >
                {t('admin.trash.emptyTrash')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Trash;
