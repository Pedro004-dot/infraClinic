-- =======================================
-- QUERY SIMPLIFICADA PARA O AGENTE AI
-- Versão mais direta e fácil de usar
-- =======================================

INSERT INTO agente_updates (
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
) VALUES (
    -- TELEFONE: Apenas números (ex: 5511987654321)
    '{{ $fromAI("telefone_limpo", "Extraia apenas números do telefone") }}',
    
    -- CLÍNICA: 3 (geral) ou 4 (estética)
    {{ $fromAI("clinica", "Se falar de botox/laser/estética retorne 4, senão retorne 3") }},
    
    -- NOME: Nome do paciente ou NULL
    '{{ $fromAI("nome", "Nome do paciente ou NULL") }}',
    
    -- STATUS: PRIMEIRO_CONTATO, LEAD_QUALIFICADO, AGENDADO, etc
    '{{ $fromAI("status", "Status do paciente") }}',
    
    -- PRIORIDADE: alta, media, baixa
    '{{ $fromAI("prioridade", "Urgência: alta/media/baixa") }}',
    
    -- MENSAGEM: Texto completo do usuário
    '{{ $fromAI("mensagem", "Mensagem do usuário") }}',
    
    -- TÓPICO: Assunto principal
    '{{ $fromAI("topico", "Assunto: Cardiologia, Botox, Agendamento, etc") }}',
    
    -- SENTIMENTO: positivo, neutro, negativo, preocupado
    '{{ $fromAI("sentimento", "Sentimento: positivo/neutro/negativo") }}',
    
    -- URGÊNCIA: alta, normal, baixa
    '{{ $fromAI("urgencia", "Urgência: alta/normal/baixa") }}',
    
    -- CANAL: whatsapp, instagram, etc
    '{{ $fromAI("canal", "Canal: whatsapp/instagram/telefone") }}'
);

-- Processar imediatamente
SELECT processar_agente_updates();

-- =======================================
-- MAPEAMENTO DIRETO DO SEU CÓDIGO:
-- =======================================

/*
SUA VARIÁVEL ANTIGA          -> NOVA COLUNA
=====================================
telefone                    -> telefone
mensagem_usuario            -> mensagem
mensagem_agente             -> (não usado - vai para interações)
intencao                    -> topico
especialidade               -> topico  
urgencia                    -> urgencia + prioridade
status_sugerido             -> status_novo
sentimento                  -> sentimento
(novo)                      -> clinica_id
(novo)                      -> canal
*/

-- =======================================
-- IDENTIFICAÇÃO DE CLÍNICA:
-- =======================================

/*
CLÍNICA 3 (Médica Geral):
- Palavras: cardiologia, pressão, check-up, Dr. Carlos
- Contexto: médico, exame, consulta, coração

CLÍNICA 4 (Estética):  
- Palavras: botox, preenchimento, laser, Dra. Marina
- Contexto: estética, beleza, harmonização, rugas
*/ 