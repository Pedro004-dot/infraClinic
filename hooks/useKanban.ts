import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { KanbanService } from '@/services/kanban.service'
import type { KanbanCard } from '@/lib/supabase'

export function useKanban(clinicaId: number) {
  const queryClient = useQueryClient()

  // Query principal para buscar dados completos do kanban
  const { data, isLoading, error } = useQuery({
    queryKey: ['kanban-data', clinicaId],
    queryFn: () => KanbanService.getDadosKanban(clinicaId),
    refetchInterval: 1000, // Atualizar a cada 30 segundos
  })

  // Mutation para mover paciente
  const moverPacienteMutation = useMutation({
    mutationFn: ({ pacienteId, novoStatus }: { pacienteId: number; novoStatus: string }) =>
      KanbanService.moverPaciente(clinicaId, pacienteId, novoStatus),
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['kanban-data'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
    },
    onError: (error) => {
      console.error('Erro ao mover paciente:', error)
    }
  })

  // Função para mover paciente
  const moverPaciente = (pacienteId: number, novoStatus: string) => {
    moverPacienteMutation.mutate({ pacienteId, novoStatus })
  }

  // Função para buscar pacientes de um status específico
  const getPacientesPorStatus = (status: string): KanbanCard[] => {
    return data?.pacientesPorStatus?.[status] || []
  }

  // Função para obter contagem por status
  const getContagemPorStatus = (status: string): number => {
    return data?.contadores?.[status] || 0
  }

  // Estados de loading e erro
  const hasError = !!error
  const isEmpty = !data?.pacientesPorStatus && !isLoading

  return {
    // Dados principais
    pacientesPorStatus: data?.pacientesPorStatus || {},
    contadores: data?.contadores || {},
    statusDisponiveis: data?.statusDisponiveis || KanbanService.getStatusDisponiveis(),
    
    // Estados
    isLoading,
    hasError,
    isEmpty,
    error,
    
    // Ações
    moverPaciente,
    isMovendoPaciente: moverPacienteMutation.isPending,
    
    // Funções utilitárias
    getPacientesPorStatus,
    getContagemPorStatus,
    getCorPrioridade: KanbanService.getCorPrioridade,
    getCorStatus: KanbanService.getCorStatus,
    getNomeStatus: KanbanService.getNomeStatus,
    
    // Função para recarregar dados
    refetch: () => queryClient.invalidateQueries({ queryKey: ['kanban-data'] }),
    
    // Função para buscar dados específicos
    buscarDados: async () => {
      const result = await queryClient.fetchQuery({
        queryKey: ['kanban-data', clinicaId],
        queryFn: () => KanbanService.getDadosKanban(clinicaId),
      })
      return result
    }
  }
} 