'use client';

import { useState } from 'react';
import { Users, Plus, Mail, Shield, Trash2 } from 'lucide-react';

interface ConfiguracaoUsuariosProps {
  clinicaId: string;
}

export function ConfiguracaoUsuarios({ clinicaId }: ConfiguracaoUsuariosProps) {
  const [usuarios] = useState([
    {
      id: 1,
      nome: 'Dr. Ricardo Mendes',
      email: 'ricardo@dermacenter.com.br',
      role: 'admin',
      status: 'ativo',
      ultimo_acesso: 'há 2 horas'
    },
    {
      id: 2,
      nome: 'Dra. Marina Santos',
      email: 'marina@dermacenter.com.br',
      role: 'medico',
      status: 'ativo',
      ultimo_acesso: 'há 1 dia'
    },
    {
      id: 3,
      nome: 'Ana Silva',
      email: 'ana@dermacenter.com.br',
      role: 'recepcionista',
      status: 'ativo',
      ultimo_acesso: 'há 3 horas'
    }
  ]);

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'medico': return 'Médico';
      case 'recepcionista': return 'Recepcionista';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'medico': return 'bg-blue-100 text-blue-800';
      case 'recepcionista': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Usuários da Clínica</h3>
          <p className="text-gray-600 text-sm">Gerencie quem tem acesso ao sistema</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Convidar Usuário</span>
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Função
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último Acesso
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usuarios.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <Users className="w-5 h-5 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {usuario.nome}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {usuario.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(usuario.role)}`}>
                      <Shield className="w-3 h-3 mr-1" />
                      {getRoleLabel(usuario.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Ativo
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {usuario.ultimo_acesso}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-red-600 hover:text-red-900 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-900 mb-2">Níveis de Permissão</h4>
        <div className="space-y-2 text-sm text-yellow-800">
          <div><strong>Administrador:</strong> Acesso total ao sistema e configurações</div>
          <div><strong>Médico:</strong> Acesso ao dashboard, pacientes e agenda</div>
          <div><strong>Recepcionista:</strong> Acesso limitado a agendamentos e pacientes</div>
        </div>
      </div>
    </div>
  );
} 