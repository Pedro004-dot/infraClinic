import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// POST - Criar nova especialidade
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, descricao, clinica_id } = body;

    if (!nome || !clinica_id) {
      return NextResponse.json(
        { error: 'Nome e clinica_id são obrigatórios' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/infra_especialidades`,
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          nome,
          descricao,
          clinica_id,
          ativa: true
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro do Supabase: ${response.status}`);
    }

    const especialidade = await response.json();
    return NextResponse.json(especialidade[0]);

  } catch (error) {
    console.error('Erro ao criar especialidade:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 