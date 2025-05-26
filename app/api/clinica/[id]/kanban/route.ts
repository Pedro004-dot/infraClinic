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

    // Buscar pacientes do kanban usando a view
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
      pacientesPorStatus[paciente.status_atual].push(paciente);
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
      statusDisponiveis
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
    const { pacienteId, novoStatus } = await request.json();

    if (isNaN(clinicaId) || !pacienteId || !novoStatus) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      );
    }

    // Atualizar status do paciente
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

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erro ao mover paciente:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 