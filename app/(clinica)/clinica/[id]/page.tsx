'use client';

import { useParams } from 'next/navigation';
import { useDashboard } from '@/hooks/useDashboard';
import { MetricCard } from '@/components/Dashboard/MetricCard';
import { ConversasRecentes } from '@/components/Dashboard/ConversasRecentes';
import { EmptyState } from '@/components/Dashboard/EmptyState';
import { useState } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  TrendingUp 
} from 'lucide-react';

export default function ClinicaDashboard() {
  const params = useParams();
  const clinicaId = parseInt(params.id as string);
  
  const [periodo, setPeriodo] = useState<'hoje' | 'semana' | 'mes'>('hoje');
  const { metricas = [], conversasRecentes: conversas = [], isLoading, hasError, refetch } = useDashboard(clinicaId);

  const metricasConfig = [
    {
      title: "Novos Leads",
      icon: Users,
      color: "bg-blue-500"
    },
    {
      title: "Agendamentos",
      icon: Calendar,
      color: "bg-green-500"
    },
    {
      title: "Tempo Médio de Resposta",
      icon: Clock,
      color: "bg-purple-500"
    },
    {
      title: "Taxa de Conversão",
      icon: TrendingUp,
      color: "bg-orange-500"
    }
  ];

  if (hasError) {
    return (
      <EmptyState
        title="Erro ao carregar dashboard"
        message="Ocorreu um erro ao buscar os dados. Tente novamente."
        onRetry={refetch}
        isError={true}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Acompanhe o desempenho da sua clínica em tempo real
          </p>
        </div>

        {/* Seletor de Período */}
        <div className="flex bg-white rounded-lg shadow-sm border">
          {[
            { key: 'hoje', label: 'Hoje' },
            { key: 'semana', label: 'Semana' },
            { key: 'mes', label: 'Mês' }
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setPeriodo(item.key as any)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                periodo === item.key
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:text-blue-600'
              } ${
                item.key === 'hoje' ? 'rounded-l-lg' : 
                item.key === 'mes' ? 'rounded-r-lg' : ''
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          [...Array(4)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))
        ) : metricas && metricas.length > 0 ? (
          <>
            {metricas.map((metrica, index) => {
              const config = metricasConfig[index];
              const Icon = config.icon;
              return (
                <MetricCard
                  key={index}
                  name={config.title}
                  value={metrica?.value || '0'}
                  change={metrica?.change || '0%'}
                  isPositive={metrica?.isPositive || true}
                  period={periodo}
                  isLoading={isLoading}
                  icon={Icon}
                  color={config.color}
                />
              );
            })}
          </>
        ) : (
          <div className="col-span-4">
            <EmptyState
              title="Nenhuma métrica disponível"
              message="Não há dados para exibir no momento."
            />
          </div>
        )}
      </div>

      {/* Conversas Recentes */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Conversas Recentes
          </h2>
          <p className="text-gray-600 text-sm">
            Últimas interações com pacientes
          </p>
        </div>
        
        <ConversasRecentes 
          conversas={conversas} 
          isLoading={isLoading} 
        />
      </div>
    </div>
  );
} 