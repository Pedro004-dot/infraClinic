import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// PUT - Atualizar especialidade
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const especialidadeId = Number(params.id);
    if (isNaN(especialidadeId)) {
      return NextResponse.json(
        { error: 'ID da especialidade inválido' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { nome, descricao } = body;

    if (!nome) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/especialidades?id=eq.${especialidadeId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          nome,
          descricao
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro do Supabase: ${response.status}`);
    }

    const especialidade = await response.json();
    return NextResponse.json(especialidade[0]);

  } catch (error) {
    console.error('Erro ao atualizar especialidade:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir especialidade
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const especialidadeId = Number(params.id);
    if (isNaN(especialidadeId)) {
      return NextResponse.json(
        { error: 'ID da especialidade inválido' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/especialidades?id=eq.${especialidadeId}`,
      {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Erro do Supabase: ${response.status}`);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erro ao excluir especialidade:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 