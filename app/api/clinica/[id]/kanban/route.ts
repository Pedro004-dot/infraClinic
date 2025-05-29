import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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

    // Buscar pacientes do kanban usando a view atualizada
    const pacientesResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/infra_vw_kanban_board?clinica_id=eq.${clinicaId}&order=prioridade.asc,tempo_no_status.desc`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Buscar contadores por status
    const contadoresResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/infra_vw_kanban_counts?clinica_id=eq.${clinicaId}`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!pacientesResponse.ok || !contadoresResponse.ok) {
      const pacientesError = pacientesResponse.ok ? null : await pacientesResponse.text();
      const contadoresError = contadoresResponse.ok ? null : await contadoresResponse.text();
      
      console.error('Erro do Supabase:', {
        pacientes: pacientesError,
        contadores: contadoresError
      });
      
      return NextResponse.json(
        { error: 'Erro ao buscar dados do kanban' },
        { status: 500 }
      );
    }

    const pacientes = await pacientesResponse.json();
    const contadoresArray = await contadoresResponse.json();

    // Agrupar pacientes por status
    const pacientesPorStatus: Record<string, any[]> = {};
    pacientes.forEach((paciente: any) => {
      if (!pacientesPorStatus[paciente.status_atual]) {
        pacientesPorStatus[paciente.status_atual] = [];
      }
      pacientesPorStatus[paciente.status_atual].push({
        ...paciente,
        // Formatar tempo_no_status para exibição
        tempo_no_status_texto: formatarTempo(paciente.tempo_no_status)
      });
    });

    // Converter contadores em objeto
    const contadores: Record<string, number> = {};
    contadoresArray.forEach((item: any) => {
      contadores[item.status] = item.total;
    });

    // Status disponíveis - 4 colunas principais
    const statusDisponiveis = [
      'LEAD',
      'AGENDADO',
      'RETORNO',
      'FOLLOW_UP'
    ];

    return NextResponse.json({
      pacientesPorStatus,
      contadores,
      statusDisponiveis,
      total_pacientes: pacientes.length,
      ultima_atualizacao: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro na API do kanban:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Mover paciente para novo status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clinicaId = parseInt(params.id);
    const { pacienteId, novoStatus, motivo } = await request.json();

    if (isNaN(clinicaId) || !pacienteId || !novoStatus) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      );
    }

    // Validar status permitidos
    const statusPermitidos = ['LEAD', 'AGENDADO', 'RETORNO', 'FOLLOW_UP'];
    if (!statusPermitidos.includes(novoStatus)) {
      return NextResponse.json(
        { error: 'Status inválido' },
        { status: 400 }
      );
    }

    // Atualizar status do paciente usando a tabela de compatibilidade
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/infra_paciente_status?paciente_id=eq.${pacienteId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          status_atual: novoStatus,
          data_mudanca: new Date().toISOString(),
          data_ultimo_status: new Date().toISOString()
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro ao mover paciente:', response.status, errorText);
      return NextResponse.json(
        { error: 'Erro ao mover paciente' },
        { status: 500 }
      );
    }

    // Registrar a mudança de status como interação se motivo foi fornecido
    if (motivo) {
      await fetch(
        `${SUPABASE_URL}/rest/v1/interacoes`,
        {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paciente_id: pacienteId,
            clinica_id: clinicaId,
            tipo: 'mudanca_status',
            canal: 'sistema',
            direcao: 'interna',
            conteudo: `Status alterado para ${novoStatus}`,
            resumo: motivo,
            topico: 'Mudança de Status',
            sentimento: 'neutro',
            urgencia: 'normal',
            resolvido: true,
            data_interacao: new Date().toISOString()
          })
        }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: `Paciente movido para ${novoStatus} com sucesso`
    });

  } catch (error) {
    console.error('Erro ao mover paciente:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Adicionar novo paciente (útil para captação de leads)
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

    // Mapear status do frontend para status interno
    const statusInterno = status === 'LEAD' ? 'PRIMEIRO_CONTATO' : status;

    // Adicionar novo paciente
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/pacientes`,
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          clinica_id: clinicaId,
          nome,
          telefone,
          email,
          status_atual: statusInterno,
          prioridade,
          observacoes,
          origem,
          ultimo_contato: new Date().toISOString()
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro ao criar paciente:', response.status, errorText);
      return NextResponse.json(
        { error: 'Erro ao criar paciente' },
        { status: 500 }
      );
    }

    const novoPaciente = await response.json();

    return NextResponse.json({
      success: true,
      paciente: novoPaciente[0],
      message: 'Paciente adicionado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao criar paciente:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função auxiliar para formatar tempo
function formatarTempo(minutos: number): string {
  if (minutos < 60) {
    return `${minutos} min atrás`;
  } else if (minutos < 1440) { // menos de 24h
    const horas = Math.floor(minutos / 60);
    return `${horas}h atrás`;
  } else {
    const dias = Math.floor(minutos / 1440);
    return `${dias} dias atrás`;
  }
} 