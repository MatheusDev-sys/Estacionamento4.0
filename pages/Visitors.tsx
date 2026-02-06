
import React, { useState } from 'react';
import { UserPlus, Calendar, Clock, QrCode, Download, Share2, FileText } from 'lucide-react';

const Visitors: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showVoucher, setShowVoucher] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowVoucher(true);
    }, 1500);
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Visitantes e Vouchers</h1>
          <p className="text-gray-500 text-sm">Gere acesso temporário via QR Code para prestadores de serviços e convidados.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              Novo Voucher de Acesso
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nome do Visitante</label>
                <input type="text" placeholder="Nome completo" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-100 transition-all outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Placa do Veículo</label>
                  <input type="text" placeholder="ABC-1234" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-blue-100 transition-all outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Empresa/Motivo</label>
                  <input type="text" placeholder="Ex: Manutenção" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-100 transition-all outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Data Início</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="date" className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-3 text-sm outline-none" defaultValue={new Date().toISOString().split('T')[0]} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Expiração</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-3 text-sm outline-none appearance-none">
                      <option>1 hora</option>
                      <option>4 horas</option>
                      <option>8 horas</option>
                      <option>24 horas</option>
                    </select>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-gradient-tech text-white py-4 rounded-xl font-bold shadow-xl shadow-blue-200 hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isGenerating ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <QrCode className="w-5 h-5" />
                    Gerar Voucher Digital
                  </>
                )}
              </button>
            </div>
          </div>

          <div className={`bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center transition-all duration-500 ${showVoucher ? 'opacity-100' : 'opacity-60 bg-gray-50/50'}`}>
            {!showVoucher ? (
              <div className="space-y-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <QrCode className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="font-semibold text-gray-400">Aguardando geração...</h3>
                <p className="text-sm text-gray-400 max-w-[200px]">Preencha os dados ao lado para visualizar o QR Code.</p>
              </div>
            ) : (
              <div className="space-y-6 animate-in zoom-in-95 duration-500 w-full">
                <div className="bg-blue-50 p-6 rounded-2xl inline-block border-2 border-dashed border-blue-200">
                  <img 
                    src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=CENTRO4.0-VISITOR-9921" 
                    alt="Voucher QR Code" 
                    className="w-40 h-40"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">Voucher #9921</h3>
                  <p className="text-sm text-gray-500">Validade: Até 18:00 de hoje</p>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full">
                  <button className="flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors">
                    <Download className="w-4 h-4" />
                    Baixar PDF
                  </button>
                  <button className="flex items-center justify-center gap-2 py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-bold transition-colors">
                    <Share2 className="w-4 h-4" />
                    WhatsApp
                  </button>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest px-2">
                    <span>Visitante: João Martins</span>
                    <span>Placa: GHI-9012</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Visitors;
