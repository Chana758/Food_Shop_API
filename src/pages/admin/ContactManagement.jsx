import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  LuMail, LuMailOpen, LuCircleCheckBig, LuTrash2, LuRefreshCw,
  LuUser, LuPhone, LuFilter, LuX, LuSend, LuClock,
  LuInbox, LuCheck, LuClock3, LuMessageSquare
} from 'react-icons/lu';
import { useAdminContact } from '../../hooks/useContact';

/*
  Palette matched to the Khmer-Fresh admin (see Dashboard):
  Ink #1E2A2E · Gold #D99A3D · Herb #3F7D58 · Sky #3B6E91 · Plum #7A4F6D · Chili #B5453B
  This page's "brand color" is Plum, the same tone the dashboard uses for
  message/contact alerts — the selected-message highlight and the reply
  button both use it so contacts feel like one continuous section, not a
  generic slate/blue admin screen bolted onto the rest of the app.
*/
const FONT_SERIF = { fontFamily: "'Fraunces', Georgia, serif" };
const CARD = "bg-white rounded-2xl border border-[#E8E3D8] shadow-[0_1px_3px_rgba(30,42,46,0.05)]";

const STATUS_STYLES = {
  unread:  'bg-[#FBEDD9] text-[#8A5A12] border-[#F1D9AE]',
  read:    'bg-[#E3EDF3] text-[#2E5975] border-[#C9DCE8]',
  replied: 'bg-[#E4F0E7] text-[#2F6844] border-[#C7E0CD]',
};

// Bold solid fills for the four report cards — same treatment as the
// dashboard's stat cards (icon chip top-left, badge pill top-right, big
// white number). Unread reads as urgent (chili) since it needs action;
// Total stays neutral ink; Read/Replied use the calm sky/herb tones.
const STAT_FILL = {
  ink:   { bg: 'bg-[#1E2A2E]', chip: 'bg-white/10 text-[#E8C97A]', badge: 'bg-white/10 text-white/80', sub: 'text-[#B9C2C4]' },
  chili: { bg: 'bg-[#B5453B]', chip: 'bg-white/20 text-white',     badge: 'bg-white/20 text-white',     sub: 'text-[#F3D4D0]' },
  sky:   { bg: 'bg-[#3B6E91]', chip: 'bg-white/20 text-white',     badge: 'bg-white/20 text-white',     sub: 'text-[#CFE1EC]' },
  herb:  { bg: 'bg-[#3F7D58]', chip: 'bg-white/20 text-white',     badge: 'bg-white/20 text-white',     sub: 'text-[#CFE7D7]' },
};

const FILTERS = ['all', 'unread', 'read', 'replied'];

const StatCard = ({ icon, fill, badge, title, value, sub }) => {
  const f = STAT_FILL[fill];
  return (
    <div className={`${f.bg} rounded-xl p-4 flex flex-col justify-between shadow-[0_4px_14px_rgba(30,42,46,0.12)]`}>
      <div className="flex items-start justify-between mb-2">
        <span className={`${f.chip} p-2 rounded-lg`}>{icon}</span>
        <span className={`${f.badge} text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full`}>{badge}</span>
      </div>
      <p className="text-white/80 text-xs font-bold">{title}</p>
      <p className="text-3xl font-black text-white mt-1">{value}</p>
      {sub && <span className={`${f.sub} text-[11px] font-bold mt-3 inline-block`}>{sub}</span>}
    </div>
  );
};

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
          ${actionMsg.type === 'success' ? 'bg-[#3F7D58] text-white' : 'bg-[#B5453B] text-white'}`}>
          {actionMsg.type === 'success' ? <LuCircleCheckBig size={16}/> : <LuX size={16}/>}
          {actionMsg.text}
        </div>
      )}

      {/* ── STATS CARDS ── */}
      {stats && (
        <div className={`${CARD} p-5 space-y-4`}>
          <div className="flex justify-between items-center">
            <div>
              <h2 style={FONT_SERIF} className="text-[16px] font-semibold text-[#1E2A2E]">Contact messages report</h2>
              <p className="text-xs font-semibold text-[#8B9296]">Daily, monthly, and yearly inquiries metrics with actionable data</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<LuInbox size={16} />}
              fill="ink"
              badge="Total"
              title="Total Messages"
              value={stats.total ?? 0}
              sub="All customer inquiries"
            />
            <StatCard
              icon={<LuClock3 size={16} />}
              fill="chili"
              badge="Pending"
              title="Unread"
              value={stats.unread ?? 0}
              sub="Requires attention"
            />
            <StatCard
              icon={<LuMailOpen size={16} />}
              fill="sky"
              badge="Viewed"
              title="Read"
              value={stats.read ?? 0}
              sub="Opened messages"
            />
            <StatCard
              icon={<LuCheck size={16} />}
              fill="herb"
              badge="Success"
              title="Replied"
              value={stats.replied ?? 0}
              sub="Responded successfully"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6 items-start">

        {/* ── LEFT: List & Filters ── */}
        <div className="col-span-12 lg:col-span-7 space-y-4">
          <div className={`${CARD} p-5 flex flex-wrap gap-3 items-center`}>
            <span className="text-xs font-black uppercase tracking-wider text-[#5B6B6F] flex items-center gap-1.5 mr-2">
              <LuFilter size={15} /> Filter:
            </span>
            <div className="flex gap-2 flex-wrap flex-1">
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${filter === f ? 'bg-[#1E2A2E] text-white border-[#1E2A2E] shadow-xs' : 'bg-[#FBF9F5] text-[#5B6B6F] border-[#E8E3D8] hover:bg-[#F3F0E9]'}`}
                >
                  {f}
                </button>
              ))}
            </div>
            <button onClick={refetch} className="p-2.5 bg-[#FBF9F5] hover:bg-[#F3F0E9] border border-[#E8E3D8] rounded-lg transition-colors cursor-pointer text-[#5B6B6F] font-bold" title="Refresh">
              <LuRefreshCw size={15} />
            </button>
          </div>

          <div className={`${CARD} overflow-hidden`}>
            <div className="px-6 py-4 border-b border-[#EFEBE2] flex justify-between items-center bg-[#FBF9F5]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3F7D58]"></span>
                <h3 className="text-xs font-black uppercase tracking-wider text-[#1E2A2E]">All Messages</h3>
              </div>
              <span className="text-xs bg-[#EFEBE2] text-[#1E2A2E] px-3 py-1 rounded-full font-black">
                {filtered.length} records
              </span>
            </div>

            {loading ? (
              <div className="p-16 text-center text-[#8B9296] font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2">
                <LuRefreshCw className="animate-spin" size={16} /> Loading messages...
              </div>
            ) : error ? (
              <div className="p-16 text-center text-[#B5453B] font-bold text-sm">{error}</div>
            ) : filtered.length === 0 ? (
              <div className="p-16 text-center space-y-2">
                <LuMail size={40} className="text-[#E3DFD3] mx-auto" />
                <p className="text-[#9AA0A0] font-black text-xs uppercase tracking-wider">No messages found</p>
              </div>
            ) : (
              <div className="divide-y divide-[#EFEBE2] max-h-[640px] overflow-y-auto">
                {filtered.map(c => (
                  <div
                    key={c.id}
                    onClick={() => handleOpen(c.id)}
                    className={`flex items-start gap-3.5 p-4 cursor-pointer transition-colors hover:bg-[#FBF9F5]
                      ${selected?.id === c.id ? 'bg-[#F4EEF2] border-l-4 border-l-[#7A4F6D]' : ''}`}
                  >
                    <div className="mt-1 flex-shrink-0">
                      {c.status === 'unread' && (
                        <div className="w-8 h-8 rounded-lg bg-[#FBEDD9] text-[#8A5A12] flex items-center justify-center border border-[#F1D9AE] shadow-xs"><LuMail size={15} /></div>
                      )}
                      {c.status === 'read' && (
                        <div className="w-8 h-8 rounded-lg bg-[#E3EDF3] text-[#2E5975] flex items-center justify-center border border-[#C9DCE8] shadow-xs"><LuMailOpen size={15} /></div>
                      )}
                      {c.status === 'replied' && (
                        <div className="w-8 h-8 rounded-lg bg-[#E4F0E7] text-[#2F6844] flex items-center justify-center border border-[#C7E0CD] shadow-xs"><LuCircleCheckBig size={15} /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className={`text-xs truncate ${c.status === 'unread' ? 'font-black text-[#1E2A2E]' : 'font-bold text-[#3A4548]'}`}>
                          {c.name}
                        </p>
                        <span className={`px-3 py-0.5 rounded-full text-[11px] font-black uppercase border ${STATUS_STYLES[c.status] ?? STATUS_STYLES.unread}`}>
                          {c.status}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-[#3A4548] truncate mb-1">{c.subject || '(No subject)'}</p>
                      <p className="text-xs font-semibold text-[#8B9296] truncate">{c.message}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                      className="p-2 rounded-lg text-[#8B9296] hover:text-[#B5453B] hover:bg-[#F5E1DE] border border-transparent hover:border-[#EBC7C1] transition-colors flex-shrink-0 cursor-pointer"
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
          <div className={`${CARD} p-6 sticky top-6`}>
            {!selected ? (
              <div className="py-24 text-center space-y-3">
                <div className="w-16 h-16 bg-[#FBF9F5] rounded-full flex items-center justify-center mx-auto text-[#C4C0B4] border border-[#E8E3D8]">
                  <LuMessageSquare size={28} />
                </div>
                <p className="text-[#9AA0A0] font-bold text-xs uppercase tracking-wider">
                  Select a message to view details
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-start justify-between border-b border-[#EFEBE2] pb-4">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-wider text-[#7A4F6D]">Message ID #{selected.id}</p>
                    <h2 className="text-base font-black text-[#1E2A2E] mt-0.5">{selected.subject || '(No subject)'}</h2>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase border whitespace-nowrap ${STATUS_STYLES[selected.status] ?? STATUS_STYLES.unread}`}>
                    {selected.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs bg-[#FBF9F5] p-4 rounded-xl border border-[#E8E3D8]">
                  <div className="flex items-center gap-2 text-[#1E2A2E]">
                    <LuUser size={15} className="text-[#8B9296]" />
                    <span className="font-black">{selected.name}</span>
                    <span className="text-[#C4C0B4]">·</span>
                    <span className="font-semibold text-[#5B6B6F]">{selected.email}</span>
                  </div>
                  {selected.phone && (
                    <div className="flex items-center gap-2 text-[#1E2A2E]">
                      <LuPhone size={15} className="text-[#8B9296]" />
                      <span className="font-bold">{selected.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-[#8B9296] pt-2 border-t border-[#E8E3D8] text-xs font-semibold">
                    <LuClock size={14} />
                    <span>{new Date(selected.created_at).toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-black uppercase tracking-wider text-[#8B9296] mb-2">Message Content</p>
                  <div className="bg-[#FBF9F5] border border-[#E8E3D8] rounded-xl p-4 text-xs font-semibold text-[#1E2A2E] leading-relaxed">
                    {selected.message}
                  </div>
                </div>

                {selected.reply_message && (
                  <div className="bg-[#E4F0E7] border border-[#C7E0CD] rounded-xl p-4 text-xs font-semibold text-[#1E4029] leading-relaxed shadow-xs">
                    <p className="text-[11px] font-black uppercase tracking-wider text-[#2F6844] mb-1.5">
                      Your Reply {selected.repliedBy?.name ? `· ${selected.repliedBy.name}` : ''}
                    </p>
                    {selected.reply_message}
                  </div>
                )}

                <div className="space-y-2 pt-2 border-t border-[#E8E3D8]">
                  <label className="text-[11px] font-black uppercase tracking-wider text-[#5B6B6F]">
                    {selected.status === 'replied' ? 'Update Reply' : 'Write a Reply'}
                  </label>
                  <textarea
                    rows={4}
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Type your response here..."
                    className="w-full border border-[#E8E3D8] rounded-xl p-3 text-xs font-semibold text-[#1E2A2E] focus:outline-none focus:ring-2 focus:ring-[#7A4F6D]/20 focus:border-[#7A4F6D] resize-none transition-all bg-white"
                  />
                  <button
                    onClick={handleReply}
                    disabled={sending || !replyText.trim()}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#7A4F6D] text-white text-xs font-black uppercase rounded-xl hover:bg-[#68425F] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
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