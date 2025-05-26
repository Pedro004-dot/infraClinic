import { supabase } from '../lib/supabase'
import type { DashboardMetrics, ConversaRecente } from '../lib/supabase'

export class DashboardService {
  /**
   * Busca métricas do dashboard usando a view infra_vw_dashboard_metrics
   */
  static async getMetricasDashboard(clinicaId: number): Promise<DashboardMetrics | null> {
    try {
      const { data, error } = await supabase
        .from('infra_vw_dashboard_metrics')
        .select('*')
        .eq('clinica_id', clinicaId)
        .single()

      if (error) {
        console.error('Erro ao buscar métricas do dashboard:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Erro no serviço de métricas:', error)
      return null
    }
  }

  /**
   * Busca conversas recentes - temporariamente da tabela direta
   */
  static async getConversasRecentes(clinicaId: number, limit: number = 10): Promise<ConversaRecente[]> {
    try {
      console.log('🔍 Buscando conversas para clinica_id:', clinicaId)
      
      // Buscar da tabela infra_interacoes diretamente com JOIN
      const { data, error } = await supabase
        .from('infra_interacoes')
        .select(`
          id,
          clinica_id,
          paciente_id,
          intencao,
          canal,
          data_interacao,
          infra_pacientes!inner(
            nome
          )
        `)
        .or(`clinica_id.eq.${clinicaId},clinica_id.is.null`)
        .order('data_interacao', { ascending: false })
        .limit(limit)

      console.log('📊 Resultado da query conversas (tabela direta):', { data, error })

      if (error) {
        console.error('Erro ao buscar conversas recentes:', error)
        throw error
      }

      // Transformar os dados para o formato esperado
      const conversasFormatadas = data?.map(item => ({
        id: item.id,
        clinica_id: item.clinica_id,
        paciente_id: item.paciente_id,
        paciente_nome: (item.infra_pacientes as any)?.nome || 'Nome não encontrado',
        intencao: item.intencao || 'Sem descrição',
        canal: item.canal,
        data_interacao: new Date(item.data_interacao),
        tempo: this.formatarTempoAtras(item.data_interacao),
        status_atual: 'ATIVO', // Temporário
        topico: 'Geral' // Temporário
      })) || []

      console.log('✅ Conversas formatadas:', conversasFormatadas)
      return conversasFormatadas
    } catch (error) {
      console.error('Erro no serviço de conversas:', error)
      return []
    }
  }

  /**
   * Formatar tempo atrás
   */
  private static formatarTempoAtras(dataInteracao: string): string {
    const agora = new Date()
    const data = new Date(dataInteracao)
    const diffMs = agora.getTime() - data.getTime()
    
    const minutos = Math.floor(diffMs / (1000 * 60))
    const horas = Math.floor(diffMs / (1000 * 60 * 60))
    const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (minutos < 60) return `${minutos} min atrás`
    if (horas < 24) return `${horas}h atrás`
    return `${dias} dias atrás`
  }

  /**
   * Busca dados do dashboard usando a function get_dashboard_data
   */
  static async getDashboardDataByPeriod(
    clinicaId: number, 
    periodo: 'hoje' | 'semana' | 'mes'
  ): Promise<{ metrics: DashboardMetrics | null; conversas: ConversaRecente[] }> {
    try {
      // Buscar métricas principais
      const metrics = await this.getMetricasDashboard(clinicaId)
      
      // Buscar conversas recentes
      const conversas = await this.getConversasRecentes(clinicaId)

      return { metrics, conversas }
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error)
      return { metrics: null, conversas: [] }
    }
  }

  /**
   * Formatar métricas para o período selecionado
   */
  static formatMetricsForPeriod(metrics: DashboardMetrics | null, periodo: 'hoje' | 'semana' | 'mes') {
    if (!metrics) return null

    const getValueByPeriod = (baseField: string) => {
      switch (periodo) {
        case 'hoje':
          return metrics[`${baseField}_hoje` as keyof DashboardMetrics] as number
        case 'semana':
          return metrics[`${baseField}_semana` as keyof DashboardMetrics] as number
        case 'mes':
          return metrics[`${baseField}_mes` as keyof DashboardMetrics] as number
        default:
          return metrics[`${baseField}_hoje` as keyof DashboardMetrics] as number
      }
    }

    return {
      novosLeads: getValueByPeriod('novos_leads'),
      agendamentos: getValueByPeriod('agendamentos'),
      tempoResposta: metrics.tempo_resposta_minutos,
      taxaConversao: metrics.taxa_conversao_hoje,
      variacoes: {
        leads: metrics.variacao_leads,
        agendamentos: metrics.variacao_agendamentos,
        tempoResposta: metrics.variacao_tempo_resposta,
        taxaConversao: metrics.variacao_taxa_conversao
      }
    }
  }

  /**
   * Formatar tempo em minutos para string legível
   */
  static formatarTempo(minutos: number): string {
    if (minutos < 60) return `${minutos} min`
    const horas = Math.floor(minutos / 60)
    const mins = minutos % 60
    return mins > 0 ? `${horas}h ${mins}m` : `${horas}h`
  }

  /**
   * Formatar variação percentual
   */
  static formatarVariacao(variacao: number): { text: string; isPositive: boolean } {
    const isPositive = variacao >= 0
    const text = `${isPositive ? '+' : ''}${variacao.toFixed(1)}%`
    
    return { text, isPositive }
  }
} 