'use client';

import { useState, useEffect } from 'react';
import { FormularioClinica } from './FormularioClinica';

interface DadosClinica {
  nome: string;
  tipo: string;
  cnpj: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
  email: string;
  waze: string;
  google_maps: string;
  nome_atendente: string;
  genero_atendente: string;
  consulta_padrao: string;
  aceita_convenio: string;
  formas_pagamento: string[];
  parcela_minima: string;
  max_parcelas: number;
  segunda_sexta: string;
  sabado: string;
  domingo: string;
}

interface ConfiguracaoBasicaProps {
  clinicaId: string;
}

export function ConfiguracaoBasica({ clinicaId }: ConfiguracaoBasicaProps) {
  const [dadosClinica, setDadosClinica] = useState<DadosClinica | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchDadosClinica = async () => {
      try {
        setIsLoading(true);
        
        // Simular busca dos dados da clínica
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dados mockados baseados no exemplo fornecido
        const mockDados = {
          nome: "DermaCenter Clínica Dermatológica",
          tipo: "medica",
          cnpj: "12.345.678/0001-90",
          endereco: "Avenida Paulista, 1578 - 7º andar",
          bairro: "Bela Vista",
          cidade: "São Paulo",
          estado: "SP",
          cep: "01310-200",
          telefone: "(11) 3456-7890",
          email: "contato@dermacenter.com.br",
          waze: "DermaCenter Paulista",
          google_maps: "https://goo.gl/maps/ABC123dermacenter",
          nome_atendente: "Sofia",
          genero_atendente: "feminino",
          consulta_padrao: "R$ 450,00",
          aceita_convenio: "não",
          formas_pagamento: ["Pix", "Cartão de Crédito", "Cartão de Débito", "Transferência"],
          parcela_minima: "R$ 100,00",
          max_parcelas: 6,
          segunda_sexta: "08:00 às 19:00",
          sabado: "08:00 às 13:00",
          domingo: "Fechado"
        };
        
        setDadosClinica(mockDados);
      } catch (error) {
        console.error('Erro ao buscar dados da clínica:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDadosClinica();
  }, [clinicaId]);

  const handleSalvar = async (dadosAtualizados: any) => {
    setIsSaving(true);
    try {
      // Aqui você implementará a atualização no Supabase
      console.log('Salvando dados da clínica:', dadosAtualizados);
      
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setDadosClinica(dadosAtualizados);
      
      // Mostrar notificação de sucesso
      alert('Dados salvos com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      alert('Erro ao salvar dados. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <FormularioClinica
        dadosIniciais={dadosClinica || undefined}
        onSubmit={handleSalvar}
        isLoading={isSaving}
        isEdit={true}
      />
    </div>
  );
} 