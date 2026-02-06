
import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Lock, Mail, AlertCircle, ShieldAlert, Loader2, X, FileText, CheckCircle, Shield } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showLgpd, setShowLgpd] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      onLogin();
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative bg-[#020817] overflow-hidden">
      {/* Luzes de fundo */}
      <div className="absolute top-[-30%] left-[-20%] w-full h-full bg-blue-600/10 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-md w-full glass-effect rounded-[56px] p-12 shadow-2xl relative z-10 border border-white/10 bg-white/95 reveal">
        <div className="flex flex-col items-center mb-10">
          <div className="mb-6">
            <img src="logo.png" alt="Centro 4.0" className="w-48 h-auto" />
          </div>
          <p className="text-blue-600 text-[11px] font-black uppercase tracking-[0.4em] mt-2">Gestor de Estacionamento</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold animate-pulse">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-2 block">Acesso Restrito (Email)</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-50 border-none rounded-[24px] py-5 pl-14 pr-4 text-sm outline-none focus:ring-4 focus:ring-blue-100 transition-all" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-2 block">Senha de Segurança</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-gray-50 border-none rounded-[24px] py-5 pl-14 pr-4 text-sm outline-none focus:ring-4 focus:ring-blue-100 transition-all" />
            </div>
          </div>

          <button disabled={loading} className="w-full bg-blue-600 text-white py-6 rounded-[32px] font-black text-lg shadow-2xl shadow-blue-100 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group">
            {loading ? <Loader2 className="animate-spin" /> : 'Acessar Painel'}
            {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-gray-100 text-center">
           <button 
            type="button"
            onClick={() => setShowLgpd(true)}
            className="inline-flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-600 transition-all py-2 hover:scale-105"
           >
              <ShieldAlert className="w-4 h-4" /> Transparência e LGPD
           </button>
        </div>
      </div>

      {/* MODAL POPUP LGPD COMPACTO E BONITO */}
      {showLgpd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-950/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[48px] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-500 border border-white/20">
            <div className="bg-gradient-tech p-10 text-white flex justify-between items-center relative overflow-hidden">
               <Shield className="absolute -right-8 -bottom-8 w-32 h-32 opacity-10 rotate-12 pointer-events-none" />
               <div className="flex items-center gap-4 relative z-10">
                  <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black font-poppins tracking-tighter uppercase leading-none">Segurança Centro 4.0</h2>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60 mt-1">Selo de Integridade Digital</p>
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
                       <p className="text-xs text-blue-800/60 leading-relaxed font-medium">Dados protegidos por AES-256 bits, o mesmo padrão utilizado em instituições financeiras globais.</p>
                    </div>
                 </div>

                 <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100 flex items-start gap-4">
                    <div className="p-2.5 bg-white rounded-xl text-gray-400 shadow-sm shrink-0">
                       <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-1">Privacidade LGPD</p>
                       <p className="text-xs text-gray-600 leading-relaxed font-medium">Processamos apenas o essencial para a identificação veicular, sem compartilhamento com terceiros.</p>
                    </div>
                 </div>
              </div>

              <button 
                onClick={() => setShowLgpd(false)}
                className="w-full bg-gray-900 text-white py-5 rounded-[28px] font-black uppercase text-[10px] tracking-[0.4em] hover:bg-black transition-all shadow-xl hover:-translate-y-1 active:translate-y-0"
              >
                Voltar ao Início
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
