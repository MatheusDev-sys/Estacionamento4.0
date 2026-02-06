
import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, ShieldAlert, X, User as UserIcon, Briefcase, Loader2, Calendar, Clock } from 'lucide-react';
import { User, UserRole, UserStatus } from '../types';
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
    validFrom: '',
    validUntil: '',
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

  const maskPhone = (v: string) => v.replace(/\D/g, '').replace(/^(\d{2})(\d)/g, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2").substring(0, 15);
  const maskCPF = (v: string) => v.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2').substring(0, 14);
  const maskPlate = (v: string) => {
    const clean = v.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (clean.length <= 3) return clean;
    return `${clean.substring(0, 3)}-${clean.substring(3, 7)}`;
  };

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({ 
      name: '', 
      phone: '', 
      idNumber: '', 
      plate: '', 
      validFrom: new Date().toISOString().slice(0, 16),
      validUntil: '' 
    });
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
      validFrom: user.valid_from ? new Date(user.valid_from).toISOString().slice(0, 16) : '',
      validUntil: user.valid_until ? new Date(user.valid_until).toISOString().slice(0, 16) : '',
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
        valid_from: roleToggle === 'Visitante' ? formData.validFrom : null,
        valid_until: roleToggle === 'Visitante' ? formData.validUntil : null,
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

        const { data: { user: admin } } = await supabase.auth.getUser();
        await supabase.from('audit_logs').insert([{
          profile_id: admin?.id,
          action: 'Cadastro',
          details: `Novo ${roleToggle} cadastrado: ${formData.name}`
        }]);
      }

      setShowModal(false);
      fetchUsers();
    } catch (error) {
      alert("Erro ao salvar no banco de dados.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteUser = async (id: string) => {
    if (confirm("Deseja realmente excluir?")) {
      await supabase.from('parking_users').delete().eq('id', id);
      fetchUsers();
    }
  };

  const filtered = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-8 space-y-6 reveal">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 font-poppins">Gestão de Frequentadores</h1>
          <p className="text-gray-500 text-sm">Controle total de acessos do Centro 4.0.</p>
        </div>
        <button onClick={openAddModal} className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl shadow-blue-100 hover:bg-blue-700 hover:scale-105 transition-all">
          <Plus className="w-4 h-4" /> Novo Registro
        </button>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] uppercase font-black tracking-widest text-gray-400 bg-gray-50/50 border-b border-gray-50">
              <th className="px-8 py-5">Nome / Placa</th>
              <th className="px-8 py-5">Tipo</th>
              <th className="px-8 py-5">Validade</th>
              <th className="px-8 py-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></td></tr>
            ) : filtered.map(u => (
              <tr key={u.id} className="hover:bg-blue-50/20 transition-all group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center font-black text-sm ${u.type === 'Colaborador' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{u.name}</p>
                      <p className="text-[10px] font-mono text-gray-400 uppercase">{u.vehicles?.[0]?.plate || '---'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                   <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${u.type === 'Colaborador' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                     {u.type}
                   </span>
                </td>
                <td className="px-8 py-5">
                   <div className="text-[10px] font-bold text-gray-500 uppercase">
                     {u.type === 'Colaborador' ? 'Ilimitado' : (
                       u.valid_until ? `Expira: ${new Date(u.valid_until).toLocaleDateString()}` : 'Não definida'
                     )}
                   </div>
                </td>
                <td className="px-8 py-5 text-right">
                   <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button onClick={() => openEditModal(u)} className="p-3 bg-gray-50 rounded-xl hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-all"><Edit2 className="w-4 h-4" /></button>
                     <button onClick={() => deleteUser(u.id)} className="p-3 bg-gray-50 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all"><Trash2 className="w-4 h-4" /></button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <form onSubmit={handleSave} className="bg-white w-full max-w-2xl rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-10 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-2xl font-black text-gray-900 font-poppins tracking-tighter">
                {editingUser ? 'Atualizar Registro' : 'Novo Frequentador'}
              </h2>
              <button type="button" onClick={() => setShowModal(false)} className="p-3 hover:bg-gray-100 rounded-full transition-colors"><X /></button>
            </div>
            
            <div className="p-10 space-y-8">
              <div className="flex bg-gray-100 p-1.5 rounded-[24px]">
                <button type="button" onClick={() => setRoleToggle('Colaborador')} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-[20px] transition-all ${roleToggle === 'Colaborador' ? 'bg-white text-blue-600 shadow-xl' : 'text-gray-400'}`}>Colaborador</button>
                <button type="button" onClick={() => setRoleToggle('Visitante')} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-[20px] transition-all ${roleToggle === 'Visitante' ? 'bg-white text-purple-600 shadow-xl' : 'text-gray-400'}`}>Visitante</button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Nome Completo</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-5 text-sm focus:ring-4 focus:ring-blue-100 transition-all outline-none" />
                </div>
                
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">WhatsApp</label>
                  <input required value={formData.phone} onChange={e => setFormData({...formData, phone: maskPhone(e.target.value)})} placeholder="(00) 00000-0000" className="w-full bg-gray-50 border-none rounded-2xl p-5 text-sm outline-none" />
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">{roleToggle === 'Colaborador' ? 'Matrícula' : 'CPF'}</label>
                  <input required value={formData.idNumber} onChange={e => setFormData({...formData, idNumber: roleToggle === 'Visitante' ? maskCPF(e.target.value) : e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-5 text-sm outline-none" />
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Placa do Veículo</label>
                  <input required value={formData.plate} onChange={e => setFormData({...formData, plate: maskPlate(e.target.value)})} placeholder="AAA-0000" className="w-full bg-gray-50 border-none rounded-2xl p-5 text-sm font-mono uppercase outline-none" />
                </div>

                {roleToggle === 'Visitante' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Início Acesso</label>
                      <input type="datetime-local" value={formData.validFrom} onChange={e => setFormData({...formData, validFrom: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Fim Acesso (Expiração)</label>
                      <input type="datetime-local" value={formData.validUntil} onChange={e => setFormData({...formData, validUntil: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm outline-none" />
                    </div>
                  </>
                )}
              </div>

              <button disabled={isSaving} className="w-full bg-blue-600 text-white py-6 rounded-[32px] font-black text-lg shadow-2xl shadow-blue-100 hover:bg-blue-700 hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
                {isSaving ? <Loader2 className="animate-spin" /> : editingUser ? 'Atualizar Dados' : 'Finalizar Cadastro'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Management;
