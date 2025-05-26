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
          horario_atendimento: profissional.horario_atendimento,
          duracao_consulta: profissional.duracao_consulta,
          duracao_retorno: profissional.duracao_retorno,
          duracao_procedimento: profissional.duracao_procedimento,
          valor_consulta_especifica: profissional.valor_consulta ? parseFloat(profissional.valor_consulta.replace(/[^\d,]/g, '').replace(',', '.')) : null,
          ativo: true
        };

        const responseProfissional = await fetch(`${SUPABASE_URL}/rest/v1/infra_profissionais`, {
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
                `${SUPABASE_URL}/rest/v1/infra_especialidades?clinica_id=eq.${clinica_id}&nome=eq.${encodeURIComponent(especialidadeNome)}`,
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
                const responseNovaEspecialidade = await fetch(`${SUPABASE_URL}/rest/v1/infra_especialidades`, {
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
                await fetch(`${SUPABASE_URL}/rest/v1/infra_profissional_especialidade`, {
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

        // 3. Criar sintomas se não existirem e associar ao profissional
        if (profissional.sintomas_atendidos && profissional.sintomas_atendidos.length > 0) {
          for (const sintomaNome of profissional.sintomas_atendidos) {
            if (sintomaNome.trim()) {
              // Verificar se sintoma já existe
              const responseSintomaExiste = await fetch(
                `${SUPABASE_URL}/rest/v1/infra_sintomas?clinica_id=eq.${clinica_id}&nome=eq.${encodeURIComponent(sintomaNome)}`,
                {
                  headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                  },
                }
              );

              let sintomaId;
              const sintomasExistentes = await responseSintomaExiste.json();

              if (sintomasExistentes.length > 0) {
                sintomaId = sintomasExistentes[0].id;
              } else {
                // Criar novo sintoma
                const responseNovoSintoma = await fetch(`${SUPABASE_URL}/rest/v1/infra_sintomas`, {
                  method: 'POST',
                  headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                  },
                  body: JSON.stringify({
                    clinica_id: parseInt(clinica_id),
                    nome: sintomaNome,
                    categoria: 'geral'
                  }),
                });

                if (responseNovoSintoma.ok) {
                  const novoSintoma = await responseNovoSintoma.json();
                  sintomaId = novoSintoma[0].id;
                }
              }

              // Associar profissional ao sintoma
              if (sintomaId) {
                await fetch(`${SUPABASE_URL}/rest/v1/infra_profissional_sintoma`, {
                  method: 'POST',
                  headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    profissional_id: profissionalId,
                    sintoma_id: sintomaId,
                    experiencia_nivel: 'intermediario'
                  }),
                });
              }
            }
          }
        }

        // 4. Criar procedimentos se não existirem e associar ao profissional
        if (profissional.procedimentos && profissional.procedimentos.length > 0) {
          for (const procedimentoNome of profissional.procedimentos) {
            if (procedimentoNome.trim()) {
              // Verificar se procedimento já existe
              const responseProcedimentoExiste = await fetch(
                `${SUPABASE_URL}/rest/v1/infra_procedimentos?clinica_id=eq.${clinica_id}&nome=eq.${encodeURIComponent(procedimentoNome)}`,
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
                const responseNovoProcedimento = await fetch(`${SUPABASE_URL}/rest/v1/infra_procedimentos`, {
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
                    duracao_media: profissional.duracao_procedimento || 60,
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
                await fetch(`${SUPABASE_URL}/rest/v1/infra_profissional_procedimento`, {
                  method: 'POST',
                  headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    profissional_id: profissionalId,
                    procedimento_id: procedimentoId,
                    duracao_especifica: profissional.duracao_procedimento || 60
                  }),
                });
              }
            }
          }
        }

        resultados.push({
          sucesso: true,
          profissional: novoProfissional[0],
          nome: profissional.nome
        });

      } catch (error) {
        console.error(`Erro ao processar profissional ${profissional.nome}:`, error);
        resultados.push({
          sucesso: false,
          erro: error instanceof Error ? error.message : 'Erro desconhecido',
          nome: profissional.nome
        });
      }
    }

    return NextResponse.json({
      message: 'Processamento de profissionais concluído',
      resultados
    });

  } catch (error) {
    console.error('Erro na criação de profissionais:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 