
import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, ShieldAlert, X, User as UserIcon, Loader2, ShieldCheck, ShieldX, Ban } from 'lucide-react';
import { User, UserRole } from '../types';
import { supabase } from '../supabaseClient';

interface ManagementProps {
  searchTerm?: string;
}

const Management: React.FC<ManagementProps> = ({ searchTerm = '' }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [roleToggle, setRoleToggle] = useState<UserRole>('Colaborador');
  const [editingUser, setEditingUser] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    idNumber: '',
    plate: '',
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('parking_users')
        .select('*, vehicles(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleBlockStatus = async (user: any) => {
    const isCurrentlyBlocked = user.status === 'Bloqueado';
    const newStatus = isCurrentlyBlocked ? 'Ativo' : 'Bloqueado';
    const confirmMsg = isCurrentlyBlocked 
      ? `Reativar acesso de ${user.name}?`
      : `BLOQUEAR acesso de ${user.name}? O QR Code ficará inativo imediatamente.`;

    if (confirm(confirmMsg)) {
      try {
        await supabase.from('parking_users').update({ status: newStatus }).eq('id', user.id);
        
        // Registrar log de segurança
        const { data: { user: admin } } = await supabase.auth.getUser();
        await supabase.from('audit_logs').insert([{
          profile_id: admin?.id,
          action: isCurrentlyBlocked ? 'Desbloqueio' : 'BLOQUEIO',
          details: `${isCurrentlyBlocked ? 'Acesso reativado' : 'ACESSO REVOGADO'} para: ${user.name}`
        }]);

        fetchUsers();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const maskPhone = (v: string) => v.replace(/\D/g, '').replace(/^(\d{2})(\d)/g, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2").substring(0, 15);
  const maskPlate = (v: string) => {
    const clean = v.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (clean.length <= 3) return clean;
    return `${clean.substring(0, 3)}-${clean.substring(3, 7)}`;
  };

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({ name: '', phone: '', idNumber: '', plate: '' });
    setRoleToggle('Colaborador');
    setShowModal(true);
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setRoleToggle(user.type);
    setFormData({
      name: user.name,
      phone: user.phone,
      idNumber: user.type === 'Colaborador' ? user.registration || '' : user.cpf || '',
      plate: user.vehicles[0]?.plate || '',
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const userData = {
        name: formData.name,
        phone: formData.phone,
        type: roleToggle,
        registration: roleToggle === 'Colaborador' ? formData.idNumber : null,
        cpf: roleToggle === 'Visitante' ? formData.idNumber : null,
        status: editingUser ? editingUser.status : 'Ativo',
      };

      let userId = editingUser?.id;

      if (editingUser) {
        await supabase.from('parking_users').update(userData).eq('id', userId);
        if (editingUser.vehicles?.[0]) {
          await supabase.from('vehicles').update({ plate: formData.plate.toUpperCase() }).eq('id', editingUser.vehicles[0].id);
        }
      } else {
        const { data: newUser, error: userError } = await supabase.from('parking_users').insert([userData]).select().single();
        if (userError) throw userError;
        userId = newUser.id;
        await supabase.from('vehicles').insert([{ parking_user_id: userId, plate: formData.plate.toUpperCase() }]);
      }

      setShowModal(false);
      fetchUsers();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteUser = async (id: string) => {
    if (confirm("Deseja realmente excluir permanentemente?")) {
      await supabase.from('parking_users').delete().eq('id', id);
      fetchUsers();
    }
  };

  const filtered = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-8 space-y-6 reveal">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 font-poppins tracking-tighter uppercase">Frequentadores</h1>
          <p className="text-gray-500 text-sm font-medium">Controle de acessos e status operacional.</p>
        </div>
        <button onClick={openAddModal} className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl shadow-blue-100 hover:bg-blue-700 hover:scale-105 transition-all">
          <Plus className="w-4 h-4" /> Novo Registro
        </button>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase font-black tracking-widest text-gray-400 bg-gray-50/50 border-b border-gray-50">
                <th className="px-8 py-5">Identificação</th>
                <th className="px-8 py-5">Tipo</th>
                <th className="px-8 py-5">Status Operacional</th>
                <th className="px-8 py-5 text-right">Ações de Segurança</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600 w-8 h-8" /></td></tr>
              ) : filtered.length > 0 ? filtered.map(u => (
                <tr key={u.id} className="hover:bg-blue-50/20 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-[20px] flex items-center justify-center font-black text-sm shrink-0 ${u.status === 'Bloqueado' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-950 text-sm leading-tight mb-1">{u.name}</p>
                        <p className="text-[10px] font-black font-mono text-gray-400 uppercase tracking-tighter">
                          Placa: <span className="text-gray-900">{u.vehicles?.[0]?.plate || '---'}</span>
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                     <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest inline-block ${u.type === 'Colaborador' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                       {u.type}
                     </span>
                  </td>
                  <td className="px-8 py-6">
                     <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${u.status === 'Bloqueado' ? 'bg-red-600 animate-pulse' : 'bg-green-500'}`}></div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${u.status === 'Bloqueado' ? 'text-red-600' : 'text-green-600'}`}>
                          {u.status || 'Ativo'}
                        </span>
                     </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                     <div className="flex justify-end gap-3">
                       {/* BOTÃO BLOQUEAR - DESTAQUE MÁXIMO */}
                       <button 
                        onClick={() => toggleBlockStatus(u)}
                        title={u.status === 'Bloqueado' ? "Reativar Acesso" : "BLOQUEAR AGORA"}
                        className={`p-4 rounded-2xl transition-all shadow-lg ${u.status === 'Bloqueado' ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-200' : 'bg-red-50 text-red-500 hover:bg-red-600 hover:text-white shadow-red-50 hover:shadow-red-200'}`}
                       >
                         {u.status === 'Bloqueado' ? <ShieldX className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                       </button>
                       
                       <div className="w-px h-10 bg-gray-100 mx-2"></div>

                       <button onClick={() => openEditModal(u)} className="p-4 bg-gray-50 rounded-2xl hover:bg-blue-600 hover:text-white text-gray-400 transition-all shadow-sm">
                         <Edit2 className="w-5 h-5" />
                       </button>
                       <button onClick={() => deleteUser(u.id)} className="p-4 bg-gray-50 rounded-2xl hover:bg-red-600 hover:text-white text-gray-400 transition-all shadow-sm">
                         <Trash2 className="w-5 h-5" />
                       </button>
                     </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="py-24 text-center opacity-30 font-black uppercase text-xs tracking-[0.5em]">Nenhum registro encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray-950/40 backdrop-blur-md animate-in fade-in duration-300">
          <form onSubmit={handleSave} className="bg-white w-full max-w-2xl rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
              <h2 className="text-2xl font-black text-gray-950 font-poppins uppercase tracking-tighter">Ficha Cadastral</h2>
              <button type="button" onClick={() => setShowModal(false)} className="p-4 hover:bg-gray-100 rounded-full transition-all active:scale-90"><X className="w-6 h-6 text-gray-400" /></button>
            </div>
            <div className="p-10 space-y-8">
              <div className="flex bg-gray-100 p-1.5 rounded-[24px]">
                <button type="button" onClick={() => setRoleToggle('Colaborador')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-[20px] transition-all ${roleToggle === 'Colaborador' ? 'bg-white text-blue-600 shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}>Colaborador</button>
                <button type="button" onClick={() => setRoleToggle('Visitante')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-[20px] transition-all ${roleToggle === 'Visitante' ? 'bg-white text-purple-600 shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}>Visitante</button>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-2">Nome Completo</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border-none rounded-[24px] p-5 text-sm outline-none font-bold focus:ring-4 focus:ring-blue-100 transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-2">WhatsApp</label>
                  <input required value={formData.phone} onChange={e => setFormData({...formData, phone: maskPhone(e.target.value)})} placeholder="(00) 00000-0000" className="w-full bg-gray-50 border-none rounded-[24px] p-5 text-sm font-bold" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-2">{roleToggle === 'Colaborador' ? 'Matrícula' : 'CPF'}</label>
                  <input required value={formData.idNumber} onChange={e => setFormData({...formData, idNumber: e.target.value})} className="w-full bg-gray-50 border-none rounded-[24px] p-5 text-sm font-bold" />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-2">Placa Veicular</label>
                  <input required value={formData.plate} onChange={e => setFormData({...formData, plate: maskPlate(e.target.value)})} placeholder="AAA-0000" className="w-full bg-gray-950 text-white rounded-[24px] p-5 text-xl font-black font-mono uppercase text-center focus:ring-4 focus:ring-blue-400 transition-all outline-none" />
                </div>
              </div>
              <button disabled={isSaving} className="w-full bg-blue-600 text-white py-6 rounded-[32px] font-black text-lg shadow-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
                {isSaving ? <Loader2 className="animate-spin" /> : editingUser ? 'Atualizar Registro' : 'Salvar Cadastro Industrial'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Management;
