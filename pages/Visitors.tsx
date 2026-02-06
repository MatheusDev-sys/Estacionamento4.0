
import React, { useState } from 'react';
import { UserPlus, Calendar, Clock, QrCode, Download, Share2, FileText, Loader2 } from 'lucide-react';

const Visitors: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showVoucher, setShowVoucher] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    plate: '',
    reason: '',
    validFrom: new Date().toISOString().slice(0, 16),
    duration: '4 horas'
  });

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowVoucher(true);
    }, 1200);
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-2xl font-black text-gray-900 font-poppins tracking-tighter uppercase leading-none">Vouchers de Acesso</h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">Geração de Identidade Temporária Centro 4.0</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Formulário de Voucher */}
          <div className="lg:col-span-7 bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm space-y-8">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-3 border-b border-gray-50 pb-6">
              <div className="bg-blue-600 p-2 rounded-lg"><UserPlus className="w-4 h-4 text-white" /></div>
              Configuração do Passe
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Nome do Visitante</label>
                <input
                  type="text"
                  placeholder="Ex: João da Silva"
                  className="w-full bg-gray-50 border-none rounded-[20px] px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Placa Veicular</label>
                <input
                  type="text"
                  placeholder="ABC-1234"
                  className="w-full bg-gray-50 border-none rounded-[20px] px-5 py-4 text-lg font-black font-mono uppercase focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                  value={formData.plate}
                  onChange={e => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Motivo / Empresa</label>
                <input
                  type="text"
                  placeholder="Manutenção / Reunião"
                  className="w-full bg-gray-50 border-none rounded-[20px] px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                  value={formData.reason}
                  onChange={e => setFormData({ ...formData, reason: e.target.value })}
                />
              </div>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-blue-50/30 rounded-[32px] border border-blue-100/30">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[9px] font-black text-blue-600 uppercase tracking-widest ml-1">
                    <Calendar className="w-3 h-3" /> Início da Validade
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full bg-white border-none rounded-[16px] p-3.5 text-xs font-bold outline-none shadow-sm"
                    value={formData.validFrom}
                    onChange={e => setFormData({ ...formData, validFrom: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[9px] font-black text-blue-600 uppercase tracking-widest ml-1">
                    <Clock className="w-3 h-3" /> Janela de Tempo
                  </label>
                  <select
                    className="w-full bg-white border-none rounded-[16px] p-3.5 text-xs font-bold outline-none shadow-sm appearance-none"
                    value={formData.duration}
                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                  >
                    <option>1 hora</option>
                    <option>4 horas</option>
                    <option>8 horas</option>
                    <option>24 horas</option>
                    <option>72 horas</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !formData.name}
                className="md:col-span-2 w-full bg-blue-600 text-white py-6 rounded-[28px] font-black uppercase text-xs tracking-[0.3em] shadow-2xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><QrCode className="w-5 h-5" /> Gerar Voucher Digital</>}
              </button>
            </div>
          </div>

          {/* Visualização do Voucher */}
          <div className="lg:col-span-5">
            <div className={`bg-white p-10 rounded-[48px] border border-gray-100 shadow-2xl flex flex-col items-center justify-center text-center transition-all duration-700 relative overflow-hidden h-full min-h-[500px] ${showVoucher ? 'opacity-100 scale-100' : 'opacity-40 scale-95 bg-gray-50/50'}`}>
              {!showVoucher ? (
                <div className="space-y-6">
                  <div className="w-24 h-24 bg-white rounded-[40px] shadow-xl flex items-center justify-center mx-auto border border-gray-50">
                    <QrCode className="w-10 h-10 text-gray-200" />
                  </div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest max-w-[180px]">Preencha os dados de segurança para emitir o passe</p>
                </div>
              ) : (
                <div className="w-full space-y-8 animate-in zoom-in-95 duration-500">
                  <div className="w-full flex flex-col items-center border-b border-gray-50 pb-6">
                    <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-1">Centro 4.0</h4>
                    <p className="text-xl font-black text-gray-900 tracking-tighter uppercase">Voucher #99{Math.floor(Math.random() * 99)}</p>
                  </div>

                  <div className="bg-white p-6 rounded-[40px] border-[6px] border-gray-950 shadow-2xl group transition-transform hover:scale-105 duration-500">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent('https://matheusdev-sys.github.io/?profile=visitor-demo')}`}
                      alt="Voucher QR Code"
                      className="w-44 h-44"
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Acesso Temporário</p>
                    <p className="text-2xl font-black text-gray-950 font-mono tracking-tighter uppercase px-6 py-2 bg-gray-50 rounded-2xl inline-block">
                      {formData.plate || 'ABC-0000'}
                    </p>
                    <p className="text-xs font-bold text-gray-600 mt-2">{formData.name}</p>
                    <p className="text-[10px] text-red-500 font-black uppercase tracking-tighter">Expira em: {formData.duration}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 w-full pt-4">
                    <button className="flex items-center justify-center gap-2 py-4 bg-gray-950 text-white rounded-[20px] text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all">
                      <Download className="w-4 h-4" /> PDF
                    </button>
                    <button className="flex items-center justify-center gap-2 py-4 bg-blue-50 text-blue-600 rounded-[20px] text-[9px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all">
                      <Share2 className="w-4 h-4" /> Share
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Visitors;
