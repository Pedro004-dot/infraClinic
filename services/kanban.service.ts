import type { KanbanCard } from '../lib/supabase'

export class KanbanService {
  /**
   * Busca dados completos do kanban usando a API REST
   */
  static async getDadosKanban(clinicaId: number): Promise<{
    pacientesPorStatus: Record<string, KanbanCard[]>;
    contadores: Record<string, number>;
    statusDisponiveis: string[];
  }> {
    try {
      const response = await fetch(`/api/clinica/${clinicaId}/kanban`);
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar dados completos do kanban:', error);
      return {
        pacientesPorStatus: {},
        contadores: {},
        statusDisponiveis: this.getStatusDisponiveis()
      };
    }
  }

  /**
   * Move um paciente para um novo status usando a API REST
   */
  static async moverPaciente(clinicaId: number, pacienteId: number, novoStatus: string): Promise<void> {
    try {
      const response = await fetch(`/api/clinica/${clinicaId}/kanban`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pacienteId,
          novoStatus
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro no serviço de mover paciente:', error);
      throw error;
    }
  }

  /**
   * Busca status disponíveis - 4 colunas principais
   */
  static getStatusDisponiveis(): string[] {
    return [
      'LEAD',
      'AGENDADO',
      'RETORNO',
      'FOLLOW_UP'
    ];
  }

  /**
   * Retorna nome amigável para o status
   */
  static getNomeStatus(status: string): string {
    const nomes: Record<string, string> = {
      'LEAD': 'Lead',
      'AGENDADO': 'Agendado',
      'RETORNO': 'Retorno',
      'FOLLOW_UP': 'Follow-up'
    };
    return nomes[status] || status;
  }

  /**
   * Retorna cor para o status
   */
  static getCorStatus(status: string): string {
    const cores: Record<string, string> = {
      'LEAD': 'bg-blue-50 border-blue-200',
      'AGENDADO': 'bg-green-50 border-green-200',
      'RETORNO': 'bg-purple-50 border-purple-200',
      'FOLLOW_UP': 'bg-orange-50 border-orange-200'
    };
    return cores[status] || 'bg-gray-50 border-gray-200';
  }

  /**
   * Retorna cor para a prioridade
   */
  static getCorPrioridade(prioridade: 'alta' | 'media' | 'baixa'): string {
    switch (prioridade) {
      case 'alta':
        return 'border-l-red-500';
      case 'media':
        return 'border-l-yellow-500';
      case 'baixa':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-500';
    }
  }
} 