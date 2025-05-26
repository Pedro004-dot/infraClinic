import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// GET - Buscar clínica específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/infra_clinicas?id=eq.${id}&select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro do Supabase:', response.status, errorText);
      return NextResponse.json(
        { error: 'Erro ao buscar clínica', status: response.status, supabase: errorText },
        { status: 500 }
      );
    }

    const clinicas = await response.json();
    
    if (clinicas.length === 0) {
      return NextResponse.json(
        { error: 'Clínica não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(clinicas[0]);
  } catch (error) {
    console.error('Erro na API de clínica:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar clínica
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();

    // Preparar dados para atualização
    const dadosClinica: any = {
      updated_at: new Date().toISOString()
    };

    // Mapear campos obrigatórios
    if (body.nome) dadosClinica.nome = body.nome;
    if (body.endereco) dadosClinica.endereco = body.endereco;
    
    // Mapear campos opcionais
    if (body.tipo) dadosClinica.tipo = body.tipo;
    if (body.cnpj) dadosClinica.cnpj = body.cnpj;
    if (body.bairro) dadosClinica.bairro = body.bairro;
    if (body.cidade) dadosClinica.cidade = body.cidade;
    if (body.estado) dadosClinica.estado = body.estado;
    if (body.cep) dadosClinica.cep = body.cep;
    if (body.telefone) dadosClinica.telefone = body.telefone;
    if (body.email) dadosClinica.email = body.email;
    if (body.waze) dadosClinica.nome_waze = body.waze;
    if (body.google_maps) dadosClinica.link_google_maps = body.google_maps;
    if (body.consulta_padrao) {
      const valor = body.consulta_padrao.replace(/[^\d,]/g, '').replace(',', '.');
      if (valor) dadosClinica.valor_consulta = parseFloat(valor);
    }
    if (body.aceita_convenio !== undefined) dadosClinica.aceita_convenio = body.aceita_convenio === 'sim';
    if (body.formas_pagamento) dadosClinica.formas_pagamento = body.formas_pagamento;
    if (body.nome_atendente) dadosClinica.nome_atendente = body.nome_atendente;
    if (body.genero_atendente) dadosClinica.genero_atendente = body.genero_atendente;
    
    // Horário de funcionamento
    if (body.segunda_sexta || body.sabado || body.domingo) {
      dadosClinica.horario_funcionamento = {
        seg_sex: body.segunda_sexta || null,
        sab: body.sabado || null,
        dom: body.domingo || 'Fechado'
      };
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/infra_clinicas?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(dadosClinica),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erro do Supabase:', errorData);
      throw new Error('Erro ao atualizar clínica');
    }

    const clinicaAtualizada = await response.json();
    
    if (clinicaAtualizada.length === 0) {
      return NextResponse.json(
        { error: 'Clínica não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(clinicaAtualizada[0]);
  } catch (error) {
    console.error('Erro na atualização de clínica:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar clínica
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    const response = await fetch(`${SUPABASE_URL}/rest/v1/infra_clinicas?id=eq.${id}`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erro do Supabase:', errorData);
      throw new Error('Erro ao deletar clínica');
    }

    return NextResponse.json({ message: 'Clínica deletada com sucesso' });
  } catch (error) {
    console.error('Erro na deleção de clínica:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 