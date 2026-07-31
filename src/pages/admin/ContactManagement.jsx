import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  LuMail, LuMailOpen, LuCircleCheckBig, LuTrash2, LuRefreshCw,
  LuUser, LuPhone, LuFilter, LuX, LuSend, LuClock,
  LuInbox, LuCheck, LuClock3, LuMessageSquare
} from 'react-icons/lu';
import { useAdminContact } from '../../hooks/useContact';

const STATUS_STYLES = {
  unread:  'bg-orange-100 text-orange-800 border-orange-300 font-bold',
  read:    'bg-sky-100 text-sky-800 border-sky-300 font-bold',
  replied: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
};

const FILTERS = ['all', 'unread', 'read', 'replied'];

const ContactManagement = () => {
  const { searchTerm: search } = useOutletContext() ?? { searchTerm: '' };

  const [filter, setFilter]       = useState('all');
  const [selected, setSelectedId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending]     = useState(false);
  const [actionMsg, setActionMsg] = useState(null);

  const {
    contacts, stats, loading, error,
    refetch, openContact, replyContact, deleteContact,
  } = useAdminContact();

  const filtered = contacts.filter(c => {
    const matchStatus = filter === 'all' || c.status === filter;
    const matchSearch = !search ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.subject?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const showMsg = (type, text) => {
    setActionMsg({ type, text });
    setTimeout(() => setActionMsg(null), 3000);
  };

  const handleOpen = async (id) => {
    try {
      const contact = await openContact(id);
      setSelectedId(contact);
      setReplyText(contact?.reply_message || '');
    } catch {
      showMsg('error', 'Failed to load message.');
    }
  };

  const handleReply = async () => {
    if (!selected || !replyText.trim()) return;
    setSending(true);
    try {
      await replyContact(selected.id, { reply_message: replyText.trim() });
      showMsg('success', 'Reply sent!');
    } catch (err) {
      showMsg('error', err?.response?.data?.message || 'Failed to send reply.');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteContact(id);
      if (selected?.id === id) setSelectedId(null);
      showMsg('success', 'Message deleted!');
    } catch {
      showMsg('error', 'Failed to delete message.');
    }
  };

  return (
    <div className="mt-5 space-y-6 m-6">

      {/* Toast Notification */}
      {actionMsg && (
        <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-2 px-5 py-3 rounded-xl shadow-xl text-xs font-bold
          ${actionMsg.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-500 text-white'}`}>
          {actionMsg.type === 'success' ? <LuCircleCheckBig size={16}/> : <LuX size={16}/>}
          {actionMsg.text}
        </div>
      )}

      {/* ── STATS CARDS ── */}
      {stats && (
        <div className="bg-white rounded-2xl border border-slate-300 p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">CONTACT MESSAGES REPORT</h2>
              <p className="text-xs font-semibold text-slate-600">Daily, monthly, and yearly inquiries metrics with actionable data</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-slate-100 rounded-xl border border-slate-300 p-4 relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="p-2 bg-blue-100 text-blue-700 rounded-lg"><LuInbox size={16} /></span>
                  <span className="text-[11px] font-black uppercase text-slate-600 tracking-wider">Total</span>
                </div>
                <p className="text-xs text-slate-600 font-bold">Total Messages</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{stats.total ?? 0}</p>
              </div>
              <span className="text-[11px] text-blue-700 font-bold mt-3 inline-block">All customer inquiries</span>
            </div>

            <div className="bg-slate-100 rounded-xl border border-slate-300 p-4 relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="p-2 bg-orange-100 text-orange-700 rounded-lg"><LuClock3 size={16} /></span>
                  <span className="text-[11px] font-black uppercase text-slate-600 tracking-wider">Pending</span>
                </div>
                <p className="text-xs text-slate-600 font-bold">Unread</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{stats.unread ?? 0}</p>
              </div>
              <span className="text-[11px] text-orange-700 font-bold mt-3 inline-block">Requires attention</span>
            </div>

            <div className="bg-slate-100 rounded-xl border border-slate-300 p-4 relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="p-2 bg-sky-100 text-sky-700 rounded-lg"><LuMailOpen size={16} /></span>
                  <span className="text-[11px] font-black uppercase text-slate-600 tracking-wider">Viewed</span>
                </div>
                <p className="text-xs text-slate-600 font-bold">Read</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{stats.read ?? 0}</p>
              </div>
              <span className="text-[11px] text-sky-700 font-bold mt-3 inline-block">Opened messages</span>
            </div>

            <div className="bg-slate-100 rounded-xl border border-slate-300 p-4 relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="p-2 bg-emerald-100 text-emerald-700 rounded-lg"><LuCheck size={16} /></span>
                  <span className="text-[11px] font-black uppercase text-slate-600 tracking-wider">Success</span>
                </div>
                <p className="text-xs text-slate-600 font-bold">Replied</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{stats.replied ?? 0}</p>
              </div>
              <span className="text-[11px] text-emerald-700 font-bold mt-3 inline-block">Responded successfully</span>
            </div>

          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6 items-start">

        {/* ── LEFT: List & Filters ── */}
        <div className="col-span-12 lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-300 p-5 flex flex-wrap gap-3 items-center shadow-xs">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mr-2">
              <LuFilter size={15} /> Filter:
            </span>
            <div className="flex gap-2 flex-wrap flex-1">
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${filter === f ? 'bg-slate-900 text-white border-slate-900 shadow-xs' : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'}`}
                >
                  {f}
                </button>
              ))}
            </div>
            <button onClick={refetch} className="p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer text-slate-800 font-bold" title="Refresh">
              <LuRefreshCw size={15} />
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-300 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-300 flex justify-between items-center bg-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">All Messages</h3>
              </div>
              <span className="text-xs bg-slate-300 text-slate-900 px-3 py-1 rounded-full font-black">
                {filtered.length} records
              </span>
            </div>

            {loading ? (
              <div className="p-16 text-center text-slate-600 font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2">
                <LuRefreshCw className="animate-spin" size={16} /> Loading messages...
              </div>
            ) : error ? (
              <div className="p-16 text-center text-rose-600 font-bold text-sm">{error}</div>
            ) : filtered.length === 0 ? (
              <div className="p-16 text-center space-y-2">
                <LuMail size={40} className="text-slate-400 mx-auto" />
                <p className="text-slate-600 font-black text-xs uppercase tracking-wider">No messages found</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 max-h-[640px] overflow-y-auto">
                {filtered.map(c => (
                  <div
                    key={c.id}
                    onClick={() => handleOpen(c.id)}
                    className={`flex items-start gap-3.5 p-4 cursor-pointer transition-colors hover:bg-slate-50
                      ${selected?.id === c.id ? 'bg-blue-50/70 border-l-4 border-l-blue-700' : ''}`}
                  >
                    <div className="mt-1 flex-shrink-0">
                      {c.status === 'unread'
                        ? <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center border border-orange-300 shadow-xs"><LuMail size={15} /></div>
                        : <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center border border-slate-300 shadow-xs"><LuMailOpen size={15} /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className={`text-xs truncate ${c.status === 'unread' ? 'font-black text-slate-900' : 'font-bold text-slate-800'}`}>
                          {c.name}
                        </p>
                        <span className={`px-3 py-0.5 rounded-full text-[11px] font-black uppercase border ${STATUS_STYLES[c.status] ?? STATUS_STYLES.unread}`}>
                          {c.status}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 truncate mb-1">{c.subject || '(No subject)'}</p>
                      <p className="text-xs font-semibold text-slate-600 truncate">{c.message}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                      className="p-2 rounded-lg text-slate-600 hover:text-rose-700 hover:bg-rose-100 border border-transparent hover:border-rose-300 transition-colors flex-shrink-0 cursor-pointer"
                      title="Delete"
                    >
                      <LuTrash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Detail + Reply ── */}
        <div className="col-span-12 lg:col-span-5">
          <div className="bg-white rounded-2xl border border-slate-300 shadow-xs p-6 sticky top-6">
            {!selected ? (
              <div className="py-24 text-center space-y-3">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 border border-slate-300">
                  <LuMessageSquare size={28} />
                </div>
                <p className="text-slate-600 font-bold text-xs uppercase tracking-wider">
                  Select a message to view details
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-start justify-between border-b border-slate-300 pb-4">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-wider text-blue-700">Message ID #{selected.id}</p>
                    <h2 className="text-base font-black text-slate-900 mt-0.5">{selected.subject || '(No subject)'}</h2>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase border whitespace-nowrap ${STATUS_STYLES[selected.status] ?? STATUS_STYLES.unread}`}>
                    {selected.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs bg-slate-100 p-4 rounded-xl border border-slate-300">
                  <div className="flex items-center gap-2 text-slate-900">
                    <LuUser size={15} className="text-slate-600" />
                    <span className="font-black">{selected.name}</span>
                    <span className="text-slate-400">·</span>
                    <span className="font-semibold text-slate-700">{selected.email}</span>
                  </div>
                  {selected.phone && (
                    <div className="flex items-center gap-2 text-slate-900">
                      <LuPhone size={15} className="text-slate-600" />
                      <span className="font-bold">{selected.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-600 pt-2 border-t border-slate-300 text-xs font-semibold">
                    <LuClock size={14} />
                    <span>{new Date(selected.created_at).toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-600 mb-2">Message Content</p>
                  <div className="bg-slate-100 border border-slate-300 rounded-xl p-4 text-xs font-semibold text-slate-900 leading-relaxed">
                    {selected.message}
                  </div>
                </div>

                {selected.reply_message && (
                  <div className="bg-emerald-100 border border-emerald-300 rounded-xl p-4 text-xs font-semibold text-emerald-950 leading-relaxed shadow-xs">
                    <p className="text-[11px] font-black uppercase tracking-wider text-emerald-800 mb-1.5">
                      Your Reply {selected.repliedBy?.name ? `· ${selected.repliedBy.name}` : ''}
                    </p>
                    {selected.reply_message}
                  </div>
                )}

                <div className="space-y-2 pt-2 border-t border-slate-300">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                    {selected.status === 'replied' ? 'Update Reply' : 'Write a Reply'}
                  </label>
                  <textarea
                    rows={4}
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Type your response here..."
                    className="w-full border border-slate-300 rounded-xl p-3 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-all bg-white"
                  />
                  <button
                    onClick={handleReply}
                    disabled={sending || !replyText.trim()}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-blue-700 text-white text-xs font-black uppercase rounded-xl hover:bg-blue-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                  >
                    <LuSend size={15} /> {sending ? 'Sending...' : 'Send Reply'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactManagement;