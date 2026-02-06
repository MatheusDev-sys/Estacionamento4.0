
import React, { useState, useEffect } from 'react';
import { User, Shield, Mail, Phone, Save, Camera, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Profile: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (data) {
            setFormData({
              name: data.name,
              email: data.email,
              phone: data.phone || '',
              role: data.role || 'Administrador'
            });
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({
          name: formData.name,
          phone: formData.phone,
          updated_at: new Date()
        }).eq('id', user.id);
        
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-800 font-poppins">Meu Perfil Administrativo</h1>
        <p className="text-gray-500 text-sm">Suas informações de acesso sincronizadas com o banco de dados real.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl">
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col items-center text-center">
            <div className="relative group">
              <div className="w-32 h-32 rounded-[48px] bg-blue-100 border-4 border-white shadow-xl overflow-hidden">
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=0B5ED7&color=fff&size=200`} alt="Avatar" />
              </div>
              <div className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-2xl border-2 border-white shadow-lg">
                <Camera className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mt-6">{formData.name}</h3>
            <p className="text-blue-600 text-[10px] font-black uppercase tracking-widest mt-1">{formData.role}</p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Email Profissional</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    disabled
                    type="email" 
                    value={formData.email}
                    className="w-full bg-gray-100 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">WhatsApp de Contato</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Nível de Acesso</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    disabled
                    type="text" 
                    value={formData.role}
                    className="w-full bg-gray-100 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end items-center gap-4">
              {saved && (
                <span className="text-green-600 text-xs font-bold flex items-center gap-1 animate-pulse">
                  <CheckCircle className="w-4 h-4" /> Dados sincronizados!
                </span>
              )}
              <button 
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" /> : <Save className="w-5 h-5" />}
                Salvar Perfil
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
