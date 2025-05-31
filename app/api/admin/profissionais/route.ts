import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// POST - Criar profissionais para uma clínica
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clinica_id, profissionais } = body;

    if (!clinica_id || !profissionais || !Array.isArray(profissionais)) {
      return NextResponse.json(
        { error: 'clinica_id e profissionais são obrigatórios' },
        { status: 400 }
      );
    }

    const resultados = [];

    for (const profissional of profissionais) {
      try {
        // 1. Criar o profissional
        const dadosProfissional = {
          clinica_id: parseInt(clinica_id),
          nome: profissional.nome,
          titulo: profissional.titulo,
          documento_profissional: profissional.crm,
          calendar_id: profissional.calendar_id,
          dias_atendimento: profissional.dias_atendimento,
          horario_inicio: profissional.horario_inicio || '08:00:00',
          horario_fim: profissional.horario_fim || '18:00:00',
          duracao_consulta: profissional.duracao_consulta || 60,
          duracao_retorno: profissional.duracao_retorno || 30,
          duracao_procedimento: profissional.duracao_procedimento || 90,
          valor_consulta_especifica: profissional.valor_consulta ? parseFloat(profissional.valor_consulta.replace(/[^\d,]/g, '').replace(',', '.')) : null,
          realiza_procedimentos: profissional.procedimentos && profissional.procedimentos.length > 0,
          ativo: true
        };

        const responseProfissional = await fetch(`${SUPABASE_URL}/rest/v1/profissionais`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(dadosProfissional),
        });

        if (!responseProfissional.ok) {
          const errorText = await responseProfissional.text();
          console.error(`Erro ao criar profissional ${profissional.nome}:`, errorText);
          throw new Error(`Erro ao criar profissional ${profissional.nome}`);
        }

        const novoProfissional = await responseProfissional.json();
        const profissionalId = novoProfissional[0].id;

        // 2. Criar especialidades se não existirem e associar ao profissional
        if (profissional.especialidades && profissional.especialidades.length > 0) {
          for (const especialidadeNome of profissional.especialidades) {
            if (especialidadeNome.trim()) {
              // Verificar se especialidade já existe
              const responseEspecialidadeExiste = await fetch(
                `${SUPABASE_URL}/rest/v1/especialidades?clinica_id=eq.${clinica_id}&nome=eq.${encodeURIComponent(especialidadeNome)}`,
                {
                  headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                  },
                }
              );

              let especialidadeId;
              const especialidadesExistentes = await responseEspecialidadeExiste.json();

              if (especialidadesExistentes.length > 0) {
                especialidadeId = especialidadesExistentes[0].id;
              } else {
                // Criar nova especialidade
                const responseNovaEspecialidade = await fetch(`${SUPABASE_URL}/rest/v1/especialidades`, {
                  method: 'POST',
                  headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                  },
                  body: JSON.stringify({
                    clinica_id: parseInt(clinica_id),
                    nome: especialidadeNome,
                    ativa: true
                  }),
                });

                if (responseNovaEspecialidade.ok) {
                  const novaEspecialidade = await responseNovaEspecialidade.json();
                  especialidadeId = novaEspecialidade[0].id;
                }
              }

              // Associar profissional à especialidade
              if (especialidadeId) {
                await fetch(`${SUPABASE_URL}/rest/v1/profissional_especialidades`, {
                  method: 'POST',
                  headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    profissional_id: profissionalId,
                    especialidade_id: especialidadeId,
                    principal: false
                  }),
                });
              }
            }
          }
        }

        // 3. Criar procedimentos se não existirem e associar ao profissional
        if (profissional.procedimentos && profissional.procedimentos.length > 0) {
          for (const procedimentoNome of profissional.procedimentos) {
            if (procedimentoNome.trim()) {
              // Verificar se procedimento já existe
              const responseProcedimentoExiste = await fetch(
                `${SUPABASE_URL}/rest/v1/procedimentos?clinica_id=eq.${clinica_id}&nome=eq.${encodeURIComponent(procedimentoNome)}`,
                {
                  headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                  },
                }
              );

              let procedimentoId;
              const procedimentosExistentes = await responseProcedimentoExiste.json();

              if (procedimentosExistentes.length > 0) {
                procedimentoId = procedimentosExistentes[0].id;
              } else {
                // Criar novo procedimento
                const responseNovoProcedimento = await fetch(`${SUPABASE_URL}/rest/v1/procedimentos`, {
                  method: 'POST',
                  headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                  },
                  body: JSON.stringify({
                    clinica_id: parseInt(clinica_id),
                    nome: procedimentoNome,
                    categoria: 'estético',
                    duracao_media: 60,
                    valor_base: 200.00,
                    ativo: true
                  }),
                });

                if (responseNovoProcedimento.ok) {
                  const novoProcedimento = await responseNovoProcedimento.json();
                  procedimentoId = novoProcedimento[0].id;
                }
              }

              // Associar profissional ao procedimento
              if (procedimentoId) {
                await fetch(`${SUPABASE_URL}/rest/v1/profissional_procedimentos`, {
                  method: 'POST',
                  headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    profissional_id: profissionalId,
                    procedimento_id: procedimentoId
                  }),
                });
              }
            }
          }
        }

        resultados.push({
          success: true,
          profissional: novoProfissional[0],
          message: `Profissional ${profissional.nome} criado com sucesso`
        });

      } catch (error) {
        console.error(`Erro ao processar profissional ${profissional.nome}:`, error);
        resultados.push({
          success: false,
          profissional_nome: profissional.nome,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    }

    return NextResponse.json({
      success: true,
      resultados,
      total_processados: profissionais.length,
      sucessos: resultados.filter(r => r.success).length,
      erros: resultados.filter(r => !r.success).length
    });

  } catch (error) {
    console.error('Erro geral na criação de profissionais:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 