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

// Função auxiliar para mapear estado_funil para status do Kanban
function mapearStatusKanban(conversa: AgentConversationState): string {
  // Prioridade de mapeamento:
  // 1. Agendamento confirmado = AGENDADO
  // 2. Follow-up agendado = FOLLOW_UP
  // 3. Estado do funil específico
  
  if (conversa.agendamento_confirmado === true) {
    return 'AGENDADO';
  }
  
  if (conversa.follow_up_agendado === true) {
    return 'FOLLOW_UP';
  }
  
  // Mapear estados do funil
  switch (conversa.estado_funil) {
    case 'lead':
    case 'primeiro_contato':
      return 'LEAD';
    case 'lead_qualificado':
    case 'dados_coletados':
      return 'QUALIFICADO';
    case 'agendado':
      return 'AGENDADO';
    case 'follow_up':
    case 'retorno':
      return 'FOLLOW_UP';
    default:
      return 'LEAD';
  }
}

// Função auxiliar para determinar prioridade baseada nos dados da IA
function determinarPrioridade(conversa: AgentConversationState): 'alta' | 'media' | 'baixa' {
  // Prioridade ALTA: Sentimento negativo, agendamento solicitado não confirmado
  if (conversa.sentimento_geral === 'negativo' || conversa.sentimento_geral === 'preocupado') {
    return 'alta';
  }
  
  if (conversa.agendamento_solicitado === true && conversa.agendamento_confirmado === false) {
    return 'alta';
  }
  
  // Prioridade BAIXA: Sentimento positivo, follow-up agendado
  if (conversa.sentimento_geral === 'positivo' || conversa.follow_up_agendado === true) {
    return 'baixa';
  }
  
  // Prioridade MÉDIA: Casos padrão
  return 'media';
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

// GET - Buscar dados do kanban de uma clínica específica
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

    console.log('🔍 Buscando dados do kanban para clínica:', clinicaId);

    // Buscar TODOS os dados ativos da tabela agent_conversations_state
    const conversasResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/agent_conversations_state?clinica_id=eq.${clinicaId}&ativo=eq.true&finalizada=eq.false&order=updated_at.desc`,
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
        { error: 'Erro ao buscar dados do kanban' },
        { status: 500 }
      );
    }

    const conversas: AgentConversationState[] = await conversasResponse.json();
    console.log('✅ Conversas encontradas para kanban:', conversas.length);

    // TRANSFORMAR DADOS PARA O FORMATO DO KANBAN
    const kanbanCards = conversas.map((conversa: AgentConversationState) => ({
      // Dados básicos do paciente
      id: conversa.id,
      clinica_id: conversa.clinica_id,
      nome: conversa.nome_contato,
      nome_preferido: conversa.nome_contato, // Usar o mesmo nome por enquanto
      telefone: conversa.telefone,
      email: null, // Não disponível na tabela agent_conversations_state
      
      // Status e classificação
      status_atual: mapearStatusKanban(conversa),
      prioridade: determinarPrioridade(conversa),
      tempo_no_status: formatarTempo(conversa.updated_at),
      
      // Dados da última interação
      ultimo_topico: conversa.intencao_principal || 'Sem classificação',
      ultima_intencao: conversa.ultima_mensagem_texto || 'Sem mensagem',
      
      // Dados de agendamento
      proxima_consulta: conversa.data_agendamento,
      tipo_consulta: conversa.especialidade_nome,
      profissional_nome: conversa.profissional_nome,
      
      // Dados únicos da IA
      sentimento: conversa.sentimento_geral,
      topicos_abordados: conversa.topicos_abordados,
      origem_lead: conversa.origem_lead,
      campanha_origem: conversa.campanha_origem,
      
      // Informações de follow-up
      follow_up_agendado: conversa.follow_up_agendado,
      follow_up_data: conversa.follow_up_data,
      follow_up_tipo: conversa.follow_up_tipo,
      
      // Métricas
      total_mensagens_recebidas: conversa.total_mensagens_recebidas,
      total_mensagens_enviadas: conversa.total_mensagens_enviadas,
      tempo_primeira_resposta: conversa.tempo_primeira_resposta_segundos,
      
      // Tags dinâmicas baseadas nos dados
      tags: [
        conversa.sentimento_geral,
        conversa.origem_lead,
        ...(conversa.agendamento_solicitado ? ['agendamento_solicitado'] : []),
        ...(conversa.follow_up_agendado ? ['follow_up'] : []),
        ...(conversa.campanha_origem ? [conversa.campanha_origem] : [])
      ].filter(Boolean)
    }));

    // AGRUPAR POR STATUS
    const statusDisponiveis = ['LEAD', 'QUALIFICADO', 'AGENDADO', 'FOLLOW_UP'];
    const pacientesPorStatus: Record<string, any[]> = {};
    const contadores: Record<string, number> = {};

    // Inicializar estruturas
    statusDisponiveis.forEach(status => {
      pacientesPorStatus[status] = [];
      contadores[status] = 0;
    });

    // Distribuir cards por status
    kanbanCards.forEach(card => {
      const status = card.status_atual;
      if (pacientesPorStatus[status]) {
        pacientesPorStatus[status].push(card);
        contadores[status]++;
      }
    });

    // Ordenar cards dentro de cada status por prioridade e tempo
    statusDisponiveis.forEach(status => {
      pacientesPorStatus[status].sort((a, b) => {
        // Primeiro por prioridade (alta > media > baixa)
        const prioridadeOrder: Record<string, number> = { alta: 3, media: 2, baixa: 1 };
        const prioridadeDiff = prioridadeOrder[b.prioridade] - prioridadeOrder[a.prioridade];
        
        if (prioridadeDiff !== 0) {
          return prioridadeDiff;
        }
        
        // Depois por tempo (mais recente primeiro)
        return new Date(b.tempo_no_status).getTime() - new Date(a.tempo_no_status).getTime();
      });
    });

    // ESTATÍSTICAS ADICIONAIS
    const estatisticas = {
      total_pacientes: kanbanCards.length,
      por_prioridade: {
        alta: kanbanCards.filter(c => c.prioridade === 'alta').length,
        media: kanbanCards.filter(c => c.prioridade === 'media').length,
        baixa: kanbanCards.filter(c => c.prioridade === 'baixa').length
      },
      por_sentimento: {
        positivo: kanbanCards.filter(c => c.sentimento === 'positivo').length,
        neutro: kanbanCards.filter(c => c.sentimento === 'neutro').length,
        negativo: kanbanCards.filter(c => c.sentimento === 'negativo').length,
        preocupado: kanbanCards.filter(c => c.sentimento === 'preocupado').length
      },
      por_origem: kanbanCards.reduce((acc, card) => {
        const origem = card.origem_lead || 'nao_informado';
        acc[origem] = (acc[origem] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      agendamentos_pendentes: kanbanCards.filter(c => 
        c.tags.includes('agendamento_solicitado') && c.status_atual !== 'AGENDADO'
      ).length,
      follow_ups_agendados: kanbanCards.filter(c => c.follow_up_agendado).length
    };

    console.log('✅ Kanban processado com sucesso:', {
      total_cards: kanbanCards.length,
      por_status: contadores,
      prioridade_alta: estatisticas.por_prioridade.alta
    });

    return NextResponse.json({
      pacientesPorStatus,
      contadores,
      statusDisponiveis,
      estatisticas,
      total_pacientes: kanbanCards.length,
      ultima_atualizacao: new Date().toISOString(),
      fonte_dados: 'agent_conversations_state' // Para debug
    });

  } catch (error) {
    console.error('❌ Erro na API do kanban:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}

// PUT - Mover paciente entre status (atualizar agent_conversations_state)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clinicaId = parseInt(params.id);
    const { pacienteId, novoStatus, motivo } = await request.json();

    if (isNaN(clinicaId) || !pacienteId || !novoStatus) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos' },
        { status: 400 }
      );
    }

    console.log('🔄 Movendo paciente:', { pacienteId, novoStatus, motivo });

    // Mapear status do frontend para campos da tabela
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    switch (novoStatus) {
      case 'LEAD':
        updateData.estado_funil = 'lead';
        updateData.agendamento_confirmado = false;
        updateData.follow_up_agendado = false;
        break;
      case 'QUALIFICADO':
        updateData.estado_funil = 'lead_qualificado';
        updateData.agendamento_solicitado = true;
        break;
      case 'AGENDADO':
        updateData.estado_funil = 'agendado';
        updateData.agendamento_confirmado = true;
        updateData.agendamento_solicitado = true;
        break;
      case 'FOLLOW_UP':
        updateData.estado_funil = 'follow_up';
        updateData.follow_up_agendado = true;
        break;
    }

    // Atualizar no Supabase
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/agent_conversations_state?id=eq.${pacienteId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(updateData)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro ao atualizar paciente:', response.status, errorText);
      return NextResponse.json(
        { error: 'Erro ao mover paciente' },
        { status: 500 }
      );
    }

    const updatedRecord = await response.json();

    console.log('✅ Paciente movido com sucesso:', updatedRecord);

    return NextResponse.json({
      success: true,
      paciente: updatedRecord[0],
      message: `Paciente movido para ${novoStatus} com sucesso`
    });

  } catch (error) {
    console.error('❌ Erro ao mover paciente:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}

// POST - Adicionar novo paciente/conversa
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clinicaId = parseInt(params.id);
    const { nome, telefone, email, status = 'LEAD', prioridade = 'media', observacoes, origem = 'manual' } = await request.json();

    if (isNaN(clinicaId) || !nome || !telefone) {
      return NextResponse.json(
        { error: 'Nome e telefone são obrigatórios' },
        { status: 400 }
      );
    }

    console.log('➕ Adicionando novo paciente:', { nome, telefone, status });

    // Criar nova conversa na tabela agent_conversations_state
    const novaConversa = {
      clinica_id: clinicaId,
      telefone: telefone.replace(/\D/g, ''), // Limpar telefone
      nome_contato: nome,
      primeira_mensagem: new Date().toISOString(),
      ultima_mensagem: new Date().toISOString(),
      ultima_mensagem_texto: observacoes || 'Cadastro manual',
      estado_funil: status.toLowerCase(),
      total_mensagens_recebidas: 0,
      total_mensagens_enviadas: 0,
      intencao_principal: 'cadastro_manual',
      sentimento_geral: 'neutro',
      agendamento_solicitado: false,
      agendamento_confirmado: false,
      follow_up_agendado: false,
      origem_lead: origem,
      ativo: true,
      finalizada: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/agent_conversations_state`,
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(novaConversa)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro ao criar conversa:', response.status, errorText);
      return NextResponse.json(
        { error: 'Erro ao criar paciente' },
        { status: 500 }
      );
    }

    const novoRegistro = await response.json();

    console.log('✅ Novo paciente criado:', novoRegistro);

    return NextResponse.json({
      success: true,
      paciente: novoRegistro[0],
      message: 'Paciente adicionado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao criar paciente:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
} 