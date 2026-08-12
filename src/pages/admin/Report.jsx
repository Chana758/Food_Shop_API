import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { 
  LuDownload, LuTrendingUp, LuTrendingDown, 
  LuDollarSign, LuShoppingCart, LuUsers, LuPackage, LuRefreshCw 
} from "react-icons/lu";

// ── Sub-components styled like Delivery Page ─────
const StatCard = ({ icon, cardBg, label, value, change, positive, subtext }) => (
  <div className={`${cardBg} rounded-2xl p-5 flex flex-col justify-between shadow-sm flex-1 min-w-[200px] text-white relative overflow-hidden`}>
    <div className="flex items-center justify-between mb-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/15 text-white">
        {icon}
      </div>
      <span className="text-[10px] font-black uppercase tracking-wider text-white/70">{label}</span>
    </div>
    <div>
      <div className="text-2xl font-black tracking-tight">{value}</div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-[11px] font-bold text-white/60">{subtext}</span>
        <span className={`text-sm font-black flex items-center gap-0.5 ${positive ? "text-emerald-300" : "text-rose-300"}`}>
          {positive ? <LuTrendingUp size={15} /> : <LuTrendingDown size={15} />}
          {positive ? "+" : ""}{change}%
        </span>
      </div>
    </div>
  </div>
);

const statusStyle = (s) => {
  if (s === "Delivered" || s === "Paid" || s === "Success") return "bg-[#E4F0E7] text-[#2F6844] border-[#C8E1CE]";
  if (s === "Pending") return "bg-[#FBEDD9] text-[#B9791F] border-[#F2D7B3]";
  return "bg-[#FCE8E6] text-[#C53030] border-[#FAD2CF]";
};

const SectionCard = ({ title, children, action, subtitle }) => (
  <div className="bg-white rounded-2xl p-6 border border-[#E8E3D8] shadow-sm">
    <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F0ECE1]">
      <div>
        <h3 className="m-0 text-sm font-black uppercase text-[#1E2A2E] tracking-wider">{title}</h3>
        {subtitle && <p className="text-[11px] font-bold text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
    {children}
  </div>
);

// ── Main Component ────
const Report = () => {
  const [period, setPeriod] = useState("this_month");
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    stats: {
      total_revenue: 0, revenue_change_pct: 0, revenue_positive: true,
      total_orders: 0, orders_change_pct: 0, orders_positive: true,
      new_customers: 0, customers_change_pct: 0, customers_positive: true,
      avg_order_value: 0, avg_change_pct: 0, avg_positive: true,
    },
    monthly_sales: [],
    category_data: [],
    top_products: [],
    recent_transactions: []
  });

  const periods = [
    { label: "Today", value: "today" },
    { label: "This Week", value: "this_week" },
    { label: "This Month", value: "this_month" },
    { label: "This Year", value: "this_year" }
  ];

  useEffect(() => {
    fetchReportData(period);
  }, [period]);

  const fetchReportData = async (selectedPeriod) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token") || sessionStorage.getItem("access_token");
      
      // connect to Laravel API Endpoint -> Backend
      const response = await axios.get(`http://127.0.0.1:8000/api/admin/reports/stats?period=${selectedPeriod}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.status === "success") {
        setReportData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching report stats:", error.response ?? error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 space-y-6 font-sans" style={{ background: 'var(--page-bg)' }}>

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8E3D8] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black uppercase text-[#1E2A2E] tracking-wider m-0">Reports & Analytics</h1>
          <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-wider">
            Daily, monthly, and yearly business metrics with actionable data
          </p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-[#F8F6F0] p-1 rounded-xl border border-[#E8E3D8] flex items-center gap-1">
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  period === p.value
                    ? "bg-[#1E2A2E] text-white shadow-sm"
                    : "text-gray-700 hover:text-[#1E2A2E]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-none bg-[#2F6844] cursor-pointer text-xs font-black uppercase tracking-wider text-white hover:bg-[#255235] transition-colors shadow-sm"
          >
            <LuDownload size={15} /> Export Report
          </button>
        </div>
      </div>

      {/* Stat Cards Row (solid color state) */}
      <div className="flex gap-4 flex-wrap">
        <StatCard
          icon={<LuDollarSign size={20} />}
          cardBg="bg-[#2F6844]"
          label="Total Revenue"
          value={`$${Number(reportData.stats.total_revenue || 0).toLocaleString()}`}
          subtext="Total earnings"
          change={reportData.stats.revenue_change_pct}
          positive={reportData.stats.revenue_positive}
        />
        <StatCard
          icon={<LuShoppingCart size={20} />}
          cardBg="bg-[#1E2A2E]"
          label="Total Orders"
          value={Number(reportData.stats.total_orders || 0).toLocaleString()}
          subtext="Processed sales"
          change={reportData.stats.orders_change_pct}
          positive={reportData.stats.orders_positive}
        />
        <StatCard
          icon={<LuUsers size={20} />}
          cardBg="bg-[#3B82F6]"
          label="New Customers"
          value={Number(reportData.stats.new_customers || 0).toLocaleString()}
          subtext="Registered users"
          change={reportData.stats.customers_change_pct}
          positive={reportData.stats.customers_positive}
        />
        <StatCard
          icon={<LuPackage size={20} />}
          cardBg="bg-[#B9791F]"
          label="Avg. Order Value"
          value={`$${Number(reportData.stats.avg_order_value || 0).toLocaleString()}`}
          subtext="Per transaction"
          change={reportData.stats.avg_change_pct}
          positive={reportData.stats.avg_positive}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectionCard
            title="Performance Breakdown"
            subtitle="Comparative analysis of revenue and order volume"
            action={
              <div className="flex gap-4 text-xs font-bold text-gray-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#3B82F6] inline-block" /> Revenue ($)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#2F6844] inline-block" /> Orders
                </span>
              </div>
            }
          >
            <div className="pt-2">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={reportData.monthly_sales} barGap={6}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0ECE1" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#4B5563", fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#4B5563", fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #E8E3D8", fontSize: 12, fontWeight: 700, backgroundColor: "#FFF" }}
                    cursor={{ fill: "#FAF8F5" }}
                  />
                  <Bar dataKey="revenue" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="orders" fill="#2F6844" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Sales by Category" subtitle="Distribution share percentage">
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={165}>
              <PieChart>
                <Pie data={reportData.category_data} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                  dataKey="value" paddingAngle={4}>
                  {reportData.category_data.map((entry, i) => (
                    <Cell key={i} fill={entry.color || "#3B82F6"} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} contentStyle={{ borderRadius: 12, fontSize: 12, fontWeight: 700 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-full flex flex-col gap-2 mt-3 max-h-32 overflow-y-auto pr-1">
              {reportData.category_data.map((c) => (
                <div key={c.name} className="flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: c.color || "#3B82F6" }} />
                    <span className="text-gray-700">{c.name}</span>
                  </div>
                  <span className="text-gray-600">{c.value}%</span>
                </div>
              ))}
              {reportData.category_data.length === 0 && (
                <div className="text-xs text-gray-500 text-center py-4">No category data</div>
              )}
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard 
          title="Recent Transactions" 
          subtitle="Latest orders processed in the system"
          action={
            <button 
              onClick={() => fetchReportData(period)}
              className="p-2 rounded-xl border border-[#E8E3D8] hover:bg-[#FAF8F5] text-gray-600 transition-colors cursor-pointer"
              title="Refresh Transactions"
            >
              <LuRefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#F0ECE1]">
                  {["Order ID", "Customer", "Amount", "Date", "Status"].map((h) => (
                    <th key={h} className="text-[10px] font-black text-gray-500 uppercase tracking-wider pb-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-xs font-bold text-gray-700">
                {reportData.recent_transactions.map((t) => (
                  <tr key={t.id} className="border-b border-[#F4F1EA] hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3 text-[#1E2A2E]">{t.id}</td>
                    <td className="py-3 text-gray-800">{t.customer}</td>
                    <td className="py-3 text-[#1E2A2E]">{t.amount}</td>
                    <td className="py-3 text-gray-500 font-medium">{t.date}</td>
                    <td className="py-3">
                      <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${statusStyle(t.status)}`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {reportData.recent_transactions.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500 font-medium">No recent transactions found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Top Products Performance" subtitle="Best-selling items by revenue and volume">
          <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1">
            {reportData.top_products.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3 p-2 rounded-xl bg-[#FAF8F5] border border-[#F0ECE1]">
                <div className="w-8 h-8 rounded-lg bg-white border border-[#E8E3D8] flex items-center justify-center text-xs font-black text-[#1E2A2E] shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black text-[#1E2A2E] truncate">{p.name}</div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{p.category}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-black text-[#1E2A2E]">{p.revenue}</div>
                  <div className="text-[10px] font-bold text-gray-500">{p.sold} sold</div>
                </div>
                <div className={`p-1.5 rounded-lg shrink-0 ${p.trend === "up" ? "bg-[#E4F0E7] text-[#2F6844]" : "bg-[#FCE8E6] text-[#C53030]"}`}>
                  {p.trend === "up" ? <LuTrendingUp size={14} /> : <LuTrendingDown size={14} />}
                </div>
              </div>
            ))}
            {reportData.top_products.length === 0 && (
              <div className="text-xs text-gray-500 text-center py-8 font-medium">No top products available.</div>
            )}
          </div>
        </SectionCard>
      </div>

    </div>
  );
};

export default Report;