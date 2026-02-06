
import React, { useState, useEffect } from 'react';
import { Printer, Filter, Activity, FileText, PieChart as PieIcon, ShieldAlert, History, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Reports: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAlerts: 0,
    efficiency: '98.4%',
    visitors: 0,
    expiringSoon: 0
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: logsData } = await supabase.from('audit_logs').select('*, profiles(name)').order('timestamp', { ascending: false }).limit(50);
        const { data: users } = await supabase.from('parking_users').select('type, valid_until');

        if (logsData) {
          setLogs(logsData);
          setStats(prev => ({ ...prev, totalAlerts: logsData.length }));
        }

        if (users) {
          const now = new Date();
          const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
          const expiring = users.filter(u => u.valid_until && new Date(u.valid_until) > now && new Date(u.valid_until) <= twoHoursFromNow).length;

          setStats(prev => ({
            ...prev,
            visitors: users.filter(u => u.type === 'Visitante').length,
            expiringSoon: expiring
          }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleGeneratePDF = () => {
    const doc = new jsPDF();

    // Configuração de cores
    const primaryColor = [11, 94, 215]; // #0B5ED7

    // Header
    doc.setFillColor(245, 247, 250); // bg-gray-50
    doc.rect(0, 0, 210, 40, 'F');

    // Logo (Texto Simulado ou Imagem se possível, aqui usando texto estilizado)
    doc.setFontSize(22);
    doc.setTextColor(10, 10, 10);
    doc.setFont("helvetica", "bold");
    doc.text("CENTRO 4.0", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(11, 94, 215);
    doc.text("PARKING MANAGER", 14, 26);

    // Título do Relatório
    doc.setFontSize(16);
    doc.setTextColor(30, 30, 30);
    doc.text("Relatório de Inteligência", 14, 55);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Gerado em: ${new Date().toLocaleString()}`, 14, 62);

    // Resumo Estatístico (Simples)
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Resumo Executivo:", 14, 75);

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`• Total de Alertas/Logs: ${stats.totalAlerts}`, 20, 82);
    doc.text(`• Índice de Conformidade: ${stats.efficiency}`, 20, 88);
    doc.text(`• Visitantes Ativos: ${stats.visitors}`, 20, 94);
    doc.text(`• Expirações Próximas: ${stats.expiringSoon}`, 20, 100);

    // Tabela de Logs
    const tableColumn = ["Data/Hora", "Operador", "Ação", "Detalhes"];
    const tableRows = logs.map(log => [
      new Date(log.timestamp).toLocaleString(),
      log.profiles?.name || 'Sistema',
      log.action,
      log.details
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 110,
      theme: 'grid',
      headStyles: { fillColor: [11, 94, 215], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 3 },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    // Rodapé
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Página ${i} de ${pageCount} - Documento Confidencial Centro 4.0`, 105, 290, { align: 'center' });
    }

    doc.save(`relatorio-centro4.0-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center no-print">
        <div>
          <h1 className="text-3xl font-black text-gray-900 font-poppins tracking-tight">Business Intelligence</h1>
          <p className="text-gray-500 text-sm font-medium">Extração de dados e auditoria de conformidade.</p>
        </div>
        <button
          onClick={handleGeneratePDF}
          className="flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-2xl hover:-translate-y-1"
        >
          <Printer className="w-4 h-4" /> Exportar PDF Oficial
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Auditoria Total', value: stats.totalAlerts, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Conformidade', value: stats.efficiency, icon: FileText, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Fluxo Visitantes', value: stats.visitors, icon: PieIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Vencendo agora', value: stats.expiringSoon, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((item, i) => (
          <div key={i} className="bg-white p-7 rounded-[32px] border border-gray-100 shadow-sm print:shadow-none print:border hover:shadow-xl transition-all group">
            <div className={`p-3 w-12 h-12 rounded-2xl ${item.bg} ${item.color} mb-5 no-print group-hover:scale-110 transition-transform`}>
              <item.icon className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
            <h3 className="text-2xl font-black text-gray-900 tracking-tighter">{item.value}</h3>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden print:border-none print:shadow-none">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between no-print">
          <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest">Logs Telemetria em Tempo Real</h3>
          <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 hover:bg-blue-50 px-4 py-2 rounded-xl transition-colors">
            <Filter className="w-3 h-3" /> Filtrar Período
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-24 flex justify-center"><Loader2 className="w-10 h-10 text-blue-600 animate-spin" /></div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase font-black tracking-widest text-gray-400 bg-gray-50/50 border-b border-gray-50">
                  <th className="px-10 py-6">Data / Hora</th>
                  <th className="px-10 py-6">Operador</th>
                  <th className="px-10 py-6">Evento</th>
                  <th className="px-10 py-6">Descrição Detalhada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {logs.length > 0 ? logs.map((log) => (
                  <tr key={log.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-10 py-5 font-mono text-[11px] text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="px-10 py-5 font-bold text-gray-800">{log.profiles?.name || 'Sistema Automatico'}</td>
                    <td className="px-10 py-5">
                      <span className="px-3 py-1 bg-white border border-blue-100 text-blue-600 rounded-lg font-black text-[9px] uppercase tracking-widest group-hover:bg-blue-600 group-hover:text-white transition-all">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-10 py-5 text-gray-600 font-medium">{log.details}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-10 py-24 text-center">
                      <div className="opacity-20 flex flex-col items-center">
                        <History className="w-12 h-12 mb-4" />
                        <p className="font-black text-xs uppercase tracking-widest">Aguardando telemetria ativa</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          main { margin: 0 !important; width: 100% !important; }
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Reports;
