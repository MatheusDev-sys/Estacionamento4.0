
import React, { useState, useEffect } from 'react';
import { MessageCircle, ShieldCheck, ChevronLeft, MapPin, ShieldAlert, User as UserIcon, Loader2, FileText, X, CheckCircle, Shield, Info, AlertTriangle, Home } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface PublicProfileProps {
  id: string;
  onBack: () => void;
}

const PublicProfile: React.FC<PublicProfileProps> = ({ id, onBack }) => {
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState({ wa_message_template: '', terms_of_use: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showLgpd, setShowLgpd] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: userData, error: userError } = await supabase
          .from('parking_users')
          .select('*, vehicles(*)')
          .eq('id', id)
          .maybeSingle();

        const { data: settingsData } = await supabase.from('system_settings').select('*').eq('id', 1).maybeSingle();
        
        if (userError || !userData) {
          setError(true);
        } else {
          setUser(userData);
        }
        
        if (settingsData) setSettings(settingsData);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleWhatsApp = () => {
    if (!user || !settings.wa_message_template) return;
    let message = settings.wa_message_template
      .replace('[NOME]', user.name)
      .replace('[PLACA]', user.vehicles?.[0]?.plate || 'VEÍCULO');
    window.open(`https://wa.me/55${user.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) return (
    <div className="h-screen bg-[#020817] flex flex-col items-center justify-center">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
      <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Validando Credencial...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#020817] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-red-500/10 p-8 rounded-[40px] border border-red-500/20 max-w-sm w-full">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-6" />
        <h2 className="text-2xl font-black text-white font-poppins tracking-tighter uppercase mb-4">Acesso Negado</h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-8">
          Esta credencial QR Code é inválida ou foi desativada pelo administrador do sistema.
        </p>
        <button 
          onClick={onBack}
          className="w-full bg-white text-gray-950 py-5 rounded-[28px] font-black uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center gap-3"
        >
          <Home className="w-4 h-4" /> Voltar ao Início
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020817] flex flex-col items-center justify-center p-6 font-inter overflow-hidden relative">
      <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent pointer-events-none"></div>

      <div className="animated-border max-w-md w-full rounded-[60px] reveal group">
        <div className="relative bg-white rounded-[58px] overflow-hidden shadow-2xl z-10">
          <div className="bg-gradient-tech p-12 text-center text-white relative">
            <button onClick={onBack} className="absolute top-8 left-8 p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all backdrop-blur-xl border border-white/10 active:scale-90">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="w-20 h-20 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[32px] mx-auto flex items-center justify-center mb-8 shadow-2xl">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-black font-poppins tracking-tighter uppercase leading-none mb-2">
              {user.vehicles?.[0]?.plate || 'CENTRO 4.0'}
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-60">Estacionamento Industrial</p>
          </div>

          <div className="p-10 space-y-10">
            <div className="bg-gray-50/80 rounded-[48px] p-10 border border-gray-100 text-center space-y-4 shadow-inner">
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${user.type === 'Colaborador' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                <UserIcon className="w-3.5 h-3.5" />
                {user.type}
              </div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">{user.name}</h2>
              <div className="flex items-center justify-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                <MapPin className="w-4 h-4 text-blue-600" /> Unidade Centro 4.0
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-5 bg-blue-50/50 rounded-3xl border border-blue-100/50 flex items-center gap-4">
                 <div className="bg-white p-2.5 rounded-2xl shadow-sm text-blue-600"><Info className="w-4 h-4" /></div>
                 <p className="text-[11px] font-bold text-blue-900 leading-tight">Este veículo impede sua saída? Clique abaixo para alertar o proprietário agora.</p>
              </div>

              <button 
                onClick={handleWhatsApp}
                className="w-full bg-green-500 text-white py-6 rounded-[32px] font-black text-lg shadow-[0_20px_40px_-10px_rgba(34,197,94,0.4)] hover:bg-green-600 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 group"
              >
                <MessageCircle className="w-7 h-7 group-hover:rotate-12 transition-transform" />
                Solicitar Saída
              </button>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-center">
               <button 
                type="button"
                onClick={() => setShowLgpd(true)}
                className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-600 transition-all py-3 hover:scale-105"
              >
                <ShieldAlert className="w-4 h-4" /> Privacidade e LGPD
              </button>
            </div>
          </div>
        </div>
      </div>

      {showLgpd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-950/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[48px] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-500 border border-white/20">
            <div className="bg-gradient-tech p-10 text-white flex justify-between items-center relative overflow-hidden">
               <Shield className="absolute -right-8 -bottom-8 w-32 h-32 opacity-10 rotate-12 pointer-events-none" />
               <div className="flex items-center gap-5 relative z-10">
                  <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black font-poppins tracking-tighter uppercase leading-none">Dados Protegidos</h2>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60 mt-1">Conformidade Centro 4.0</p>
                  </div>
               </div>
               <button onClick={() => setShowLgpd(false)} className="p-3 hover:bg-white/10 rounded-full transition-all relative z-10 active:scale-90">
                 <X className="w-6 h-6" />
               </button>
            </div>

            <div className="p-10 space-y-8">
              <div className="space-y-4">
                 <div className="p-6 bg-blue-50/50 rounded-[32px] border border-blue-100/30 flex items-start gap-4">
                    <div className="p-2.5 bg-white rounded-xl text-blue-600 shadow-sm shrink-0">
                       <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1">Criptografia de Nível Bancário</p>
                       <p className="text-xs text-blue-800/60 leading-relaxed font-medium">Informações resguardadas por segurança AES-256 bits, garantindo integridade de nível bancário.</p>
                    </div>
                 </div>

                 <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100 flex items-start gap-4">
                    <div className="p-2.5 bg-white rounded-xl text-gray-400 shadow-sm shrink-0">
                       <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-1">Finalidade Única</p>
                       <p className="text-xs text-gray-600 leading-relaxed font-medium">Dados utilizados apenas para facilitar a movimentação veicular interna, conforme a LGPD.</p>
                    </div>
                 </div>
              </div>

              <button 
                onClick={() => setShowLgpd(false)}
                className="w-full bg-gray-900 text-white py-5 rounded-[28px] font-black uppercase text-[10px] tracking-[0.4em] hover:bg-black transition-all shadow-xl hover:-translate-y-1 active:translate-y-0"
              >
                Voltar para o Perfil
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-12 flex flex-col items-center gap-4 opacity-40 select-none pb-8 text-center">
         <p className="text-[10px] font-black text-white uppercase tracking-[1em] mb-1">Centro 4.0 Industrial</p>
         <p className="text-[8px] font-bold text-blue-500 uppercase tracking-[0.5em]">Smart Parking Management System</p>
      </div>
    </div>
  );
};

export default PublicProfile;
