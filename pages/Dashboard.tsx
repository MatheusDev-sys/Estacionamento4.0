
import React, { useState, useEffect } from 'react';
import { Users, QrCode, ShieldAlert, Clock, Loader2, AlertTriangle, ArrowUpRight, History } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Dashboard: React.FC = () => {
  const [counts, setCounts] = useState({
    colaboradores: 0,
    visitantes: 0,
    qrcodes: 0,
    bloqueios: 0,
    expiringSoon: 0
  });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const { data: users } = await supabase.from('parking_users').select('type, status, valid_until');
        const { count: vehiclesCount } = await supabase.from('vehicles').select('*', { count: 'exact', head: true });
        const { data: logs } = await supabase.from('audit_logs').select('*, profiles(name)').order('timestamp', { ascending: false }).limit(5);

        if (users) {
          const now = new Date();
          const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
          
          const expiring = users.filter(u => {
            if (!u.valid_until) return false;
            const validUntil = new Date(u.valid_until);
            return validUntil > now && validUntil <= twoHoursFromNow;
          }).length;

          setCounts({
            colaboradores: users.filter(u => u.type === 'Colaborador').length,
            visitantes: users.filter(u => u.type === 'Visitante').length,
            qrcodes: vehiclesCount || 0,
            bloqueios: users.filter(u => u.status === 'Bloqueado').length,
            expiringSoon: expiring
          });
        }
        if (logs) setRecentLogs(logs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const stats = [
    { label: 'Colaboradores', value: counts.colaboradores, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', shadow: 'shadow-blue-100/50' },
    { label: 'Visitantes Hoje', value: counts.visitantes, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50', shadow: 'shadow-purple-100/50' },
    { label: 'QR Codes Ativos', value: counts.qrcodes, icon: QrCode, color: 'text-orange-600', bg: 'bg-orange-50', shadow: 'shadow-orange-100/50' },
    { label: 'Vencendo em breve', value: counts.expiringSoon, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', shadow: 'shadow-amber-100/50' },
  ];

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 font-poppins tracking-tight">Painel Executivo</h1>
          <p className="text-gray-500 text-sm font-medium">Sincronização Industry 4.0 em tempo real.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
          Sistema Online
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className={`bg-white p-7 rounded-[32px] border border-gray-50 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group cursor-default`}>
            <div className={`${stat.bg} ${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500`}>
              <stat.icon className="w-7 h-7" />
            </div>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{stat.label}</p>
            {loading ? (
              <Loader2 className="w-6 h-6 text-gray-200 animate-spin mt-2" />
            ) : (
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-black text-gray-900 tracking-tighter">{stat.value}</h3>
                <ArrowUpRight className="w-4 h-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-gray-50 shadow-sm hover:shadow-xl transition-shadow duration-500 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
            <QrCode className="w-64 h-64 -rotate-12" />
          </div>
          <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest mb-8 flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-blue-600" /> Fluxo Analítico
          </h3>
          <div className="h-[300px] w-full flex items-center justify-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100 group">
             <div className="text-center group-hover:scale-105 transition-transform">
               <History className="w-10 h-10 text-gray-200 mx-auto mb-4" />
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Aguardando telemetria avançada</p>
               <p className="text-[9px] text-gray-300 mt-1 uppercase">Histórico de acessos em processamento</p>
             </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-gray-50 shadow-sm flex flex-col hover:shadow-xl transition-shadow duration-500">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600" /> Auditoria Local
            </h3>
            <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg uppercase">Live</span>
          </div>

          <div className="flex-1 space-y-4">
            {recentLogs.length > 0 ? recentLogs.map((log, i) => (
              <div key={i} className="flex gap-4 p-4 hover:bg-gray-50 rounded-3xl transition-colors group cursor-pointer border border-transparent hover:border-gray-100">
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0 group-hover:scale-150 transition-transform"></div>
                <div>
                  <p className="text-xs font-bold text-gray-800 leading-tight">{log.details}</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase mt-1 tracking-tighter">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {log.profiles?.name || 'Sistema'}
                  </p>
                </div>
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-10">
                <History className="w-10 h-10 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">Sem violações</p>
              </div>
            )}
          </div>
          
          <button className="w-full mt-6 py-5 bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-[24px] hover:bg-black hover:shadow-lg hover:-translate-y-1 transition-all">
            Relatório de Conformidade
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
