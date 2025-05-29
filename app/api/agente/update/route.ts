import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// POST - Agente inserir atualização de paciente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      telefone, 
      clinica_id = 3, 
      nome, 
      status_novo, 
      prioridade, 
      mensagem, 
      topico, 
      sentimento = 'neutro', 
      urgencia = 'normal', 
      canal = 'whatsapp' 
    } = body;

    if (!telefone) {
      return NextResponse.json(
        { error: 'Telefone é obrigatório' },
        { status: 400 }
      );
    }

    // Inserir na tabela agente_updates
    const insertResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/agente_updates`,
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          telefone,
          clinica_id,
          nome,
          status_novo,
          prioridade,
          mensagem,
          topico,
          sentimento,
          urgencia,
          canal
        })
      }
    );

    if (!insertResponse.ok) {
      const errorText = await insertResponse.text();
      console.error('Erro ao inserir agente_updates:', errorText);
      return NextResponse.json(
        { error: 'Erro ao inserir atualização' },
        { status: 500 }
      );
    }

    // Processar as atualizações automaticamente
    const processResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/processar_agente_updates`,
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      }
    );

    if (!processResponse.ok) {
      console.error('Erro ao processar atualizações:', await processResponse.text());
      // Não falha a requisição, pois a inserção foi bem-sucedida
    }

    const processResult = processResponse.ok ? await processResponse.json() : 0;

    return NextResponse.json({
      success: true,
      message: 'Atualização inserida e processada com sucesso',
      updates_processadas: processResult || 1,
      telefone,
      status_novo
    });

  } catch (error) {
    console.error('Erro na API do agente:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// GET - Consultar pacientes (para o agente verificar antes de atualizar)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const telefone = searchParams.get('telefone');
    const clinica_id = searchParams.get('clinica_id') || '3';

    if (!telefone) {
      return NextResponse.json(
        { error: 'Telefone é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar paciente na view
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/agente_pacientes_clinica?telefone=eq.${telefone}&clinica_id=eq.${clinica_id}`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro ao buscar paciente:', errorText);
      return NextResponse.json(
        { error: 'Erro ao buscar paciente' },
        { status: 500 }
      );
    }

    const pacientes = await response.json();

    return NextResponse.json({
      encontrado: pacientes.length > 0,
      paciente: pacientes[0] || null,
      telefone,
      clinica_id: parseInt(clinica_id)
    });

  } catch (error) {
    console.error('Erro na consulta do agente:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 