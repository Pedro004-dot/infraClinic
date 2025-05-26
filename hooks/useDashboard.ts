import { useQuery, useQueryClient } from '@tanstack/react-query'
import { DashboardService } from '@/services/dashboard.service'
import { useRealtime } from '@/hooks/useRealtime'

export interface MetricaCard {
  name: string
  value: string
  change: string
  isPositive: boolean
  loading: boolean
}

export function useDashboard(clinicaId: number) {
  const queryClient = useQueryClient()

  // Query principal para buscar dados do dashboard
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-data', clinicaId],
    queryFn: () => DashboardService.getDashboardDataByPeriod(clinicaId, 'hoje'),
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  })

  // Configurar real-time updates
  useRealtime({
    onNewPatient: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
    },
    onNewAppointment: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
    },
    onNewInteraction: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
    },
    onStatusChange: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
    },
    clinicaId
  })

  // Função para buscar dados por período específico
  const getDadosPorPeriodo = (periodo: 'hoje' | 'semana' | 'mes') => {
    return useQuery({
      queryKey: ['dashboard-metrics', clinicaId, periodo],
      queryFn: () => DashboardService.getDashboardDataByPeriod(clinicaId, periodo),
      enabled: false, // Só executa quando chamado manualmente
    })
  }

  // Formatar métricas para os cards
  const formatarMetricas = (metrics: any, periodo: 'hoje' | 'semana' | 'mes' = 'hoje'): MetricaCard[] => {
    if (!metrics) {
      return [
        {
          name: 'Novos Leads',
          value: '0',
          change: '0%',
          isPositive: true,
          loading: isLoading
        },
        {
          name: 'Agendamentos',
          value: '0',
          change: '0%',
          isPositive: true,
          loading: isLoading
        },
        {
          name: 'Tempo Médio de Resposta',
          value: '0 min',
          change: '0%',
          isPositive: true,
          loading: isLoading
        },
        {
          name: 'Taxa de Conversão',
          value: '0%',
          change: '0%',
          isPositive: true,
          loading: isLoading
        }
      ]
    }

    const metricsFormatted = DashboardService.formatMetricsForPeriod(metrics, periodo)
    
    if (!metricsFormatted) {
      return []
    }

    return [
      {
        name: 'Novos Leads',
        value: metricsFormatted.novosLeads.toString(),
        change: DashboardService.formatarVariacao(metricsFormatted.variacoes.leads).text,
        isPositive: DashboardService.formatarVariacao(metricsFormatted.variacoes.leads).isPositive,
        loading: false
      },
      {
        name: 'Agendamentos',
        value: metricsFormatted.agendamentos.toString(),
        change: DashboardService.formatarVariacao(metricsFormatted.variacoes.agendamentos).text,
        isPositive: DashboardService.formatarVariacao(metricsFormatted.variacoes.agendamentos).isPositive,
        loading: false
      },
      {
        name: 'Tempo Médio de Resposta',
        value: DashboardService.formatarTempo(metricsFormatted.tempoResposta),
        change: DashboardService.formatarVariacao(metricsFormatted.variacoes.tempoResposta).text,
        isPositive: !DashboardService.formatarVariacao(metricsFormatted.variacoes.tempoResposta).isPositive, // Menor tempo é melhor
        loading: false
      },
      {
        name: 'Taxa de Conversão',
        value: `${metricsFormatted.taxaConversao.toFixed(1)}%`,
        change: DashboardService.formatarVariacao(metricsFormatted.variacoes.taxaConversao).text,
        isPositive: DashboardService.formatarVariacao(metricsFormatted.variacoes.taxaConversao).isPositive,
        loading: false
      }
    ]
  }

  // Estados de loading e erro
  const hasError = !!error
  const isEmpty = !data?.metrics && !isLoading

  return {
    // Dados principais
    metricas: formatarMetricas(data?.metrics),
    conversasRecentes: data?.conversas || [],
    
    // Estados
    isLoading,
    hasError,
    isEmpty,
    error,
    
    // Funções utilitárias
    getDadosPorPeriodo,
    formatarMetricas,
    
    // Função para recarregar dados
    refetch: () => queryClient.invalidateQueries({ queryKey: ['dashboard-data'] }),
    
    // Função para buscar dados de período específico
    buscarPorPeriodo: async (periodo: 'hoje' | 'semana' | 'mes') => {
      const result = await queryClient.fetchQuery({
        queryKey: ['dashboard-metrics', clinicaId, periodo],
        queryFn: () => DashboardService.getDashboardDataByPeriod(clinicaId, periodo),
      })
      return result
    }
  }
} 