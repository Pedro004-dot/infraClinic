import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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

    // Buscar métricas do dashboard
    const dashboardResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/vw_dashboard_principal?clinica_id=eq.${clinicaId}`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Buscar conversas recentes
    const conversasResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/vw_conversas_recentes?clinica_id=eq.${clinicaId}&limit=10`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Buscar agenda do dia
    const agendaResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/vw_agenda_dia?clinica_id=eq.${clinicaId}`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!dashboardResponse.ok) {
      const errorText = await dashboardResponse.text();
      console.error('Erro ao buscar métricas do dashboard:', errorText);
      return NextResponse.json(
        { error: 'Erro ao buscar métricas do dashboard' },
        { status: 500 }
      );
    }

    const dashboardData = await dashboardResponse.json();
    const conversasData = conversasResponse.ok ? await conversasResponse.json() : [];
    const agendaData = agendaResponse.ok ? await agendaResponse.json() : [];

    if (dashboardData.length === 0) {
      return NextResponse.json(
        { error: 'Clínica não encontrada' },
        { status: 404 }
      );
    }

    const metricas = dashboardData[0];

    // Calcular alertas e insights
    const alertas = [];
    
    if (metricas.pacientes_sem_contato_3dias > 0) {
      alertas.push({
        tipo: 'warning',
        titulo: 'Pacientes sem contato',
        mensagem: `${metricas.pacientes_sem_contato_3dias} paciente(s) sem contato há mais de 3 dias`,
        acao: 'Revisar no Kanban'
      });
    }

    if (metricas.leads_alta_prioridade_pendentes > 0) {
      alertas.push({
        tipo: 'urgent',
        titulo: 'Leads prioritários',
        mensagem: `${metricas.leads_alta_prioridade_pendentes} lead(s) de alta prioridade aguardando`,
        acao: 'Entrar em contato'
      });
    }

    if (metricas.tempo_resposta_medio_hoje > 600) { // mais de 10 minutos
      alertas.push({
        tipo: 'info',
        titulo: 'Tempo de resposta',
        mensagem: `Tempo médio de resposta hoje: ${Math.round(metricas.tempo_resposta_medio_hoje / 60)} minutos`,
        acao: 'Otimizar atendimento'
      });
    }

    // Formato final para o frontend
    const resultado = {
      // Métricas principais
      metricas: {
        hoje: {
          novos_leads: metricas.novos_leads_hoje,
          agendamentos: metricas.agendamentos_hoje,
          taxa_conversao: metricas.taxa_conversao_hoje,
          tempo_resposta_medio: Math.round(metricas.tempo_resposta_medio_hoje / 60), // em minutos
          faturamento: metricas.faturamento_hoje || 0
        },
        semana: {
          novos_leads: metricas.novos_leads_semana,
          agendamentos: metricas.agendamentos_semana
        },
        mes: {
          novos_leads: metricas.novos_leads_mes,
          agendamentos: metricas.agendamentos_mes,
          faturamento: metricas.faturamento_mes || 0
        }
      },

      // Funil atual
      funil: {
        primeiro_contato: metricas.primeiro_contato,
        leads_qualificados: metricas.leads_qualificados,
        agendados: metricas.agendados,
        em_atendimento: metricas.em_atendimento,
        concluidos: metricas.concluidos || 0,
        cancelados: metricas.cancelados || 0
      },

      // Alertas e notificações
      alertas,

      // Conversas recentes
      conversas_recentes: conversasData.slice(0, 5),

      // Agenda do dia
      agenda_hoje: agendaData,

      // Meta informações
      meta: {
        clinica_id: clinicaId,
        clinica_nome: metricas.clinica_nome,
        ultima_atualizacao: metricas.ultima_atualizacao,
        total_pacientes_ativos: metricas.primeiro_contato + metricas.leads_qualificados + metricas.agendados + metricas.em_atendimento
      }
    };

    return NextResponse.json(resultado);

  } catch (error) {
    console.error('Erro na API do dashboard:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 