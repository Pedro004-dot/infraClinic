import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// GET - Buscar profissionais de uma clínica com suas relações
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clinicaId = Number(params.id);
    if (isNaN(clinicaId)) {
      return NextResponse.json(
        { error: 'ID da clínica inválido' },
        { status: 400 }
      );
    }

    // 1. Buscar profissionais básicos
    const profissionaisResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/infra_profissionais?clinica_id=eq.${clinicaId}&select=*&order=nome`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!profissionaisResponse.ok) {
      throw new Error('Erro ao buscar profissionais');
    }

    const profissionais = await profissionaisResponse.json();

    if (profissionais.length === 0) {
      return NextResponse.json([]);
    }

    const profissionaisIds = profissionais.map((p: any) => p.id);

    // 2. Buscar especialidades dos profissionais
    const especialidadesResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/infra_profissional_especialidade?profissional_id=in.(${profissionaisIds.join(',')})&select=profissional_id,especialidade_id,infra_especialidades(id,nome,descricao)`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // 3. Buscar sintomas dos profissionais
    const sintomasResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/infra_profissional_sintoma?profissional_id=in.(${profissionaisIds.join(',')})&select=profissional_id,sintoma_id,experiencia_nivel,infra_sintomas(id,nome,categoria)`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // 4. Buscar procedimentos dos profissionais
    const procedimentosResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/infra_profissional_procedimento?profissional_id=in.(${profissionaisIds.join(',')})&select=profissional_id,procedimento_id,valor_especifico,duracao_especifica,infra_procedimentos(id,nome,duracao_media,valor_base)`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Processar respostas
    const especialidades = especialidadesResponse.ok ? await especialidadesResponse.json() : [];
    const sintomas = sintomasResponse.ok ? await sintomasResponse.json() : [];
    const procedimentos = procedimentosResponse.ok ? await procedimentosResponse.json() : [];

    // 5. Combinar dados
    const profissionaisCompletos = profissionais.map((profissional: any) => {
      const profissionalEspecialidades = especialidades
        .filter((e: any) => e.profissional_id === profissional.id)
        .map((e: any) => e.infra_especialidades);

      const profissionalSintomas = sintomas
        .filter((s: any) => s.profissional_id === profissional.id)
        .map((s: any) => ({
          ...s.infra_sintomas,
          experiencia_nivel: s.experiencia_nivel
        }));

      const profissionalProcedimentos = procedimentos
        .filter((p: any) => p.profissional_id === profissional.id)
        .map((p: any) => ({
          ...p.infra_procedimentos,
          valor_especifico: p.valor_especifico,
          duracao_especifica: p.duracao_especifica
        }));

      return {
        ...profissional,
        especialidades: profissionalEspecialidades,
        sintomas: profissionalSintomas,
        procedimentos: profissionalProcedimentos
      };
    });

    return NextResponse.json(profissionaisCompletos);

  } catch (error) {
    console.error('Erro ao buscar profissionais:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 