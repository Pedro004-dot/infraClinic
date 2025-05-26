'use client';

import { useState } from 'react';
import { Plus, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useClinicasAdmin } from '@/hooks/useClinicasAdmin';
import { ClinicaCard } from '@/components/Admin/ClinicaCard';
import { EmptyState } from '@/components/Dashboard/EmptyState';

export default function AdminDashboard() {
  const router = useRouter();
  const { clinicas, isLoading, hasError, refetch, deletarClinica } = useClinicasAdmin();

  const handleDeleteClinica = async (id: number) => {
    try {
      await deletarClinica(id);
      // A lista será atualizada automaticamente pelo hook
    } catch (error) {
      console.error('Erro ao deletar clínica:', error);
      alert('Erro ao deletar clínica. Tente novamente.');
    }
  };

  if (hasError) {
    return (
      <EmptyState
        title="Erro ao carregar clínicas"
        message="Ocorreu um erro ao buscar suas clínicas. Tente novamente."
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
          <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
          <p className="text-gray-600 mt-2">
            Gerencie todas as clínicas da plataforma InfraClínicas
          </p>
        </div>
        
        <button
          onClick={() => router.push('/admin/clinicas/nova')}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nova Clínica</span>
        </button>
      </div>

      {/* Métrica Principal */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Total de Clínicas</h3>
            <p className="text-3xl font-bold text-blue-600">
              {isLoading ? '...' : clinicas.length}
            </p>
            <p className="text-sm text-gray-600">
              {clinicas.length === 1 ? 'clínica cadastrada' : 'clínicas cadastradas'}
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Clínicas */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Clínicas Cadastradas
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="animate-pulse">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : clinicas.length === 0 ? (
          <EmptyState
            title="Nenhuma clínica cadastrada"
            message="Comece criando sua primeira clínica na plataforma."
            actionLabel="Criar Primeira Clínica"
            onAction={() => router.push('/admin/clinicas/nova')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clinicas.map((clinica) => (
              <ClinicaCard
                key={clinica.id}
                clinica={clinica}
                onDelete={handleDeleteClinica}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 