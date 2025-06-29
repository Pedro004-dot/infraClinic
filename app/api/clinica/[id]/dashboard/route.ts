import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Tipo para os dados da tabela agent_conversations_state
interface AgentConversationState {
  id: number;
  clinica_id: number;
  paciente_id: number | null;
  telefone: string;
  nome_contato: string;
  primeira_mensagem: string;
  ultima_mensagem: string;
  ultima_mensagem_texto: string;
  estado_funil: string;
  total_mensagens_recebidas: number;
  total_mensagens_enviadas: number;
  tempo_primeira_resposta_segundos: number | null;
  tempo_total_conversa_segundos: number | null;
  intencao_principal: string;
  sentimento_geral: string;
  topicos_abordados: string | null;
  agendamento_solicitado: boolean;
  agendamento_confirmado: boolean;
  consulta_id: number | null;
  data_agendamento: string | null;
  profissional_nome: string | null;
  especialidade_nome: string | null;
  valor_consulta: number | null;
  follow_up_agendado: boolean;
  follow_up_data: string | null;
  follow_up_tipo: string | null;
  origem_lead: string;
  campanha_origem: string | null;
  agente_versao: string | null;
  ativo: boolean;
  finalizada: boolean;
  motivo_finalizacao: string | null;
  created_at: string;
  updated_at: string;
}

// Função auxiliar para verificar se uma data é hoje
function isToday(dateString: string): boolean {
  const today = new Date();
  const date = new Date(dateString);
  return date.toDateString() === today.toDateString();
}

// Função auxiliar para verificar se uma data é desta semana
function isThisWeek(dateString: string): boolean {
  const today = new Date();
  const date = new Date(dateString);
  const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
  return date >= weekStart;
}

// Função auxiliar para verificar se uma data é deste mês
function isThisMonth(dateString: string): boolean {
  const today = new Date();
  const date = new Date(dateString);
  return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
}

// Função auxiliar para formatar tempo
function formatarTempo(dataString: string): string {
  const agora = new Date();
  const data = new Date(dataString);
  const diffMs = agora.getTime() - data.getTime();
  const diffMinutos = Math.floor(diffMs / (1000 * 60));
  const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutos < 60) {
    return `${diffMinutos} min atrás`;
  } else if (diffHoras < 24) {
    return `${diffHoras}h atrás`;
  } else {
    return `${diffDias} dias atrás`;
  }
}

// GET - Buscar métricas do dashboard de uma clínica específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clinicaId = parseInt(params.id);

    if (isNaN(clinicaId)) {
      return NextResponse.json(
        { error: 'ID da clínica inválido' },
        { status: 400 }
      );
    }

    console.log('🔍 Buscando dados do dashboard para clínica:', clinicaId);

    // Buscar TODOS os dados da tabela agent_conversations_state para esta clínica
    // Ordenando por ultima_mensagem (que é a data da última mensagem) em ordem decrescente
    const conversasResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/agent_conversations_state?clinica_id=eq.${clinicaId}&ativo=eq.true&order=ultima_mensagem.desc`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!conversasResponse.ok) {
      const errorText = await conversasResponse.text();
      console.error('Erro ao buscar dados das conversas:', errorText);
      return NextResponse.json(
        { error: 'Erro ao buscar dados das conversas' },
        { status: 500 }
      );
    }

    const conversas: AgentConversationState[] = await conversasResponse.json();
    console.log('✅ Conversas encontradas:', conversas.length);

    if (conversas.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma conversa encontrada para esta clínica' },
        { status: 404 }
      );
    }

    // CALCULAR MÉTRICAS EM TEMPO REAL
    
    // Métricas HOJE
    const conversasHoje = conversas.filter((c: AgentConversationState) => isToday(c.created_at));
    const agendamentosHoje = conversas.filter((c: AgentConversationState) => isToday(c.updated_at) && c.agendamento_confirmado === true);
    const novosLeadsHoje = conversasHoje.filter((c: AgentConversationState) => c.estado_funil === 'lead').length;
    
    // Métricas SEMANA
    const conversasSemana = conversas.filter((c: AgentConversationState) => isThisWeek(c.created_at));
    const agendamentosSemana = conversas.filter((c: AgentConversationState) => isThisWeek(c.updated_at) && c.agendamento_confirmado === true);
    const novosLeadsSemana = conversasSemana.filter((c: AgentConversationState) => c.estado_funil === 'lead').length;
    
    // Métricas MÊS
    const conversasMes = conversas.filter((c: AgentConversationState) => isThisMonth(c.created_at));
    const agendamentosMes = conversas.filter((c: AgentConversationState) => isThisMonth(c.updated_at) && c.agendamento_confirmado === true);
    const novosLeadsMes = conversasMes.filter((c: AgentConversationState) => c.estado_funil === 'lead').length;

    // Taxa de conversão
    const totalConversas = conversas.length;
    const totalAgendamentos = conversas.filter((c: AgentConversationState) => c.agendamento_confirmado === true).length;
    const taxaConversao = totalConversas > 0 ? (totalAgendamentos / totalConversas * 100) : 0;

    // Tempo médio de resposta (em minutos)
    const conversasComTempo = conversas.filter((c: AgentConversationState) => c.tempo_primeira_resposta_segundos !== null);
    const tempoMedioSegundos = conversasComTempo.length > 0 
      ? conversasComTempo.reduce((sum, c) => sum + (c.tempo_primeira_resposta_segundos || 0), 0) / conversasComTempo.length
      : 0;
    const tempoMedioMinutos = Math.round(tempoMedioSegundos / 60);

    // Faturamento (baseado no valor_consulta)
    const faturamentoHoje = agendamentosHoje.reduce((sum, c) => sum + (c.valor_consulta || 0), 0);
    const faturamentoMes = agendamentosMes.reduce((sum, c) => sum + (c.valor_consulta || 0), 0);

    // FUNIL ATUAL (contagem por estado)
    const funil = {
      primeiro_contato: conversas.filter((c: AgentConversationState) => c.estado_funil === 'lead').length,
      leads_qualificados: conversas.filter((c: AgentConversationState) => c.estado_funil === 'lead_qualificado' || c.agendamento_solicitado === true).length,
      agendados: conversas.filter((c: AgentConversationState) => c.agendamento_confirmado === true && c.estado_funil !== 'concluido').length,
      em_atendimento: conversas.filter((c: AgentConversationState) => c.estado_funil === 'em_atendimento').length,
      concluidos: conversas.filter((c: AgentConversationState) => c.finalizada === true || c.estado_funil === 'concluido').length,
      cancelados: conversas.filter((c: AgentConversationState) => c.motivo_finalizacao && c.motivo_finalizacao.includes('cancelad')).length
    };

    // ALERTAS INTELIGENTES (usando dados da IA)
    const alertas = [];
    
    // Pacientes com sentimento negativo
    const pacientesNegativos = conversas.filter((c: AgentConversationState) => c.sentimento_geral === 'negativo' && !c.finalizada);
    if (pacientesNegativos.length > 0) {
      alertas.push({
        tipo: 'urgent' as const,
        titulo: 'Pacientes insatisfeitos',
        mensagem: `${pacientesNegativos.length} paciente(s) com sentimento negativo precisam de atenção`,
        acao: 'Revisar no Kanban'
      });
    }

    // Agendamentos solicitados mas não confirmados
    const agendamentosPendentes = conversas.filter((c: AgentConversationState) => c.agendamento_solicitado === true && c.agendamento_confirmado === false);
    if (agendamentosPendentes.length > 0) {
      alertas.push({
        tipo: 'warning' as const,
        titulo: 'Agendamentos pendentes',
        mensagem: `${agendamentosPendentes.length} agendamento(s) solicitado(s) aguardando confirmação`,
        acao: 'Confirmar agendamentos'
      });
    }

    // Follow-ups agendados para hoje
    const followUpsHoje = conversas.filter((c: AgentConversationState) => 
      c.follow_up_agendado === true && 
      c.follow_up_data && 
      isToday(c.follow_up_data)
    );
    if (followUpsHoje.length > 0) {
      alertas.push({
        tipo: 'info' as const,
        titulo: 'Follow-ups hoje',
        mensagem: `${followUpsHoje.length} follow-up(s) agendado(s) para hoje`,
        acao: 'Entrar em contato'
      });
    }

    // Tempo de resposta alto
    if (tempoMedioMinutos > 10) {
      alertas.push({
        tipo: 'info' as const,
        titulo: 'Tempo de resposta elevado',
        mensagem: `Tempo médio de resposta: ${tempoMedioMinutos} minutos`,
        acao: 'Otimizar atendimento'
      });
    }

    // CONVERSAS RECENTES (formatadas para o frontend)
    // Usando ultima_mensagem como data_interacao para pegar realmente as conversas mais recentes
    const conversasRecentes = conversas.slice(0, 10).map((c: AgentConversationState) => ({
      id: c.id,
      clinica_id: c.clinica_id,
      paciente_id: c.paciente_id,
      paciente_nome: c.nome_contato,
      intencao: c.intencao_principal,
      canal: c.origem_lead,
      data_interacao: c.ultima_mensagem, // Usando ultima_mensagem em vez de updated_at
      tempo: formatarTempo(c.ultima_mensagem), // Formatando baseado na última mensagem
      status_atual: c.estado_funil,
      topico: c.intencao_principal,
      sentimento: c.sentimento_geral // Dado único da IA
    }));

    // AGENDA DO DIA (agendamentos confirmados para hoje)
    const agendaHoje = conversas
      .filter((c: AgentConversationState) => c.data_agendamento && isToday(c.data_agendamento))
      .map((c: AgentConversationState) => ({
        id: c.id,
        paciente_nome: c.nome_contato,
        telefone: c.telefone,
        data_agendamento: c.data_agendamento!,
        profissional_nome: c.profissional_nome,
        especialidade_nome: c.especialidade_nome,
        valor_consulta: c.valor_consulta,
        observacoes: c.topicos_abordados
      }));

    // FORMATO FINAL PARA O FRONTEND
    const resultado = {
      // Métricas principais
      metricas: {
        hoje: {
          novos_leads: novosLeadsHoje,
          agendamentos: agendamentosHoje.length,
          taxa_conversao: Math.round(taxaConversao * 10) / 10, // Uma casa decimal
          tempo_resposta_medio: tempoMedioMinutos,
          faturamento: faturamentoHoje
        },
        semana: {
          novos_leads: novosLeadsSemana,
          agendamentos: agendamentosSemana.length
        },
        mes: {
          novos_leads: novosLeadsMes,
          agendamentos: agendamentosMes.length,
          faturamento: faturamentoMes
        }
      },

      // Funil atual
      funil,

      // Alertas inteligentes com dados da IA
      alertas,

      // Conversas recentes com dados enriquecidos
      conversas_recentes: conversasRecentes.slice(0, 5),

      // Agenda do dia
      agenda_hoje: agendaHoje,

      // Meta informações
      meta: {
        clinica_id: clinicaId,
        clinica_nome: `Clínica ${clinicaId}`, // Temporário - poderia vir de outra tabela
        ultima_atualizacao: new Date().toISOString(),
        total_pacientes_ativos: conversas.filter((c: AgentConversationState) => !c.finalizada).length,
        fonte_dados: 'agent_conversations_state', // Para debug
        total_conversas: totalConversas
      },

      // Dados únicos da IA (novos insights)
      insights_ia: {
        sentimentos: {
          positivo: conversas.filter((c: AgentConversationState) => c.sentimento_geral === 'positivo').length,
          neutro: conversas.filter((c: AgentConversationState) => c.sentimento_geral === 'neutro').length,
          negativo: conversas.filter((c: AgentConversationState) => c.sentimento_geral === 'negativo').length,
          preocupado: conversas.filter((c: AgentConversationState) => c.sentimento_geral === 'preocupado').length
        },
        intencoes_principais: conversas.reduce((acc, c) => {
          const intencao = c.intencao_principal || 'sem_classificacao';
          acc[intencao] = (acc[intencao] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        origens_lead: conversas.reduce((acc, c) => {
          const origem = c.origem_lead || 'nao_informado';
          acc[origem] = (acc[origem] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        follow_ups_pendentes: conversas.filter((c: AgentConversationState) => c.follow_up_agendado === true && !c.finalizada).length
      }
    };

    console.log('✅ Dashboard processado com sucesso:', {
      total_conversas: totalConversas,
      novos_leads_hoje: novosLeadsHoje,
      agendamentos_hoje: agendamentosHoje.length,
      alertas: alertas.length
    });

    return NextResponse.json(resultado);

  } catch (error) {
    console.error('❌ Erro na API do dashboard:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
} 