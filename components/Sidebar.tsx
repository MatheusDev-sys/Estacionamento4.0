
import React from 'react';
import {
  LayoutDashboard,
  Users,
  QrCode,
  BarChart3,
  Settings,
  LogOut,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'management', label: 'Gestão Geral', icon: Users },
    { id: 'qrcodes', label: 'Impressão QR', icon: QrCode },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white h-screen fixed left-0 top-0 border-r border-gray-100 flex flex-col z-40">
      <div className="p-6 flex items-center gap-3">
        <div className="flex items-center">
          <img src="logo.png" alt="Centro 4.0" className="h-24 w-auto" />
        </div>
      </div>

      <nav className="flex-1 mt-4 px-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activePage === item.id
              ? 'bg-blue-600 text-white font-semibold shadow-lg shadow-blue-100'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
          >
            <item.icon className={`w-5 h-5 ${activePage === item.id ? 'text-white' : 'text-gray-400'}`} />
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-50">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sair do Sistema</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
