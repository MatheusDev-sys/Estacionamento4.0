
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
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate, onLogout, isOpen, onClose }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'management', label: 'Gestão Geral', icon: Users },
    { id: 'qrcodes', label: 'Impressão QR', icon: QrCode },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <>
      {/* Overlay Escuro para Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Principal 
          - Mobile: fixed, z-40, transform translate
          - Desktop (lg): fixed, translate-0 (sempre visível)
      */}
      <aside className={`
        fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col z-40 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0
      `}>
        <div className="p-6 flex items-center justify-between gap-3">
          <div className="flex items-center">
            <img src="logo.png" alt="Centro 4.0" className="h-24 w-auto object-contain" />
          </div>
          {/* Botão Fechar apenas no Mobile */}
          <button onClick={onClose} className="lg:hidden p-2 text-gray-400 hover:text-red-500 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 mt-4 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                onClose(); // Fecha menu ao navegar no mobile
              }}
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

        <div className="p-4 border-t border-gray-50 bg-white">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Sair do Sistema</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
