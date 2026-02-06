
import React, { useState, useEffect } from 'react';
import { Search, Printer, Copy, Check, QrCode as QrIcon, ShieldCheck, Users, Loader2, ExternalLink, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

const QrCodes: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadUsers() {
      try {
        const { data } = await supabase
          .from('parking_users')
          .select('*, vehicles(*)')
          .eq('status', 'Ativo');
        if (data) setUsers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Geração de link ultra-segura para GitHub Pages
  const generatePublicLink = (user: any) => {
    // Pegamos a URL base sem os parâmetros de busca atuais
    const baseUrl = window.location.href.split('?')[0].split('#')[0];
    const cleanBase = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
    return `${cleanBase}?profile=${user.id}`;
  };

  const copyLink = () => {
    if (!selectedUser) return;
    const link = generatePublicLink(selectedUser);
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Lista de Usuários */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
            <h1 className="text-xl font-black text-gray-900 font-poppins uppercase tracking-tight">Emissor de Credenciais</h1>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">Centro 4.0 Industrial</p>
          </div>
          
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Pesquisar..."
              className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-4 focus:ring-blue-50 transition-all shadow-sm font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-[40px] border border-gray-100 h-[450px] overflow-y-auto shadow-sm p-2 custom-scrollbar">
            {loading ? (
              <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full p-4 flex items-center gap-4 rounded-[28px] transition-all text-left mb-1 ${selectedUser?.id === user.id ? 'bg-blue-600 text-white shadow-xl scale-[1.02]' : 'hover:bg-gray-50'}`}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 ${selectedUser?.id === user.id ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'}`}>
                    {user.name.charAt(0)}
                  </div>
                  <div className="truncate">
                    <p className={`text-xs font-bold truncate ${selectedUser?.id === user.id ? 'text-white' : 'text-gray-800'}`}>{user.name}</p>
                    <p className={`text-[9px] font-black font-mono tracking-tighter uppercase ${selectedUser?.id === user.id ? 'text-white/60' : 'text-gray-400'}`}>
                      {user.vehicles?.[0]?.plate || '---'}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 opacity-20 text-center">
                 <Users className="w-12 h-12 mb-3" />
                 <p className="text-[10px] font-black uppercase tracking-widest">Vazio</p>
              </div>
            )}
          </div>
        </div>

        {/* Card do QR Code */}
        <div className="lg:col-span-8">
          {selectedUser ? (
            <div className="space-y-6">
              <div className="bg-white p-12 rounded-[56px] border border-gray-100 shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                  <ShieldCheck className="w-96 h-96 -rotate-12" />
                </div>

                <div id="qr-card" className="w-full max-w-[360px] border-[14px] border-gray-950 p-10 rounded-[64px] bg-white flex flex-col items-center text-center space-y-8 shadow-2xl relative z-10">
                  <div className="w-full flex flex-col items-center border-b-2 border-gray-50 pb-8">
                    <div className="bg-blue-600 p-4 rounded-3xl mb-4 shadow-2xl shadow-blue-100">
                      <ShieldCheck className="text-white w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-950 uppercase tracking-tighter leading-none">Credencial</h2>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.5em] mt-2">Centro 4.0</p>
                  </div>

                  <div className="bg-white p-5 rounded-[44px] border-[6px] border-gray-950 shadow-inner">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(generatePublicLink(selectedUser))}`} 
                      alt="QR Code" 
                      className="w-44 h-44"
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">Placa Registrada</p>
                    <p className="text-4xl font-black text-gray-950 font-mono tracking-tighter uppercase bg-gray-50 px-6 py-2 rounded-2xl">
                      {selectedUser.vehicles?.[0]?.plate || "ABC-0000"}
                    </p>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest pt-2">{selectedUser.name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12 w-full max-w-[360px]">
                  <button 
                    onClick={() => window.print()}
                    className="flex items-center justify-center gap-3 py-5 bg-gray-950 text-white rounded-[28px] font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-2xl"
                  >
                    <Printer className="w-5 h-5" /> Imprimir
                  </button>
                  <button 
                    onClick={copyLink}
                    className={`flex items-center justify-center gap-3 py-5 rounded-[28px] font-black uppercase text-[10px] tracking-widest transition-all ${copied ? 'bg-green-500 text-white' : 'bg-blue-50 text-blue-600'}`}
                  >
                    {copied ? <Check className="w-5 h-5" /> : <ExternalLink className="w-5 h-5" />}
                    {copied ? 'Link Copiado' : 'Link Público'}
                  </button>
                </div>
              </div>

              {/* Informação do Link (Para Debug) */}
              <div className="bg-amber-50 p-6 rounded-[32px] border border-amber-100 flex items-start gap-4">
                 <AlertCircle className="text-amber-600 w-5 h-5 shrink-0" />
                 <div>
                    <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1">Link Gerado no QR Code:</p>
                    <p className="text-[11px] font-mono text-amber-800 break-all bg-white/50 p-2 rounded-lg">{generatePublicLink(selectedUser)}</p>
                 </div>
              </div>
            </div>
          ) : (
            <div className="h-full bg-gray-50 rounded-[56px] border-4 border-dashed border-gray-200 flex flex-col items-center justify-center text-center p-12 opacity-50">
              <QrIcon className="w-16 h-16 text-gray-200 mb-8" />
              <h3 className="text-lg font-black text-gray-400 font-poppins uppercase tracking-tight">Selecione um Usuário</h3>
              <p className="text-xs text-gray-400 max-w-xs mt-2 font-medium">A credencial será gerada automaticamente com o link público de acesso.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QrCodes;
