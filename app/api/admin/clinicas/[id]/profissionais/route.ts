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

    // Buscar profissionais usando a view completa
    const profissionaisResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/vw_profissionais_info_completa?clinica_id=eq.${clinicaId}&order=profissional_nome`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!profissionaisResponse.ok) {
      const errorText = await profissionaisResponse.text();
      console.error('Erro ao buscar profissionais:', errorText);
      throw new Error('Erro ao buscar profissionais');
    }

    const profissionais = await profissionaisResponse.json();

    // Formatar dados para compatibilidade com frontend
    const profissionaisFormatados = profissionais.map((profissional: any) => ({
      id: profissional.profissional_id,
      nome: profissional.profissional_nome,
      titulo: profissional.profissional_titulo,
      crm: profissional.crm,
      calendar_id: profissional.calendar_id,
      valor_consulta: profissional.valor_consulta,
      dias_atendimento: profissional.dias_atendimento,
      horario_inicio: profissional.horario_inicio,
      horario_fim: profissional.horario_fim,
      duracao_consulta: profissional.duracao_consulta,
      duracao_procedimento: profissional.duracao_procedimento,
      realiza_procedimentos: profissional.realiza_procedimentos,
      ativo: profissional.profissional_ativo,
      // Arrays de especialidades e procedimentos
      especialidades: profissional.especialidades_disponivel || [],
      procedimentos: profissional.procedimentos_nomes || [],
      // Campos formatados para o agente
      resumo_profissional: profissional.resumo_profissional,
      info_agente: profissional.info_agente,
      // Campos originais para compatibilidade
      documento_profissional: profissional.crm,
      valor_consulta_especifica: profissional.valor_consulta,
      duracao_consulta_min: profissional.duracao_consulta,
      duracao_retorno_min: 30, // valor padrão
      duracao_procedimento_min: profissional.duracao_procedimento
    }));

    return NextResponse.json(profissionaisFormatados);

  } catch (error) {
    console.error('Erro ao buscar profissionais:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 