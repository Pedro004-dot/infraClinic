'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Building2 } from 'lucide-react';
import { FormularioClinica } from '@/components/Admin/FormularioClinica';

export default function NovaClinica() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (dadosClinica: any) => {
    setIsLoading(true);
    try {
      // Aqui você implementará a criação da clínica
      console.log('Dados da clínica:', dadosClinica);
      
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirecionar para a página de configuração da clínica criada
      router.push('/admin/clinicas/1'); // ID da clínica criada
    } catch (error) {
      console.error('Erro ao criar clínica:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nova Clínica</h1>
            <p className="text-gray-600">Preencha os dados para criar uma nova clínica</p>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div className="bg-white rounded-lg shadow">
        <FormularioClinica 
          onSubmit={handleSubmit}
          isLoading={isLoading}
          isEdit={false}
        />
      </div>
    </div>
  );
} 