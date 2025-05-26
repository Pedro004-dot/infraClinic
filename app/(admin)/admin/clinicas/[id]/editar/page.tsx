'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FormularioClinica } from '@/components/Admin/FormularioClinica';
import { Clinica } from '@/hooks/useClinicasAdmin';
import { Loader2 } from 'lucide-react';

export default function EditarClinica() {
  const params = useParams();
  const router = useRouter();
  const [clinica, setClinica] = useState<Clinica | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const clinicaId = params.id as string;

  useEffect(() => {
    const fetchClinica = async () => {
      try {
        setIsLoading(true);
        setHasError(false);

        const response = await fetch(`/api/admin/clinicas/${clinicaId}`);
        
        if (!response.ok) {
          throw new Error('Erro ao buscar clínica');
        }

        const data = await response.json();
        setClinica(data);
      } catch (error) {
        console.error('Erro ao buscar clínica:', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (clinicaId) {
      fetchClinica();
    }
  }, [clinicaId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando dados da clínica...</p>
        </div>
      </div>
    );
  }

  if (hasError || !clinica) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Erro ao carregar clínica</h1>
          <p className="text-gray-600 mb-6">
            Não foi possível carregar os dados da clínica. Verifique se ela existe.
          </p>
          <button
            onClick={() => router.push('/admin')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar ao Painel
          </button>
        </div>
      </div>
    );
  }

  // Converter os dados da clínica para o formato esperado pelo formulário
  const dadosIniciais = {
    nome: clinica.nome || '',
    tipo: clinica.tipo || 'medica',
    cnpj: clinica.cnpj || '',
    endereco: clinica.endereco || '',
    bairro: clinica.bairro || '',
    cidade: clinica.cidade || '',
    estado: clinica.estado || 'SP',
    cep: clinica.cep || '',
    telefone: clinica.telefone || '',
    email: clinica.email || '',
    waze: clinica.nome_waze || '',
    google_maps: clinica.link_google_maps || '',
    nome_atendente: clinica.nome_atendente || '',
    genero_atendente: clinica.genero_atendente || 'feminino',
    consulta_padrao: clinica.valor_consulta ? `R$ ${clinica.valor_consulta.toFixed(2).replace('.', ',')}` : '',
    aceita_convenio: clinica.aceita_convenio ? 'sim' : 'não',
    formas_pagamento: clinica.formas_pagamento || ['Pix'],
    parcela_minima: '',
    max_parcelas: 1,
    segunda_sexta: clinica.horario_funcionamento?.seg_sex || '',
    sabado: clinica.horario_funcionamento?.sab || '',
    domingo: clinica.horario_funcionamento?.dom || 'Fechado',
    profissionais: []
  };

  return (
    <FormularioClinica 
      dadosIniciais={dadosIniciais}
      isEdit={true}
      clinicaId={clinica.id}
    />
  );
} 