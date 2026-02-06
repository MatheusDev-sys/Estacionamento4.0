
import React, { useState, useEffect } from 'react';
import { Search, Printer, Copy, Check, QrCode as QrIcon, ShieldCheck, Users, Loader2, ExternalLink } from 'lucide-react';
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

  const generatePublicLink = (user: any) => {
    return `${window.location.origin}/?profile=${user.id}`;
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
        {/* Sidebar de Seleção */}
        <div className="lg:col-span-4 space-y-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900 font-poppins tracking-tight uppercase">Impressão QR</h1>
            <p className="text-gray-500 text-sm font-medium">Credenciais oficiais Centro 4.0.</p>
          </div>
          
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Pesquisar por nome..."
              className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-100 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-[40px] border border-gray-100 h-[500px] overflow-y-auto shadow-sm">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>
            ) : filteredUsers.length > 0 ? (
              <div className="p-2 space-y-1">
                {filteredUsers.map(user => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`w-full p-4 flex items-center gap-4 rounded-[28px] transition-all text-left ${selectedUser?.id === user.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'hover:bg-gray-50'}`}
                  >
                    <div className={`w-12 h-12 rounded-[20px] flex items-center justify-center font-black text-sm shrink-0 ${selectedUser?.id === user.id ? 'bg-white/20 text-white' : (user.type === 'Colaborador' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600')}`}>
                      {user.name.charAt(0)}
                    </div>
                    <div className="truncate">
                      <p className={`text-sm font-bold truncate ${selectedUser?.id === user.id ? 'text-white' : 'text-gray-800'}`}>{user.name}</p>
                      <p className={`text-[10px] font-mono tracking-tighter uppercase ${selectedUser?.id === user.id ? 'text-white/60' : 'text-gray-400'}`}>
                        {user.vehicles?.[0]?.plate || 'SEM PLACA'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-30">
                 <Users className="w-12 h-12 mb-3" />
                 <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">Nenhum registro ativo</p>
              </div>
            )}
          </div>
        </div>

        {/* Visualização e Ações */}
        <div className="lg:col-span-8">
          {selectedUser ? (
            <div className="bg-white p-12 rounded-[56px] border border-gray-100 shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                <ShieldCheck className="w-96 h-96 -rotate-12" />
              </div>

              <div id="qr-card" className="w-full max-w-[380px] border-[14px] border-gray-950 p-10 rounded-[64px] bg-white flex flex-col items-center text-center space-y-8 shadow-2xl relative z-10">
                <div className="w-full flex flex-col items-center border-b-2 border-gray-50 pb-8">
                  <div className="bg-blue-600 p-4 rounded-3xl mb-4 shadow-2xl shadow-blue-100">
                    <ShieldCheck className="text-white w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-950 uppercase tracking-tighter leading-none">Estacionamento</h2>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.5em] mt-2">Centro 4.0 Industrial</p>
                </div>

                <div className="bg-white p-6 rounded-[48px] border-[6px] border-gray-950 shadow-inner group transition-transform hover:scale-105 duration-500">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(generatePublicLink(selectedUser))}`} 
                    alt="QR Code WA" 
                    className="w-48 h-48"
                  />
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">Placa Oficial</p>
                  <p className="text-4xl font-black text-gray-950 font-mono tracking-tighter uppercase bg-gray-50 px-6 py-2 rounded-2xl">
                    {selectedUser.vehicles?.[0]?.plate || "ABC-0000"}
                  </p>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest pt-2">{selectedUser.name}</p>
                </div>

                <div className="pt-6 border-t border-gray-50 w-full">
                  <p className="text-[9px] font-black text-gray-400 uppercase leading-relaxed px-6 tracking-tight">
                    Em caso de obstrução, aponte a câmera e solicite a saída imediata.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12 w-full max-w-[380px]">
                <button 
                  onClick={() => window.print()}
                  className="flex items-center justify-center gap-3 py-5 bg-gray-950 text-white rounded-[28px] font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-2xl shadow-gray-200 hover:-translate-y-1 active:translate-y-0"
                >
                  <Printer className="w-5 h-5" /> Imprimir Card
                </button>
                <button 
                  onClick={copyLink}
                  className={`flex items-center justify-center gap-3 py-5 rounded-[28px] font-black uppercase text-[10px] tracking-widest transition-all hover:-translate-y-1 active:translate-y-0 ${copied ? 'bg-green-500 text-white shadow-green-100' : 'bg-blue-50 text-blue-600 shadow-blue-50'}`}
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  {copied ? 'Link Copiado!' : 'Copiar Link'}
                </button>
              </div>

              <div className="mt-8 flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <ExternalLink className="w-3 h-3" />
                Dica: O link acima permite testar o perfil no computador.
              </div>
            </div>
          ) : (
            <div className="h-full bg-gray-50 rounded-[56px] border-4 border-dashed border-gray-200 flex flex-col items-center justify-center text-center p-12 opacity-50">
              <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center shadow-xl mb-8">
                <QrIcon className="w-12 h-12 text-gray-300" />
              </div>
              <h3 className="text-xl font-black text-gray-400 font-poppins uppercase tracking-tight">Central de Emissões</h3>
              <p className="text-sm text-gray-400 max-w-xs mt-3 font-medium leading-relaxed">Selecione um colaborador ativo na lista lateral para gerar sua credencial oficial de acesso.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QrCodes;
