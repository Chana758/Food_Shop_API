import React from 'react';
import { LuUsers, LuBox, LuClipboardList, LuDollarSign, LuArrowUpRight } from 'react-icons/lu';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const chartData = [
    { name: 'January', sales: 200 }, { name: 'February', sales: 280 },
    { name: 'March', sales: 350 }, { name: 'April', sales: 450 },
    { name: 'May', sales: 430 }, { name: 'June', sales: 230 },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <main className="p-10 space-y-8"> 
        {/* ១. Stat Cards */}
        <div className="grid grid-cols-4 gap-6">
          <StatCard className="rounded-[10px] p-5" icon={<LuUsers/>} title="Total Users:" value="1,234" growth="(+5%)" color="bg-[#1e292b]" />
          <StatCard className="rounded-[10px] p-5" icon={<LuBox/>} title="Total Products:" value="456" growth="(+2%)" color="bg-[#78b78a]" />
          <StatCard className="rounded-[10px] p-5" icon={<LuClipboardList/>} title="New Orders:" value="89" growth="(Pending)" color="bg-[#1e292b]" growthColor="text-orange-400" />
          <StatCard className="rounded-[10px] p-5" icon={<LuDollarSign/>} title="Today's Sales:" value="$1,150" growth="(+12%)" color="bg-[#78b78a]" />
        </div>

        {/* ២. Layout Chart & Tables */}
        <div className="grid grid-cols-12 gap-8 items-start">
          <div className="col-span-8 bg-white p-10 rounded-[10px] shadow-sm border border-gray-50">
            <h2 className="text-[20px] font-bold text-[#1e292b] mb-10">Monthly Sales Overview (USD)</h2>
            <div className="h-[450px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#e2e8f0" vertical={true} strokeDasharray="3 3" />
                  <XAxis dataKey="name" axisLine={true} tickLine={true} fontSize={13} tick={{fill: '#64748b'}} />
                  <YAxis axisLine={true} tickLine={true} fontSize={13} tick={{fill: '#64748b'}} domain={[0, 500]} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} />
                  <Bar dataKey="sales" fill="#3b82f6" barSize={60} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="col-span-4 space-y-8">
            <div className="bg-white p-8 rounded-[10px] shadow-sm border border-gray-50">
              <h2 className="text-[19px] font-bold text-[#1e292b] mb-6">Recent Orders</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="text-[#1e292b] font-bold border-b border-gray-100 text-left">
                      <th className="pb-4">Order ID</th>
                      <th className="pb-4">Customer</th>
                      <th className="pb-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {[1001, 1002, 1003].map((id) => (
                      <tr key={id}>
                        <td className="py-4 font-bold text-[#1e292b]">#{id}</td>
                        <td className="py-4 text-gray-600">Vy Za</td>
                        <td className="py-4 text-center">
                          <span className="bg-[#eaf7ee] text-[#4ade80] px-2.5 py-1 rounded-md text-[10px] font-bold">Delivered</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[10px] shadow-sm border border-gray-50">
              <h2 className="text-[19px] font-bold text-[#1e292b] mb-6">Low Stock Items</h2>
              <div className="space-y-4">
                <StockItem label="Lemongrass" weight="5 kg" />
                <StockItem label="Chilies" weight="3 kg" />
                <StockItem label="Sariners" weight="2 kg" />
                <StockItem label="Lemongras" weight="3 kg" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ icon, title, value, growth, color, growthColor = "text-green-500", className = "", valueClass = "text-[24px]", growthClass = "text-[15px]", iconClass = "text-[24px]" }) => (
  <div className={`bg-white shadow-sm border border-gray-50 flex items-center justify-between group hover:shadow-md transition-all ${className}`}>
    <div className="flex items-center gap-4">
      <div className={`${color} text-white p-4 rounded-[10px] ${iconClass}`}>{icon}</div>
      <div>
        <p className="text-gray-400 text-[12px] font-bold">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className={`font-black text-gray-800 ${valueClass}`}>{value}</h3>
          <span className={`font-bold ${growthColor} ${growthClass}`}>{growth}</span>
        </div>
      </div>
    </div>
    <LuArrowUpRight className="text-green-500 group-hover:text-gray-500" size={24} />
  </div>
);

const StockItem = ({ label, weight }) => (
  <div className="flex items-center gap-3">
    <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
    <p className="text-[14px] text-gray-600 font-medium">{label}: <span className="font-bold text-gray-900 ml-1">{weight}</span></p>
  </div>
);

export default AdminDashboard;