'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Building2, 
  Settings, 
  Bot, 
  Plug, 
  Users,
  BarChart3,
  Eye
} from 'lucide-react';
import { ConfiguracaoBasica } from '@/components/Admin/ConfiguracaoBasica';
import { ConfiguracaoIA } from '@/components/Admin/ConfiguracaoIA';
import { ConfiguracaoIntegracoes } from '@/components/Admin/ConfiguracaoIntegracoes';
import { ConfiguracaoUsuarios } from '@/components/Admin/ConfiguracaoUsuarios';

type AbaAtiva = 'basica' | 'ia' | 'integracoes' | 'usuarios';

export default function ConfiguracaoClinica() {
  const router = useRouter();
  const params = useParams();
  const clinicaId = params.id as string;
  
  const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>('basica');

  const abas = [
    {
      id: 'basica' as AbaAtiva,
      nome: 'Dados Básicos',
      icon: Building2,
      descricao: 'Informações gerais da clínica'
    },
    {
      id: 'ia' as AbaAtiva,
      nome: 'Agente IA',
      icon: Bot,
      descricao: 'Configuração do atendente virtual'
    },
    {
      id: 'integracoes' as AbaAtiva,
      nome: 'Integrações',
      icon: Plug,
      descricao: 'WhatsApp, calendário e outras integrações'
    },
    {
      id: 'usuarios' as AbaAtiva,
      nome: 'Usuários',
      icon: Users,
      descricao: 'Gerenciar acesso à clínica'
    }
  ];

  const renderConteudoAba = () => {
    switch (abaAtiva) {
      case 'basica':
        return <ConfiguracaoBasica clinicaId={clinicaId} />;
      case 'ia':
        return <ConfiguracaoIA clinicaId={clinicaId} />;
      case 'integracoes':
        return <ConfiguracaoIntegracoes clinicaId={clinicaId} />;
      case 'usuarios':
        return <ConfiguracaoUsuarios clinicaId={clinicaId} />;
      default:
        return <ConfiguracaoBasica clinicaId={clinicaId} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/admin')}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Configuração da Clínica
              </h1>
              <p className="text-gray-600">
                Configure todos os aspectos da sua clínica
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push(`/clinica/${clinicaId}`)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>Ver Dashboard</span>
          </button>
          
          <button
            onClick={() => router.push(`/admin/clinicas/${clinicaId}/analytics`)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </button>
        </div>
      </div>

      {/* Navegação por Abas */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {abas.map((aba) => {
              const Icon = aba.icon;
              const isAtiva = abaAtiva === aba.id;
              
              return (
                <button
                  key={aba.id}
                  onClick={() => setAbaAtiva(aba.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    isAtiva
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{aba.nome}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Conteúdo da Aba */}
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {abas.find(a => a.id === abaAtiva)?.nome}
            </h2>
            <p className="text-gray-600 text-sm">
              {abas.find(a => a.id === abaAtiva)?.descricao}
            </p>
          </div>
          
          {renderConteudoAba()}
        </div>
      </div>
    </div>
  );
} 