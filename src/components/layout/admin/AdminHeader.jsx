import React from 'react';
import { LuMenu, LuSearch, LuMail, LuBell } from 'react-icons/lu';
import ch1 from '../../../assets/image/channa.jpg';

const AdminHeader = ({ title, searchTerm, setSearchTerm, toggleSidebar }) => {
  const userName = localStorage.getItem('user_name') || 'Sam Channa';
  const userRole = localStorage.getItem('user_role') || 'Admin';

  return (
    <header className="sticky top-0 bg-white shadow-sm border-b border-gray-100 px-6 py-5 flex justify-between items-center z-40">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <LuMenu size={20} className="text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-[#1e292b]">{title}</h1>
      </div>

      <div className="flex-1 max-w-sm mx-6">
        <div className="relative flex items-center">
          <LuSearch className="absolute left-3 text-gray-400" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search menu..."
            className="w-full pl-10 pr-12 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#9ff3a9]"
          />
          <span className="absolute right-3 text-[10px] bg-gray-200 px-1.5 py-0.5 rounded text-gray-500 font-bold">⌘ F</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-gray-100 rounded-full"><LuMail size={20} className="text-gray-600" /></button>
        <button className="p-2 hover:bg-gray-100 rounded-full"><LuBell size={20} className="text-gray-600" /></button>
        <div className="flex items-center gap-3 border-l pl-4">
          <div className="text-right">
            <p className="text-xs font-bold text-gray-800">{userName}</p>
            <p className="text-[10px] text-gray-500 capitalize">{userRole}</p>
          </div>
          <img className="w-9 h-9 rounded-full object-cover border" src={ch1} alt="Profile" />
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;