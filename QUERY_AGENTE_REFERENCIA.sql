-- ====================================
-- QUERY DE REFERÊNCIA PARA O AGENTE AI
-- Tabela: agente_updates (COM UPSERT)
-- ====================================

-- UPSERT: Insere novo ou atualiza existente
INSERT INTO agente_updates (
    telefone,           -- Telefone limpo (apenas números)
    clinica_id,         -- ID da clínica (sempre 4 - DermaEstética)
    nome,               -- Nome do paciente (se fornecido)
    status_novo,        -- Status sugerido pelo agente
    prioridade,         -- Prioridade baseada na urgência
    mensagem,           -- Mensagem completa do usuário
    topico,             -- Tópico/especialidade identificada
    sentimento,         -- Sentimento da conversa
    urgencia,           -- Urgência da situação
    canal               -- Canal de comunicação
) VALUES (
    '{{ $fromAI("telefone", "Extraia APENAS os números do telefone removendo @c.us e outros caracteres. Exemplo: 5521999887766@c.us deve retornar 5521999887766") }}',
    
    4,  -- *** SEMPRE 4 (DermaEstética Clinic) ***
    
    '{{ $fromAI("nome_paciente", "Extraia o nome do paciente se mencionado na conversa, senão retorne NULL") }}',
    
    '{{ $fromAI("status_novo", "Classifique com EXATAMENTE uma opção: PRIMEIRO_CONTATO (primeira vez/inicial), LEAD_QUALIFICADO (demonstrou interesse real/quer agendar), AGENDADO (consulta marcada), EM_ATENDIMENTO (sendo atendido), CONCLUIDO (finalizado), FOLLOW_UP (acompanhamento/retorno), DADOS_COLETADOS (coletou nome/info)") }}',
    
    '{{ $fromAI("prioridade", "Baseado na urgência, retorne: alta (emergência, dor forte, urgente), media (situação normal), baixa (informações gerais)") }}',
    
    '{{ $fromAI("mensagem_usuario", "Copie exatamente a mensagem que o usuário enviou, sem modificações") }}',
    
    '{{ $fromAI("topico", "Identifique o assunto principal: Harmonização Facial, Preenchimento Labial, Botox, Laser CO2, IPL, Radiofrequência, Criolipólise, Agendamento, Emergência, Consulta Geral, Informações, ou o assunto específico mencionado") }}',
    
    '{{ $fromAI("sentimento", "Classifique como: positivo (elogios, satisfeito, animado), neutro (objetivo, normal, informativo), negativo (reclamação, insatisfeito, preocupado), preocupado (ansioso, com medo)") }}',
    
    '{{ $fromAI("urgencia", "Classifique como: alta (emergência, dor forte, palavra urgente), normal (situação comum), baixa (informações gerais, sem pressa)") }}',
    
    '{{ $fromAI("canal", "Identifique o canal: whatsapp, instagram, facebook, telefone, email, site, ou o canal específico usado") }}'

-- *** UPSERT: Se telefone já existe, atualiza os dados ***
) ON CONFLICT (telefone, clinica_id) 
DO UPDATE SET 
    nome = EXCLUDED.nome,
    status_novo = EXCLUDED.status_novo,
    prioridade = EXCLUDED.prioridade,
    mensagem = EXCLUDED.mensagem,
    topico = EXCLUDED.topico,
    sentimento = EXCLUDED.sentimento,
    urgencia = EXCLUDED.urgencia,
    canal = EXCLUDED.canal,
    processado = false,        -- Resetar para reprocessar
    data_update = NOW(),       -- Atualizar timestamp
    erro = null;               -- Limpar erros

-- Processar automaticamente após inserção/atualização
SELECT processar_agente_updates();

-- ====================================
-- EXEMPLOS DE USO PRÁTICO:
-- ====================================

-- Exemplo 1: Novo paciente estética
INSERT INTO agente_updates (telefone, clinica_id, nome, status_novo, prioridade, mensagem, topico, sentimento, urgencia, canal)
VALUES ('5511987654321', 4, 'Ana Silva', 'PRIMEIRO_CONTATO', 'media', 'Quero fazer botox na testa, quanto custa?', 'Harmonização Facial', 'positivo', 'normal', 'whatsapp')
ON CONFLICT (telefone, clinica_id) DO UPDATE SET 
    nome = EXCLUDED.nome, status_novo = EXCLUDED.status_novo, prioridade = EXCLUDED.prioridade,
    mensagem = EXCLUDED.mensagem, topico = EXCLUDED.topico, sentimento = EXCLUDED.sentimento,
    urgencia = EXCLUDED.urgencia, canal = EXCLUDED.canal, processado = false, data_update = NOW(), erro = null;

-- Exemplo 2: Atualizar mesmo paciente
INSERT INTO agente_updates (telefone, clinica_id, nome, status_novo, prioridade, mensagem, topico, sentimento, urgencia, canal)
VALUES ('5511987654321', 4, 'Ana Silva', 'AGENDADO', 'alta', 'Quero agendar para amanhã às 14h', 'Agendamento', 'positivo', 'alta', 'whatsapp')
ON CONFLICT (telefone, clinica_id) DO UPDATE SET 
    nome = EXCLUDED.nome, status_novo = EXCLUDED.status_novo, prioridade = EXCLUDED.prioridade,
    mensagem = EXCLUDED.mensagem, topico = EXCLUDED.topico, sentimento = EXCLUDED.sentimento,
    urgencia = EXCLUDED.urgencia, canal = EXCLUDED.canal, processado = false, data_update = NOW(), erro = null;

-- ====================================
-- VERIFICAÇÕES ÚTEIS:
-- ====================================

-- Ver últimas inserções/atualizações
SELECT telefone, nome, status_novo, data_update, processado 
FROM agente_updates 
ORDER BY data_update DESC;

-- Ver contagem por telefone (deve ser sempre 1)
SELECT telefone, COUNT(*) as quantidade
FROM agente_updates 
GROUP BY telefone
HAVING COUNT(*) > 1;  -- Se retornar alguma linha, há problema!

-- Ver dashboard atualizado
SELECT clinica_nome, novos_leads_hoje, agendados 
FROM vw_dashboard_principal 
WHERE clinica_id = 4;

-- ====================================
-- CLÍNICA DISPONÍVEL:
-- ====================================

/*
ID: 4 - DermaEstética Clinic (Estética)  
- Harmonização Facial, Laser, Tratamentos Corporais
- Dra. Marina Fernandes, Dra. Camila Santos
- Procedimentos: Botox, Preenchimento, Laser CO2, IPL, etc.
- Palavras-chave: botox, preenchimento, laser, estética, harmonização
*/

-- ====================================
-- CLÍNICAS DISPONÍVEIS:
-- ====================================

/*
ID: 3 - Clínica OxyVital (Médica Geral)
- Cardiologia, Clínica Geral, Exames
- Dr. Carlos Silva, Dra. Ana Santos
- Palavras-chave: cardiologia, pressão, check-up, médico

ID: 4 - DermaEstética Clinic (Estética)  
- Harmonização Facial, Laser, Tratamentos
- Dra. Marina Fernandes, Dra. Camila Santos
- Palavras-chave: botox, preenchimento, laser, estética
*/

-- ====================================
-- MAPEAMENTO DE CAMPOS:
-- ====================================

/*
ANTIGO (função) -> NOVO (agente_updates)
----------------------------------------
telefone         -> telefone (limpo)
mensagem_usuario -> mensagem  
intencao        -> topico
especialidade   -> topico
urgencia        -> urgencia + prioridade
status_sugerido -> status_novo
sentimento      -> sentimento
N/A             -> clinica_id (NOVO - obrigatório)
N/A             -> canal (NOVO - identificar origem)
*/

-- ====================================
-- VERIFICAÇÕES ÚTEIS:
-- ====================================

-- Ver últimas inserções
SELECT * FROM agente_updates 
WHERE processado = false 
ORDER BY data_update DESC;

-- Ver resultados processados
SELECT * FROM agente_updates 
WHERE processado = true 
ORDER BY data_update DESC 
LIMIT 10; 