
import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, User, ChevronDown, LogOut, Settings as SettingsIcon, Activity } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface TopbarProps {
  searchTerm: string;
  onSearch: (term: string) => void;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ searchTerm, onSearch, onNavigate, onLogout }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [adminProfile, setAdminProfile] = useState({ name: 'Carregando...', email: '', avatar: '' });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  
  const profileRef = useRef<HTMLDivElement>(null);
  const notifyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
          setAdminProfile({
            name: data.name,
            email: data.email,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=0B5ED7&color=fff`
          });
        }
      }
    }

    async function getNotifications() {
      const { data } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(3);
      if (data) setRecentLogs(data);
    }

    getProfile();
    getNotifications();
    
    // Escutar mudanças no perfil para atualizar o Topbar em tempo real
    const profileSubscription = supabase
      .channel('profile_changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, payload => {
        setAdminProfile(prev => ({ ...prev, name: payload.new.name }));
      })
      .subscribe();

    return () => { supabase.removeChannel(profileSubscription); };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setShowProfile(false);
      if (notifyRef.current && !notifyRef.current.contains(event.target as Node)) setShowNotifications(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNav = (page: string) => {
    onNavigate(page);
    setShowProfile(false);
    setShowNotifications(false);
  };

  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-30 no-print">
      <div className="relative w-96 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
        <input 
          type="text" 
          value={searchTerm}
          placeholder="Pesquisar por placa ou nome..."
          onChange={(e) => onSearch(e.target.value)}
          className="w-full bg-gray-50 border border-transparent rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-50 transition-all outline-none"
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="relative" ref={notifyRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2.5 rounded-xl transition-all ${showNotifications ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-blue-600 hover:bg-gray-50'}`}
          >
            <Bell className="w-5 h-5" />
            {recentLogs.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-4 w-80 bg-white rounded-[28px] shadow-2xl border border-gray-100 p-4 animate-in slide-in-from-top-2 duration-300">
              <div className="flex justify-between items-center mb-4 px-2">
                <h4 className="font-black text-gray-900 uppercase text-[10px] tracking-widest">Logs Recentes</h4>
                <Activity className="w-3 h-3 text-blue-600" />
              </div>
              <div className="space-y-2">
                {recentLogs.length > 0 ? recentLogs.map((log, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-2xl hover:bg-blue-50 transition-colors cursor-pointer group">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-tighter mb-0.5">{log.action}</p>
                    <p className="text-[11px] text-gray-600 font-medium leading-tight group-hover:text-gray-900">{log.details}</p>
                    <p className="text-[9px] text-gray-400 mt-1">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                )) : (
                  <p className="text-[10px] text-gray-400 text-center py-4 italic">Nenhuma atividade recente.</p>
                )}
              </div>
              <button onClick={() => handleNav('reports')} className="w-full mt-3 py-3 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50 rounded-xl transition-colors">Ver todos os logs</button>
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-gray-100"></div>

        <div className="relative" ref={profileRef}>
          <div 
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 cursor-pointer group p-1 pr-3 rounded-2xl hover:bg-gray-50 transition-all"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{adminProfile.name}</p>
              <p className="text-[9px] text-gray-400 font-black uppercase tracking-tighter leading-none">Administrador Senior</p>
            </div>
            <div className="w-10 h-10 rounded-2xl border-2 border-transparent group-hover:border-blue-200 transition-all overflow-hidden shadow-sm">
              <img src={adminProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showProfile ? 'rotate-180 text-blue-600' : ''}`} />
          </div>

          {showProfile && (
            <div className="absolute right-0 mt-4 w-60 bg-white rounded-[32px] shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-top-2 duration-300">
              <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                <p className="text-xs font-black text-gray-900 uppercase tracking-tighter">Conta Corporativa</p>
                <p className="text-[10px] text-gray-500 truncate mt-1">{adminProfile.email}</p>
              </div>
              <div className="p-2">
                <button 
                  onClick={() => handleNav('profile')}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-xs text-gray-700 font-bold hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-all"
                >
                  <User className="w-4 h-4" /> Perfil
                </button>
                <button 
                  onClick={() => handleNav('settings')}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-xs text-gray-700 font-bold hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-all"
                >
                  <SettingsIcon className="w-4 h-4" /> Configurações
                </button>
                <div className="h-px bg-gray-50 my-1 mx-2"></div>
                <button 
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-xs text-red-500 font-black uppercase tracking-widest hover:bg-red-50 rounded-2xl transition-all"
                >
                  <LogOut className="w-4 h-4" /> Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
