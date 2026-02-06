
import React, { useState } from 'react';
import { Search, Filter, Plus, MessageCircle, Edit2, Trash2, QrCode } from 'lucide-react';
import { MOCK_USERS } from '../mockData';
import { User } from '../types';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState('');

  const sendWhatsAppAlert = (user: User) => {
    const plate = user.vehicles[0]?.plate || "seu veículo";
    const message = `Olá ${user.name}, seu veículo (${plate}) está impedindo a saída de outro carro no estacionamento do Centro 4.0. Poderia movê-lo por gentileza?`;
    const cleanPhone = user.phone.replace(/\D/g, '');
    const url = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.registration && u.registration.includes(searchTerm)) ||
    (u.cpf && u.cpf.includes(searchTerm)) ||
    u.vehicles.some(v => v.plate.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-8 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestão de Pessoas</h1>
          <p className="text-gray-500 text-sm">Cadastro de colaboradores e controle de acesso.</p>
        </div>
        <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all hover:-translate-y-0.5">
          <Plus className="w-4 h-4" />
          Novo Cadastro
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex flex-wrap gap-4 items-center justify-between bg-gray-50/50">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por nome, matrícula, CPF ou placa..."
              className="w-full bg-white border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-100 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/30 text-[11px] uppercase tracking-wider text-gray-400 font-bold border-b border-gray-50">
                <th className="px-6 py-4">Nome / Identificação</th>
                <th className="px-6 py-4">Veículos</th>
                <th className="px-6 py-4">WhatsApp</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4 text-right">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-400 font-mono">
                          {user.type === 'Colaborador' ? `Matrícula: ${user.registration}` : `CPF: ${user.cpf || '---'}`}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.vehicles.map((v) => (
                        <span key={v.id} className="bg-white border border-gray-200 text-gray-800 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase shadow-sm">
                          {v.plate}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-gray-600">{user.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${user.type === 'Colaborador' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                      {user.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => sendWhatsAppAlert(user)}
                        title="Enviar Alerta de Bloqueio"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 transition-colors shadow-sm shadow-green-100"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Alertar
                      </button>
                      <button title="Gerar QR Code de Painel" className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <QrCode className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
