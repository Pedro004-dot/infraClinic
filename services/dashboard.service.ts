import type { DashboardMetrics, ConversaRecente } from '../lib/supabase'

export class DashboardService {
  /**
   * Busca dados do dashboard usando a nova API
   */
  static async getDashboardDataByPeriod(
    clinicaId: number, 
    periodo: 'hoje' | 'semana' | 'mes'
  ): Promise<{ metrics: any | null; conversas: ConversaRecente[] }> {
    try {
      console.log('🔍 Buscando dados do dashboard para clinica_id:', clinicaId)
      
      const response = await fetch(`/api/clinica/${clinicaId}/dashboard`)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Erro na API do dashboard:', response.status, errorText)
        throw new Error(`Erro HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log('✅ Dados recebidos da API:', data)

      // Transformar conversas para o formato esperado
      const conversasFormatadas = data.conversas_recentes?.map((conversa: any) => ({
        id: conversa.id,
        clinica_id: conversa.clinica_id,
        paciente_id: conversa.paciente_id,
        paciente_nome: conversa.paciente_nome,
        intencao: conversa.intencao,
        canal: conversa.canal,
        data_interacao: new Date(conversa.data_interacao),
        tempo: conversa.tempo_formatado,
        status_atual: conversa.status_atual,
        topico: conversa.topico
      })) || []

      return { 
        metrics: data, 
        conversas: conversasFormatadas 
      }
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error)
      return { metrics: null, conversas: [] }
    }
  }

  /**
   * Formatar métricas para o período selecionado
   */
  static formatMetricsForPeriod(data: any | null, periodo: 'hoje' | 'semana' | 'mes') {
    if (!data?.metricas) return null

    const metricas = data.metricas[periodo]
    if (!metricas) return null

    return {
      novosLeads: metricas.novos_leads || 0,
      agendamentos: metricas.agendamentos || 0,
      tempoResposta: metricas.tempo_resposta_medio || 0,
      taxaConversao: metricas.taxa_conversao || 0,
      variacoes: {
        leads: 0, // Temporário - pode ser calculado comparando períodos
        agendamentos: 0,
        tempoResposta: 0,
        taxaConversao: 0
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

  /**
   * Busca métricas do dashboard (método legado - mantido para compatibilidade)
   * @deprecated Use getDashboardDataByPeriod instead
   */
  static async getMetricasDashboard(clinicaId: number): Promise<any | null> {
    const result = await this.getDashboardDataByPeriod(clinicaId, 'hoje')
    return result.metrics
  }

  /**
   * Busca conversas recentes (método legado - mantido para compatibilidade)
   * @deprecated Use getDashboardDataByPeriod instead
   */
  static async getConversasRecentes(clinicaId: number, limit: number = 10): Promise<ConversaRecente[]> {
    const result = await this.getDashboardDataByPeriod(clinicaId, 'hoje')
    return result.conversas.slice(0, limit)
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
} 