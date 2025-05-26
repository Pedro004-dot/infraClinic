'use client';

import { useState, useEffect } from 'react';

export interface Clinica {
  id: number;
  nome: string;
  tipo: string;
  cnpj?: string;
  endereco: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  nome_waze?: string;
  link_google_maps?: string;
  valor_consulta?: number;
  aceita_convenio?: boolean;
  formas_pagamento?: string[];
  nome_atendente?: string;
  genero_atendente?: string;
  horario_funcionamento?: {
    seg_sex?: string;
    sab?: string;
    dom?: string;
  };
  created_at?: string;
  updated_at?: string;
  senha?: string;
}

export interface NovaClinica {
  nome: string;
  tipo: string;
  cnpj?: string;
  endereco: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  nome_waze?: string;
  link_google_maps?: string;
  valor_consulta?: number;
  aceita_convenio?: boolean;
  formas_pagamento?: string[];
  nome_atendente?: string;
  genero_atendente?: string;
  horario_funcionamento?: {
    seg_sex?: string;
    sab?: string;
    dom?: string;
  };
  senha?: string;
}

export function useClinicasAdmin() {
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const fetchClinicas = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      
      const response = await fetch('/api/admin/clinicas');
      if (!response.ok) {
        throw new Error('Erro ao buscar clínicas');
      }
      
      const data = await response.json();
      setClinicas(data);
    } catch (error) {
      console.error('Erro ao buscar clínicas:', error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const criarClinica = async (dadosClinica: NovaClinica): Promise<Clinica> => {
    try {
      const response = await fetch('/api/admin/clinicas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosClinica),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar clínica');
      }

      const novaClinica = await response.json();
      setClinicas(prev => [...prev, novaClinica]);
      return novaClinica;
    } catch (error) {
      console.error('Erro ao criar clínica:', error);
      throw error;
    }
  };

  const atualizarClinica = async (id: number, dadosClinica: Partial<NovaClinica>): Promise<Clinica> => {
    try {
      const response = await fetch(`/api/admin/clinicas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosClinica),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar clínica');
      }

      const clinicaAtualizada = await response.json();
      setClinicas(prev => prev.map(c => c.id === id ? clinicaAtualizada : c));
      return clinicaAtualizada;
    } catch (error) {
      console.error('Erro ao atualizar clínica:', error);
      throw error;
    }
  };

  const deletarClinica = async (id: number): Promise<void> => {
    try {
      const response = await fetch(`/api/admin/clinicas/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar clínica');
      }

      setClinicas(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Erro ao deletar clínica:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchClinicas();
  }, []);

  return {
    clinicas,
    isLoading,
    hasError,
    refetch: fetchClinicas,
    criarClinica,
    atualizarClinica,
    deletarClinica,
  };
} 