import React, { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// ── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ path, size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);
const IconDownload = () => <Icon path="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />;
const IconCalendar = () => <Icon path="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />;
const IconTrendUp = () => <Icon path="M22 7L13.5 15.5 8.5 10.5 2 17M22 7h-6M22 7v6" size={14} color="#22c55e" />;
const IconTrendDown = () => <Icon path="M22 17L13.5 8.5 8.5 13.5 2 7M22 17h-6M22 17v-6" size={14} color="#ef4444" />;
const IconUsers = () => <Icon path="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />;
const IconBox = () => <Icon path="M21 16V8a2 2 0 0 0-1-1.73L13 2.27a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />;
const IconDollar = () => <Icon path="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />;
const IconOrder = () => <Icon path="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 12l2 2 4-4" />;
const IconChevron = ({ dir = "down" }) => (
  <Icon path={dir === "down" ? "M6 9l6 6 6-6" : "M6 15l6-6 6 6"} size={14} />
);

// ── Data ─────────────────────────────────────────────────────────────────────
const monthlySales = [
  { month: "Jan", revenue: 3200, orders: 42 },
  { month: "Feb", revenue: 4800, orders: 61 },
  { month: "Mar", revenue: 5600, orders: 74 },
  { month: "Apr", revenue: 8900, orders: 112 },
  { month: "May", revenue: 8400, orders: 108 },
  { month: "Jun", revenue: 6100, orders: 89 },
];

const categoryData = [
  { name: "Main Dishes", value: 38, color: "#3b82f6" },
  { name: "Beverages", value: 24, color: "#22c55e" },
  { name: "Desserts", value: 18, color: "#f59e0b" },
  { name: "Snacks", value: 12, color: "#8b5cf6" },
  { name: "Soups", value: 8, color: "#ef4444" },
];

const topProducts = [
  { name: "Fish Amok", category: "Main Dishes", sold: 234, revenue: "$1,170", trend: "up" },
  { name: "Lok Lak", category: "Main Dishes", sold: 198, revenue: "$990", trend: "up" },
  { name: "Sugar Cane Juice", category: "Beverages", sold: 187, revenue: "$374", trend: "down" },
  { name: "Nom Banh Chok", category: "Soups", sold: 165, revenue: "$825", trend: "up" },
  { name: "Kuy Teav", category: "Soups", sold: 142, revenue: "$710", trend: "down" },
];

const recentTransactions = [
  { id: "#1021", customer: "Sophea Mak", amount: "$48.50", date: "Jun 20, 10:12 AM", status: "Delivered" },
  { id: "#1020", customer: "Dara Nhem", amount: "$23.00", date: "Jun 20, 9:45 AM", status: "Pending" },
  { id: "#1019", customer: "Bopha Ros", amount: "$67.20", date: "Jun 20, 9:10 AM", status: "Delivered" },
  { id: "#1018", customer: "Virak Oum", amount: "$31.75", date: "Jun 19, 6:55 PM", status: "Cancelled" },
  { id: "#1017", customer: "Leakhena Chan", amount: "$55.00", date: "Jun 19, 5:30 PM", status: "Delivered" },
];

// ── Sub-components ────────────────────────────────────────────────────────────
const StatCard = ({ icon, iconBg, label, value, change, positive }) => (
  <div style={{
    background: "#fff",
    borderRadius: 12,
    padding: "20px 22px",
    display: "flex",
    alignItems: "center",
    gap: 16,
    boxShadow: "0 1px 3px rgba(0,0,0,.07)",
    flex: 1,
    minWidth: 200,
  }}>
    <div style={{
      width: 48, height: 48, borderRadius: 10,
      background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 500, marginBottom: 2 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>{value}</span>
        <span style={{ fontSize: 12, color: positive ? "#22c55e" : "#ef4444", fontWeight: 600 }}>
          {positive ? "+" : ""}{change}
        </span>
      </div>
    </div>
    <div>{positive ? <IconTrendUp /> : <IconTrendDown />}</div>
  </div>
);

const statusStyle = (s) => {
  if (s === "Delivered") return { background: "#dcfce7", color: "#16a34a" };
  if (s === "Pending") return { background: "#fef9c3", color: "#ca8a04" };
  return { background: "#fee2e2", color: "#dc2626" };
};

const SectionCard = ({ title, children, action }) => (
  <div style={{
    background: "#fff",
    borderRadius: 12,
    padding: "20px 22px",
    boxShadow: "0 1px 3px rgba(0,0,0,.07)",
  }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827" }}>{title}</h3>
      {action}
    </div>
    {children}
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const Report = () => {
  const [period, setPeriod] = useState("This Month");
  const [open, setOpen] = useState(false);
  const periods = ["Today", "This Week", "This Month", "This Year"];

  return (
    <div style={{ background: "#f3f4f6", minHeight: "100vh", padding: "28px 32px", fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#111827" }}>Reports</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>Track your sales, orders, and product performance</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {/* Period picker */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setOpen(!open)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "9px 14px", borderRadius: 8, border: "1px solid #e5e7eb",
                background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#374151",
              }}
            >
              <IconCalendar /> {period} <IconChevron dir={open ? "up" : "down"} />
            </button>
            {open && (
              <div style={{
                position: "absolute", top: "calc(100% + 4px)", right: 0, background: "#fff",
                border: "1px solid #e5e7eb", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,.1)",
                zIndex: 10, minWidth: 140, overflow: "hidden",
              }}>
                {periods.map((p) => (
                  <div key={p}
                    onClick={() => { setPeriod(p); setOpen(false); }}
                    style={{
                      padding: "9px 14px", fontSize: 13, cursor: "pointer", color: "#374151",
                      background: p === period ? "#f0fdf4" : "transparent",
                      fontWeight: p === period ? 600 : 400,
                    }}
                  >{p}</div>
                ))}
              </div>
            )}
          </div>
          {/* Export */}
          <button style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "9px 16px", borderRadius: 8, border: "none",
            background: "#16a34a", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#fff",
          }}>
            <IconDownload /> Export
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        <StatCard
          icon={<Icon path="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" size={20} color="#fff" />}
          iconBg="#16a34a"
          label="Total Revenue"
          value="$37,000"
          change="12%"
          positive
        />
        <StatCard
          icon={<Icon path="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" size={20} color="#fff" />}
          iconBg="#1d1d1d"
          label="Total Orders"
          value="486"
          change="8%"
          positive
        />
        <StatCard
          icon={<Icon path="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" size={20} color="#fff" />}
          iconBg="#3b82f6"
          label="New Customers"
          value="124"
          change="5%"
          positive
        />
        <StatCard
          icon={<Icon path="M21 16V8a2 2 0 0 0-1-1.73L13 2.27a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" size={20} color="#fff" />}
          iconBg="#f59e0b"
          label="Avg. Order Value"
          value="$76.13"
          change="3%"
          positive={false}
        />
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 24 }}>
        {/* Revenue & Orders bar chart */}
        <SectionCard
          title="Monthly Revenue (USD)"
          action={
            <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#6b7280" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: "#3b82f6", display: "inline-block" }} /> Revenue
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: "#22c55e", display: "inline-block" }} /> Orders
              </span>
            </div>
          }
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlySales} barGap={6}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
                cursor={{ fill: "#f9fafb" }}
              />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="orders" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* Category Pie */}
        <SectionCard title="Sales by Category">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                dataKey="value" paddingAngle={3}>
                {categoryData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
            {categoryData.map((c) => (
              <div key={c.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.color, display: "inline-block" }} />
                  <span style={{ color: "#374151" }}>{c.name}</span>
                </div>
                <span style={{ color: "#6b7280", fontWeight: 600 }}>{c.value}%</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Bottom Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
        {/* Recent Transactions */}
        <SectionCard title="Recent Transactions"
          action={<span style={{ fontSize: 12, color: "#16a34a", fontWeight: 600, cursor: "pointer" }}>View all →</span>}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Order ID", "Customer", "Amount", "Date", "Status"].map((h) => (
                  <th key={h} style={{ textAlign: "left", fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", paddingBottom: 10 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((t, i) => (
                <tr key={t.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "10px 0", fontSize: 13, fontWeight: 600, color: "#374151" }}>{t.id}</td>
                  <td style={{ fontSize: 13, color: "#374151" }}>{t.customer}</td>
                  <td style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{t.amount}</td>
                  <td style={{ fontSize: 12, color: "#9ca3af" }}>{t.date}</td>
                  <td>
                    <span style={{
                      ...statusStyle(t.status),
                      fontSize: 11, fontWeight: 600,
                      padding: "3px 8px", borderRadius: 20,
                    }}>{t.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>

        {/* Top Products */}
        <SectionCard title="Top Products"
          action={<span style={{ fontSize: 12, color: "#16a34a", fontWeight: 600, cursor: "pointer" }}>View all →</span>}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {topProducts.map((p, i) => (
              <div key={p.name} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 0",
                borderBottom: i < topProducts.length - 1 ? "1px solid #f3f4f6" : "none",
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 6, background: "#f3f4f6",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, color: "#6b7280", flexShrink: 0,
                }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>{p.category}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{p.revenue}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>{p.sold} sold</div>
                </div>
                <div style={{ flexShrink: 0 }}>
                  {p.trend === "up" ? <IconTrendUp /> : <IconTrendDown />}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default Report;