import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axios';
import {
  LuDollarSign, LuClipboardList, LuUserPlus, LuPackageX,
  LuUtensilsCrossed, LuShoppingBag, LuArrowUpRight,
  LuTriangleAlert, LuCheck, LuRefreshCw, LuBell, LuBike, LuMapPin,
  LuArrowUp, LuArrowDown, LuMinus, LuDownload, LuCalendarDays, LuMail,
} from 'react-icons/lu';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import usePayment from '../../hooks/usePayment';
import useEcho from '../../hooks/useEcho';
import { reservationService } from '../../service/reservationService';
import { contactService } from '../../service/contactService';
import * as XLSX from 'xlsx';

/*
  DESIGN TOKENS — Khmer-Fresh admin
  ----------------------------------
  Paper (page bg)     #FBF9F5   Ink (text)          #1E2A2E
  Surface (cards)     #FFFFFF   Ink-soft (sub-text) #8B9296
  Line (borders)      #E8E3D8   Muted (labels)      #9AA0A0
  Gold (sales/spice)  #D99A3D   Herb (fresh/ok)     #3F7D58
  Sky (info)          #3B6E91   Plum (messages)     #7A4F6D
  Chili (urgent)      #B5453B

  SIDEBAR TIE-IN — the sidebar is dark navy (#1E2A2E) with a gold krama
  accent. Two things in the main content now echo that instead of sitting
  as an unrelated white/cream area next to it:
    1. The hero "Today's sales" card uses the same dark-navy + gold
       gradient as the sidebar, so the money metric reads as the page's
       one "premium" surface — same family as the brand mark.
    2. The three secondary stat cards are now fully color-filled (not
       just a tinted icon chip on white) using the same hue family as
       the status chips/alerts elsewhere on the page, so the card grid
       doesn't look like a second, disconnected palette.

  SPACING SCALE — one card padding for the whole page (p-6). Only the
  hero card (Today's Sales) and the chart get p-8 because they carry
  more visual weight — every other card uses the same p-6 rhythm so
  the eye doesn't have to recalibrate between sections.

  HEADING SCALE — every section h2 is text-[16px]/font-semibold. Size
  no longer competes with layout position for "this matters more" —
  hierarchy comes from card size and placement instead.

  Display face is 'Fraunces' for page/section titles only — add this to
  index.html for the intended look, it falls back to Georgia otherwise:
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&display=swap" rel="stylesheet">
*/
const FONT_SERIF = { fontFamily: "'Fraunces', Georgia, serif" };
const H2 = "text-[16px] font-semibold text-[#1E2A2E]";
const CARD = "bg-white rounded-2xl shadow-[0_1px_3px_rgba(30,42,46,0.05)] border border-[#E8E3D8]";

const POLL_MS = 15_000;
const PENDING_ORDER_ALERT_THRESHOLD = 5; // only alert once pending orders pile up past this count

const STATUS_STYLES = {
  pending: 'bg-[#FBEDD9] text-[#8A5A12] border-[#F1D9AE]',
  cooking: 'bg-[#E3EDF3] text-[#2E5975] border-[#C9DCE8]',
  served:  'bg-[#EFE6EC] text-[#6B3D5C] border-[#DCC9D6]',
  paid:    'bg-[#E4F0E7] text-[#2F6844] border-[#C7E0CD]',
};

const DELIVERY_STATUS_STYLES = {
  unassigned: 'bg-[#F1EFE9] text-[#6B6259] border-[#E3DFD3]',
  assigned:   'bg-[#E3EDF3] text-[#2E5975] border-[#C9DCE8]',
  picked_up:  'bg-[#FBEDD9] text-[#8A5A12] border-[#F1D9AE]',
  on_the_way: 'bg-[#F5E5DE] text-[#9C4A2E] border-[#EAD0C2]',
  delivered:  'bg-[#E4F0E7] text-[#2F6844] border-[#C7E0CD]',
  failed:     'bg-[#F5E1DE] text-[#8C3327] border-[#EBC7C1]',
};

const DELIVERY_STATUS_LABELS = {
  unassigned: 'Unassigned',
  assigned:   'Assigned',
  picked_up:  'Picked Up',
  on_the_way: 'On the Way',
  delivered:  'Delivered',
  failed:     'Failed',
};

const AVATAR_PALETTE = [
  'bg-[#22343A] text-[#E8C97A]',
  'bg-[#FBEDD9] text-[#8A5A12]',
  'bg-[#E3EDF3] text-[#2E5975]',
  'bg-[#EFE6EC] text-[#6B3D5C]',
  'bg-[#F5E5DE] text-[#9C4A2E]',
  'bg-[#E4F0E7] text-[#2F6844]',
];

const ALERT_TONES = {
  payment: {
    chip:   'bg-[#FBEDD9] text-[#8A5A12]',
    badge:  'bg-[#D99A3D]',
    button: 'bg-[#D99A3D] text-white hover:bg-[#C3862F]',
  },
  delivery: {
    chip:   'bg-[#F5E5DE] text-[#9C4A2E]',
    badge:  'bg-[#C1653D]',
    button: 'bg-[#C1653D] text-white hover:bg-[#AA562F]',
  },
  reservation: {
    chip:   'bg-[#E3EDF3] text-[#2E5975]',
    badge:  'bg-[#3B6E91]',
    button: 'bg-[#3B6E91] text-white hover:bg-[#325F7D]',
  },
  message: {
    chip:   'bg-[#EFE6EC] text-[#6B3D5C]',
    badge:  'bg-[#7A4F6D]',
    button: 'bg-[#7A4F6D] text-white hover:bg-[#68425F]',
  },
  // Urgent alerts get a left accent bar in the list (see render below) so
  // the one item that actually needs immediate action stands apart from
  // routine confirmations, instead of all four tones reading as equal.
  urgent: {
    chip:   'bg-[#F5E1DE] text-[#8C3327]',
    badge:  'bg-[#B5453B]',
    button: 'bg-[#B5453B] text-white hover:bg-[#9C3B32]',
  },
};

// Priority order for sorting alerts — urgent kitchen backlog always leads,
// routine confirmations (messages, reservations) trail behind money/logistics.
const ALERT_PRIORITY = ['urgent', 'delivery', 'payment', 'reservation', 'message'];

// Full-fill palette for the secondary stat cards — bold, saturated brand
// hues (not light tints) with white text and a translucent icon chip, so
// each card reads as a solid color block rather than a white card with a
// hint of color. Same hue family as the status chips elsewhere, just
// pushed to full saturation.
const STAT_FILL = {
  sky:   { bg: 'bg-[#3B6E91]', text: 'text-white', sub: 'text-[#CFE1EC]', chip: 'bg-white/20 text-white', badge: 'bg-white/20 text-white' },
  herb:  { bg: 'bg-[#3F7D58]', text: 'text-white', sub: 'text-[#CFE7D7]', chip: 'bg-white/20 text-white', badge: 'bg-white/20 text-white' },
  chili: { bg: 'bg-[#B5453B]', text: 'text-white', sub: 'text-[#F3D4D0]', chip: 'bg-white/20 text-white', badge: 'bg-white/20 text-white' },
};

// Bold solid fills for the big queue-summary chips (Live order queue /
// Live delivery queue). Kept separate from STATUS_STYLES / DELIVERY_STATUS_
// STYLES above, which stay as light pills for small inline tags (order row
// badges, recent-orders list) — those need to stay quiet next to text,
// while these chips are meant to read as bold color blocks like the stat
// cards above them.
const QUEUE_FILL = {
  pending: 'bg-[#D99A3D]',
  cooking: 'bg-[#3B6E91]',
  served:  'bg-[#7A4F6D]',
};

const DELIVERY_FILL = {
  unassigned: 'bg-[#B5453B]',
  assigned:   'bg-[#3B6E91]',
  picked_up:  'bg-[#D99A3D]',
  on_the_way: 'bg-[#C1653D]',
  delivered:  'bg-[#3F7D58]',
  failed:     'bg-[#8C3327]',
};

const EMPTY_STATE = {
  stats: {
    today_sales: 0, yesterday_sales: 0, sales_change_pct: 0,
    orders_today: 0, new_customers_today: 0,
    low_stock_count: 0, unassigned_delivery_count: 0,
  },
  sales_trend:            [],
  live_queue:             { pending: 0, cooking: 0, served: 0 },
  live_delivery_queue:    { unassigned: 0, assigned: 0, picked_up: 0, on_the_way: 0, delivered: 0, failed: 0 },
  recent_orders:          [],
  recent_delivery_orders: [],
  low_stock:              [],
};

const GREETING_BY_HOUR = (hour) => {
  if (hour < 11) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

// Small decorative accent inspired by the krama — Cambodia's woven checkered
// scarf. Same motif as the sidebar logo strip, repeated here (and, wider,
// as the header divider below) so the two panels read as one product.
const KramaAccent = ({ className = '', count = 7 }) => (
  <svg width={count * 8} height="6" viewBox={`0 0 ${count * 8} 6`} className={className} aria-hidden="true">
    {Array.from({ length: count }).map((_, i) => (
      <rect
        key={i}
        x={i * 8}
        width="8"
        height="6"
        fill={i % 2 === 0 ? '#D99A3D' : '#1E2A2E'}
        opacity={i === count - 1 ? 0.35 : 1}
      />
    ))}
  </svg>
);

const AdminDashboard = () => {
  const navigate                        = useNavigate();
  const [data, setData]                 = useState(EMPTY_STATE);
  const [loading, setLoading]           = useState(true);
  const [lastSync, setLastSync]         = useState(null);
  const [reservationStats, setReservationStats] = useState(null);
  const [contactStats, setContactStats] = useState(null);
  const intervalRef                     = useRef(null);

  const { pendingCount, fetchPayments } = usePayment();

  const fetchDashboard = useCallback(async () => {
    try {
      const [dashRes, resStats, contactRes] = await Promise.all([
        axiosInstance.get('/admin/dashboard-stats'),
        reservationService.getStats().catch(() => null),
        contactService.getStats().catch(() => null),
      ]);

      setData({ ...EMPTY_STATE, ...dashRes.data });

      const statsPayload = resStats?.data?.data ?? resStats?.data ?? null;
      if (statsPayload) setReservationStats(statsPayload);

      const contactPayload = contactRes?.data?.data ?? contactRes?.data ?? null;
      if (contactPayload) setContactStats(contactPayload);

      setLastSync(new Date());
    } catch (err) {
      console.error('Dashboard fetch error:', err.response ?? err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    intervalRef.current = setInterval(fetchDashboard, POLL_MS);
    return () => clearInterval(intervalRef.current);
  }, [fetchDashboard]);

  useEcho(null, {
    onAnyChange: () => {
      fetchDashboard();
      fetchPayments();
    },
  });

  const handleManualRefresh = () => {
    fetchDashboard();
    fetchPayments();
  };

  const {
    stats, sales_trend, live_queue, live_delivery_queue,
    recent_orders, recent_delivery_orders, low_stock,
  } = data;

  const unassignedDeliveryCount = stats.unassigned_delivery_count ?? 0;

  const now        = new Date();
  const greeting   = GREETING_BY_HOUR(now.getHours());
  const todayLabel = now.toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  const handleExportExcel = () => {
    if (!recent_orders.length) return;
    const rows = recent_orders.map(o => ({
      'Order ID': o.id,
      'Customer': o.customer ?? 'Guest',
      'Type':     o.order_type === 'delivery' ? 'Delivery' : 'Dine-in / Takeaway',
      'Status':   o.status,
      'Total':    o.total != null ? Number(o.total).toFixed(2) : '',
      'Placed':   o.placed ?? '',
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet['!cols'] = [
      { wch: 10 }, { wch: 22 }, { wch: 20 }, { wch: 12 }, { wch: 10 }, { wch: 10 },
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Recent Orders');
    XLSX.writeFile(workbook, `recent-orders-${now.toISOString().slice(0, 10)}.xlsx`);
  };

  // Build a single, prioritized "needs attention" list instead of stacking
  // one full-width banner per alert type.
  const alerts = [];
  if (pendingCount > 0) {
    alerts.push({
      key: 'payments',
      tone: 'payment',
      icon: <LuBell size={17} />,
      count: pendingCount,
      title: `${pendingCount} payment${pendingCount > 1 ? 's' : ''} awaiting confirmation`,
      subtitle: 'Paid via KHQR — review the receipt and confirm.',
      cta: 'Review',
      onClick: () => navigate('/admin/payments'),
    });
  }
  if (unassignedDeliveryCount > 0) {
    alerts.push({
      key: 'delivery',
      tone: 'delivery',
      icon: <LuBike size={17} />,
      count: unassignedDeliveryCount,
      title: `${unassignedDeliveryCount} delivery order${unassignedDeliveryCount > 1 ? 's' : ''} need${unassignedDeliveryCount === 1 ? 's' : ''} a rider`,
      subtitle: 'Assign a rider so the order can go out.',
      cta: 'Assign',
      onClick: () => navigate('/admin/delivery'),
    });
  }
  if (reservationStats?.pending > 0) {
    alerts.push({
      key: 'reservations',
      tone: 'reservation',
      icon: <LuCalendarDays size={17} />,
      count: reservationStats.pending,
      title: `${reservationStats.pending} reservation${reservationStats.pending > 1 ? 's' : ''} pending confirmation`,
      subtitle: 'A table booking is waiting on your response.',
      cta: 'Review',
      onClick: () => navigate('/admin/reservations'),
    });
  }
  if (contactStats?.unread > 0) {
    alerts.push({
      key: 'contacts',
      tone: 'message',
      icon: <LuMail size={17} />,
      count: contactStats.unread,
      title: `${contactStats.unread} new message${contactStats.unread > 1 ? 's' : ''}`,
      subtitle: 'A customer sent a contact message.',
      cta: 'Review',
      onClick: () => navigate('/admin/contacts'),
    });
  }
  if (live_queue.pending >= PENDING_ORDER_ALERT_THRESHOLD) {
    alerts.push({
      key: 'stuck-orders',
      tone: 'urgent',
      icon: <LuClipboardList size={17} />,
      count: live_queue.pending,
      title: `${live_queue.pending} orders stuck in pending`,
      subtitle: "The kitchen may need backup — orders haven't started cooking.",
      cta: 'View',
      onClick: () => navigate('/admin/orders'),
    });
  }
  alerts.sort((a, b) => ALERT_PRIORITY.indexOf(a.tone) - ALERT_PRIORITY.indexOf(b.tone));

  return (
    <div className="min-h-screen bg-[#FBF9F5]" style={{ background: 'var(--page-bg)' }} >
      <main className="p-10 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9AA0A0] mb-1">
              {todayLabel}
            </p>
            <h1 style={FONT_SERIF} className="text-[30px] font-semibold text-[#1E2A2E] leading-tight">
              {greeting}
            </h1>
            <KramaAccent className="mt-3" />
            {lastSync && (
              <p className="text-[11px] text-[#9AA0A0] font-medium mt-3">
                Last updated {lastSync.toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportExcel}
              disabled={!recent_orders.length}
              className="flex items-center gap-2 text-[12px] font-semibold text-[#5B6B6F] hover:text-[#1E2A2E] transition-colors bg-white border border-[#E3DFD3] px-4 py-2.5 rounded-xl shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <LuDownload size={14} /> Export
            </button>
            <button
              onClick={handleManualRefresh}
              className="flex items-center gap-2 text-[12px] font-semibold text-[#5B6B6F] hover:text-[#1E2A2E] transition-colors bg-white border border-[#E3DFD3] px-4 py-2.5 rounded-xl shadow-sm"
            >
              <LuRefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        {/* Header → sidebar bridge: a full-width krama strip in the same
            dark/gold rhythm as the sidebar logo accent, so the cream content
            area doesn't read as a separate palette from the navy sidebar. */}
        <div className="rounded-full overflow-hidden h-[3px] flex">
          {Array.from({ length: 48 }).map((_, i) => (
            <div key={i} className="flex-1" style={{ background: i % 2 === 0 ? '#D99A3D' : '#1E2A2E', opacity: i % 2 === 0 ? 0.9 : 0.15 }} />
          ))}
        </div>

        {/* Needs attention — sorted so the one thing that's actually urgent
            (kitchen backlog) leads, and carries a left accent bar so it
            doesn't read as "just another item in the list". */}
        {alerts.length > 0 && (
          <div className={`${CARD} overflow-hidden`}>
            <div className="px-6 py-4 flex items-center justify-between border-b border-[#EFEBE2]">
              <h2 style={FONT_SERIF} className={H2}>Needs your attention</h2>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#9AA0A0]">
                {alerts.length} item{alerts.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="divide-y divide-[#EFEBE2]">
              {alerts.map(a => {
                const tone = ALERT_TONES[a.tone];
                const isUrgent = a.tone === 'urgent';
                return (
                  <div
                    key={a.key}
                    className={`relative flex items-center justify-between gap-4 px-6 py-4 hover:bg-[#FBF9F5] transition-colors
                      ${isUrgent ? 'bg-[#FCF4F3]' : ''}`}
                  >
                    {isUrgent && (
                      <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#B5453B]" />
                    )}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${tone.chip}`}>
                        {a.icon}
                        <span className={`absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-bold text-white flex items-center justify-center ${tone.badge}`}>
                          {a.count > 9 ? '9+' : a.count}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-semibold text-[#1E2A2E] truncate">{a.title}</p>
                        <p className="text-[12px] text-[#8B9296] truncate">{a.subtitle}</p>
                      </div>
                    </div>
                    <button
                      onClick={a.onClick}
                      className={`flex-shrink-0 text-[11px] font-bold uppercase tracking-wide px-4 py-2 rounded-lg transition-colors ${tone.button}`}
                    >
                      {a.cta} →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Stat Cards — Today's Sales is the metric everything else in the
            business rolls up to, so it gets its own wider hero card in the
            same dark-navy + gold treatment as the sidebar, instead of
            competing as one of four equal white boxes. The three cards
            beside it are now fully color-filled (not just a tinted icon
            chip on white) using the same hue family as the status chips
            elsewhere on the page, so the whole row reads as one palette. */}
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-4">
            <HeroStatCard
              icon={<LuDollarSign size={22} />}
              title="Today's sales"
              value={loading ? '—' : `$${Number(stats.today_sales ?? 0).toFixed(2)}`}
              sub="vs yesterday"
              trendPct={stats.sales_change_pct}
              loading={loading}
            />
          </div>
          <div className="col-span-8 grid grid-cols-3 gap-5">
            <StatCard
              icon={<LuClipboardList size={19} />}
              fill="sky"
              badge="Orders"
              title="Orders today"
              value={loading ? '—' : stats.orders_today ?? 0}
              sub="all statuses"
            />
            <StatCard
              icon={<LuUserPlus size={19} />}
              fill="herb"
              badge="Users"
              title="New customers"
              value={loading ? '—' : stats.new_customers_today ?? 0}
              sub="today"
            />
            <StatCard
              icon={<LuPackageX size={19} />}
              fill="chili"
              badge="Alert"
              title="Low stock items"
              value={loading ? '—' : stats.low_stock_count ?? 0}
              sub="needs restock"
              onClick={() => navigate('/admin/products')}
            />
          </div>
        </div>

        {/* Reservation Stats Row */}
        {reservationStats && (
          <div
            onClick={() => navigate('/admin/reservations')}
            className={`cursor-pointer ${CARD} p-6 hover:shadow-[0_4px_16px_rgba(30,42,46,0.08)] transition-shadow`}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <LuCalendarDays size={16} className="text-[#3B6E91]" />
                <h2 style={FONT_SERIF} className={H2}>Table reservations</h2>
              </div>
              <span className="text-[10px] font-bold text-[#9AA0A0] uppercase tracking-widest">
                View all →
              </span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Total',     value: reservationStats.total,     tint: 'bg-[#1E2A2E] text-white' },
                { label: 'Pending',   value: reservationStats.pending,   tint: 'bg-[#D99A3D] text-white' },
                { label: 'Confirmed', value: reservationStats.confirmed, tint: 'bg-[#3F7D58] text-white' },
                { label: 'Today',     value: reservationStats.today,     tint: 'bg-[#3B6E91] text-white' },
              ].map(s => (
                <div key={s.label} className={`${s.tint} rounded-xl p-4 text-center shadow-[0_4px_14px_rgba(30,42,46,0.1)]`}>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">{s.label}</p>
                  <p className="text-2xl font-bold">{s.value ?? 0}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-6 items-start">

          {/* LEFT */}
          <div className="col-span-8 space-y-6">

            {/* Sales Trend */}
            <div className={`${CARD} p-6`}>
              <h2 style={FONT_SERIF} className={`${H2} mb-6`}>Sales trend · last 7 days</h2>
              <div className="h-[280px] w-full">
                {sales_trend.length === 0 ? (
                  <EmptyPanel
                    loading={loading}
                    icon={<LuDollarSign size={26} />}
                    title="No sales yet"
                    sub="Paid orders will start filling in this chart."
                  />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sales_trend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke="#EFEAE0" vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#9AA0A0' }} />
                      <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#9AA0A0' }} />
                      <Tooltip
                        cursor={{ fill: '#FBF9F5' }}
                        formatter={(v) => [`$${v}`, 'Sales']}
                        contentStyle={{ borderRadius: 10, border: '1px solid #E8E3D8', fontSize: 12 }}
                      />
                      <Bar dataKey="sales" fill="#D99A3D" barSize={34} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Live Order Queue */}
            <div className={`${CARD} p-6`}>
              <div className="flex items-center justify-between mb-5">
                <h2 style={FONT_SERIF} className={H2}>Live order queue</h2>
                <span className="text-[10px] font-bold text-[#C4C0B4] uppercase tracking-widest">
                  Refreshes every {POLL_MS / 1000}s
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <QueueChip label="Pending" count={live_queue.pending ?? 0} icon={<LuClipboardList />}  styleKey="pending" />
                <QueueChip label="Cooking" count={live_queue.cooking ?? 0} icon={<LuUtensilsCrossed />} styleKey="cooking" />
                <QueueChip label="Served"  count={live_queue.served  ?? 0} icon={<LuShoppingBag />}    styleKey="served"  />
              </div>
            </div>

            {/* Live Delivery Queue — "Unassigned" is the only status that
                needs a human to act, so it gets a ring instead of blending
                in with five passive status counts. */}
            <div className={`${CARD} p-6`}>
              <div className="flex items-center justify-between mb-5">
                <h2 style={FONT_SERIF} className={`${H2} flex items-center gap-2`}>
                  <LuBike size={17} className="text-[#C1653D]" /> Live delivery queue
                </h2>
                <button
                  onClick={() => navigate('/admin/delivery')}
                  className="text-[10px] font-bold text-[#9AA0A0] hover:text-[#1E2A2E] uppercase tracking-widest transition-colors"
                >
                  Manage →
                </button>
              </div>
              <div className="grid grid-cols-3 lg:grid-cols-6 gap-2.5">
                {Object.keys(DELIVERY_STATUS_LABELS).map(key => (
                  <DeliveryChip
                    key={key}
                    label={DELIVERY_STATUS_LABELS[key]}
                    count={live_delivery_queue[key] ?? 0}
                    styleKey={key}
                    needsAction={key === 'unassigned' && (live_delivery_queue[key] ?? 0) > 0}
                  />
                ))}
              </div>
              {recent_delivery_orders.length > 0 && (
                <div className="mt-5 pt-5 border-t border-[#EFEBE2] space-y-2">
                  {recent_delivery_orders.map(order => (
                    <div
                      key={order.id}
                      onClick={() => navigate('/admin/delivery')}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#FBF9F5] hover:bg-[#F3F0E9] cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-[#1E2A2E] text-sm">#{order.id}</span>
                        <div>
                          <p className="text-xs font-semibold text-[#1E2A2E]">{order.customer}</p>
                          <p className="flex items-center gap-1 text-[10px] text-[#9AA0A0]">
                            <LuMapPin size={10} /> {order.address ?? '—'}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${DELIVERY_STATUS_STYLES[order.delivery_status] ?? DELIVERY_STATUS_STYLES.unassigned}`}>
                        {DELIVERY_STATUS_LABELS[order.delivery_status] ?? order.delivery_status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="col-span-4 space-y-6">

            {/* Recent Orders */}
            <div className={`${CARD} p-6`}>
              <div className="flex items-center justify-between mb-5">
                <h2 style={FONT_SERIF} className={H2}>Recent orders</h2>
                <button
                  onClick={() => navigate('/admin/orders')}
                  className="text-[10px] font-bold text-[#9AA0A0] hover:text-[#1E2A2E] uppercase tracking-widest transition-colors"
                >
                  View all →
                </button>
              </div>
              {recent_orders.length === 0 ? (
                <EmptyPanel
                  compact
                  loading={loading}
                  icon={<LuClipboardList size={20} />}
                  title="No orders yet"
                  sub="New orders will show up here as they come in."
                />
              ) : (
                <div className="space-y-0.5">
                  {recent_orders.map(order => (
                    <div
                      key={order.id}
                      onClick={() => navigate('/admin/orders')}
                      className="flex items-center justify-between py-3 border-b border-[#EFEBE2] last:border-0 cursor-pointer hover:bg-[#FBF9F5] -mx-2 px-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar name={order.customer ?? 'Guest'} />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#1E2A2E] flex items-center gap-1">
                            #{order.id}
                            {order.order_type === 'delivery' && (
                              <LuBike size={11} className="text-[#C1653D]" />
                            )}
                          </p>
                          <p className="text-[11px] text-[#8B9296] truncate">
                            {order.customer ?? 'Guest'}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border whitespace-nowrap ${STATUS_STYLES[order.status] ?? STATUS_STYLES.pending}`}>
                        {order.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Low Stock */}
            <div className={`${CARD} p-6`}>
              <div className="flex items-center justify-between mb-5">
                <h2 style={FONT_SERIF} className={H2}>Low stock items</h2>
                {low_stock.length > 0 && <LuTriangleAlert size={15} className="text-[#B5453B]" />}
              </div>
              <div className="space-y-3.5">
                {low_stock.length === 0 ? (
                  <div className="flex items-center gap-2">
                    <LuCheck size={14} className="text-[#2F6844]" />
                    <p className="text-[#9AA0A0] font-semibold uppercase tracking-widest text-[10px]">
                      {loading ? 'Loading…' : 'All stock levels OK'}
                    </p>
                  </div>
                ) : low_stock.map(item => (
                  <StockItem
                    key={item.label ?? item.name}
                    label={item.label ?? item.name}
                    weight={item.weight ?? item.stock}
                    critical={item.critical}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// The hero card for Today's Sales — same dark-navy + gold treatment as the
// sidebar (down to the mini krama strip in the corner), so this is the one
// card that visually "belongs" to the brand panel instead of the cream
// content area. Bigger type, gold-tinted icon chip, white value text.
const HeroStatCard = ({ icon, title, value, sub, trendPct, loading }) => {
  const showTrend = typeof trendPct === 'number' && !loading;
  const isUp   = showTrend && trendPct > 0;
  const isDown = showTrend && trendPct < 0;
  return (
    <div
      className="h-full rounded-2xl p-6 shadow-[0_8px_24px_rgba(30,42,46,0.22)] flex flex-col justify-between relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1E2A2E 0%, #223339 55%, #2A3B3F 100%)' }}
    >
      <div className="flex items-start justify-between">
        <div className="bg-[#D99A3D]/15 text-[#E8C97A] p-3 rounded-xl border border-[#D99A3D]/30">{icon}</div>
        <span className="text-[9px] font-bold uppercase tracking-widest bg-white/10 text-[#E8C97A] px-2.5 py-1 rounded-full">Today</span>
      </div>
      <div>
        <p className="text-[#B9C2C4] text-[12px] font-semibold mt-4">{title}</p>
        <h3 style={FONT_SERIF} className="font-semibold text-white text-[34px] leading-none mt-1.5">{value}</h3>
        <div className="flex items-center gap-2 mt-2">
          <span className="font-medium text-[#8B9296] text-[11px]">{sub}</span>
          {showTrend && (
            <span className={`flex items-center gap-0.5 text-[11px] font-bold ${isUp ? 'text-[#7FC79A]' : isDown ? 'text-[#E8938A]' : 'text-[#8B9296]'}`}>
              {isUp ? <LuArrowUp size={11} /> : isDown ? <LuArrowDown size={11} /> : <LuMinus size={11} />}
              {Math.abs(trendPct).toFixed(1)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Secondary stat cards — bold solid-color blocks (icon chip top-left,
// small uppercase badge pill top-right, big white number below) rather
// than a white card with a light tint. `fill` picks the hue from
// STAT_FILL; `badge` is the short corner label (e.g. "Orders", "Alert").
const StatCard = ({ icon, fill = 'sky', badge, title, value, sub, onClick }) => {
  const f = STAT_FILL[fill];
  return (
    <div
      onClick={onClick}
      className={`h-full rounded-2xl p-5 flex flex-col justify-between group shadow-[0_4px_14px_rgba(30,42,46,0.12)] transition-transform ${f.bg} ${onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className={`${f.chip} p-2.5 rounded-xl`}>{icon}</div>
        {badge && (
          <span className={`text-[9px] font-bold uppercase tracking-widest ${f.badge} px-2.5 py-1 rounded-full`}>
            {badge}
          </span>
        )}
      </div>
      <div className="mt-4">
        <h3 className={`${f.text} font-bold text-[26px] leading-none`}>{value}</h3>
        <p className={`${f.text} text-[12px] font-semibold mt-1.5 opacity-90`}>{title}</p>
        <div className="flex items-center justify-between mt-1">
          <span className={`${f.sub} font-medium text-[11px]`}>{sub}</span>
          {onClick && <LuArrowUpRight className={`${f.text} opacity-50 group-hover:opacity-90 transition-opacity flex-shrink-0`} size={16} />}
        </div>
      </div>
    </div>
  );
};

const QueueChip = ({ label, count, icon, styleKey }) => (
  <div className={`rounded-xl p-4 flex items-center gap-3 shadow-[0_4px_14px_rgba(30,42,46,0.12)] ${QUEUE_FILL[styleKey]}`}>
    <div className="text-lg text-white/85">{icon}</div>
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">{label}</p>
      <p className="text-xl font-bold text-white">{count}</p>
    </div>
  </div>
);

const DeliveryChip = ({ label, count, styleKey, needsAction }) => (
  <div
    className={`relative rounded-xl p-3 text-center shadow-[0_4px_14px_rgba(30,42,46,0.12)] ${DELIVERY_FILL[styleKey]}
      ${needsAction ? 'ring-2 ring-white ring-offset-2 ring-offset-[#FBF9F5]' : ''}`}
  >
    <p className="text-[9px] font-bold uppercase tracking-widest text-white/70 mb-1">{label}</p>
    <p className="text-lg font-bold text-white">{count}</p>
  </div>
);

const StockItem = ({ label, weight, critical }) => (
  <div className="flex items-center gap-3">
    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${critical ? 'bg-[#B5453B]' : 'bg-[#D99A3D]'}`} />
    <p className="text-[13.5px] text-[#5B6B6F] font-medium">
      {label}: <span className={`font-bold ml-1 ${critical ? 'text-[#B5453B]' : 'text-[#1E2A2E]'}`}>{weight}</span>
    </p>
  </div>
);

const Avatar = ({ name }) => {
  const { initials, paletteClass } = useMemo(() => {
    const clean = (name || 'Guest').trim();
    const parts = clean.split(/\s+/).filter(Boolean);
    const chars = parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : clean.slice(0, 2);
    let hash = 0;
    for (let i = 0; i < clean.length; i++) hash = clean.charCodeAt(i) + ((hash << 5) - hash);
    return { initials: chars.toUpperCase(), paletteClass: AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length] };
  }, [name]);
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${paletteClass}`}>
      {initials}
    </div>
  );
};

const EmptyPanel = ({ icon, title, sub, loading, compact }) => (
  <div className={`flex flex-col items-center justify-center text-center ${compact ? 'py-8' : 'h-full'}`}>
    {!loading && <div className="text-[#E3DFD3] mb-3">{icon}</div>}
    <p className="text-[#9AA0A0] text-sm font-semibold uppercase tracking-widest">{loading ? 'Loading…' : title}</p>
    {!loading && sub && <p className="text-[#C4C0B4] text-[11px] font-medium mt-1 max-w-[220px]">{sub}</p>}
  </div>
);

export default AdminDashboard;