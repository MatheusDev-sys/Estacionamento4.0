
import React, { useState, useEffect } from 'react';
import { Save, MessageSquare, Shield, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Settings: React.FC = () => {
  const [waMessage, setWaMessage] = useState("");
  const [terms, setTerms] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data, error } = await supabase.from('system_settings').select('*').eq('id', 1).single();
        if (data) {
          setWaMessage(data.wa_message_template);
          setTerms(data.terms_of_use);
        }
      } catch (err) {
        console.error("Erro ao carregar configurações:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('system_settings').update({
        wa_message_template: waMessage,
        terms_of_use: terms,
        updated_at: new Date()
      }).eq('id', 1);
      
      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert("Erro ao salvar configurações no banco de dados.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="max-w-4xl flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-poppins">Configurações do Sistema</h1>
          <p className="text-gray-500 text-sm">Personalize os templates e termos de uso do Centro 4.0.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : saved ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          {saved ? "Configurações Salvas" : "Salvar no Banco"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl">
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-[0.2em]">
            <MessageSquare className="w-5 h-5" />
            Template WhatsApp (Alerta)
          </div>
          <div className="space-y-4">
            <p className="text-[10px] text-gray-400 leading-relaxed font-bold uppercase">
              Use <span className="text-blue-600">[NOME]</span> e <span className="text-blue-600">[PLACA]</span> para campos dinâmicos.
            </p>
            <textarea 
              value={waMessage}
              onChange={(e) => setWaMessage(e.target.value)}
              className="w-full h-32 bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-purple-600 font-black text-xs uppercase tracking-[0.2em]">
            <Clock className="w-5 h-5" />
            Prazos Padrão
          </div>
          <div className="p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Configuração de expiração automática</p>
             <p className="text-[10px] text-gray-400 mt-2">Em desenvolvimento para V2.0</p>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-red-600 font-black text-xs uppercase tracking-[0.2em]">
            <Shield className="w-5 h-5" />
            LGPD & Termos de Uso (Página QR)
          </div>
          <div className="space-y-4">
            <p className="text-xs text-gray-500 leading-relaxed">
              Este texto aparece no rodapé da página pública quando alguém escaneia o QR Code.
            </p>
            <textarea 
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              className="w-full h-40 bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
