import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// GET - Listar todas as clínicas
export async function GET() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/infra_clinicas?select=*&order=created_at.desc`, {
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
        { error: 'Erro ao buscar clínicas', status: response.status, supabase: errorText },
        { status: 500 }
      );
    }

    const clinicas = await response.json();
    return NextResponse.json(clinicas);
  } catch (error) {
    console.error('Erro na API de clínicas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar nova clínica
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validações básicas
    if (!body.nome || !body.endereco) {
      return NextResponse.json(
        { error: 'Nome e endereço são obrigatórios' },
        { status: 400 }
      );
    }

    // Preparar dados para inserção
    const dadosClinica = {
      nome: body.nome,
      tipo: body.tipo || 'medica',
      cnpj: body.cnpj,
      endereco: body.endereco,
      bairro: body.bairro,
      cidade: body.cidade,
      estado: body.estado,
      cep: body.cep,
      telefone: body.telefone,
      email: body.email,
      nome_waze: body.waze,
      link_google_maps: body.google_maps,
      valor_consulta: body.consulta_padrao ? parseFloat(body.consulta_padrao.replace(/[^\d,]/g, '').replace(',', '.')) : null,
      aceita_convenio: body.aceita_convenio === 'sim',
      formas_pagamento: body.formas_pagamento || [],
      nome_atendente: body.nome_atendente,
      genero_atendente: body.genero_atendente,
      horario_funcionamento: {
        seg_sex: body.segunda_sexta,
        sab: body.sabado,
        dom: body.domingo
      },
      senha: body.senha || '1234'
    };

    const response = await fetch(`${SUPABASE_URL}/rest/v1/infra_clinicas`, {
      method: 'POST',
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
      throw new Error('Erro ao criar clínica');
    }

    const novaClinica = await response.json();
    return NextResponse.json(novaClinica[0]);
  } catch (error) {
    console.error('Erro na criação de clínica:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 