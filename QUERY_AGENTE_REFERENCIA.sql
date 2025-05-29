-- ====================================
-- QUERY DE REFERÊNCIA PARA O AGENTE AI
-- Tabela: agente_updates
-- ====================================

INSERT INTO agente_updates (
    telefone,           -- Telefone limpo (apenas números)
    clinica_id,         -- ID da clínica (3 ou 4)
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
    
    {{ $fromAI("clinica_id", "OBRIGATÓRIO: Analise o contexto e retorne: 3 (para assuntos médicos gerais, cardiologia, check-up, exames, Dr. Carlos, Dra. Ana) ou 4 (para estética, botox, preenchimento, laser, harmonização, Dra. Marina, Dra. Camila)") }},
    
    '{{ $fromAI("nome_paciente", "Extraia o nome do paciente se mencionado na conversa, senão retorne NULL") }}',
    
    '{{ $fromAI("status_novo", "Classifique com EXATAMENTE uma opção: PRIMEIRO_CONTATO (primeira vez/inicial), LEAD_QUALIFICADO (demonstrou interesse real/quer agendar), AGENDADO (consulta marcada), EM_ATENDIMENTO (sendo atendido), CONCLUIDO (finalizado), FOLLOW_UP (acompanhamento/retorno)") }}',
    
    '{{ $fromAI("prioridade", "Baseado na urgência, retorne: alta (emergência, dor forte, urgente), media (situação normal), baixa (informações gerais)") }}',
    
    '{{ $fromAI("mensagem_usuario", "Copie exatamente a mensagem que o usuário enviou, sem modificações") }}',
    
    '{{ $fromAI("topico", "Identifique o assunto principal: Cardiologia, Dermatologia Estética, Harmonização Facial, Laser, Agendamento, Emergência, Check-up, Exames, Preenchimento, Botox, Criolipólise, Consulta Geral, Informações, ou o assunto específico mencionado") }}',
    
    '{{ $fromAI("sentimento", "Classifique como: positivo (elogios, satisfeito, animado), neutro (objetivo, normal, informativo), negativo (reclamação, insatisfeito, preocupado), preocupado (ansioso, com medo)") }}',
    
    '{{ $fromAI("urgencia", "Classifique como: alta (emergência, dor forte, palavra urgente), normal (situação comum), baixa (informações gerais, sem pressa)") }}',
    
    '{{ $fromAI("canal", "Identifique o canal: whatsapp, instagram, facebook, telefone, email, site, ou o canal específico usado") }}'
);

-- Processar automaticamente após inserção
SELECT processar_agente_updates();

-- ====================================
-- EXEMPLOS DE USO PRÁTICO:
-- ====================================

-- Exemplo 1: Paciente cardiologia (Clínica ID: 3)
INSERT INTO agente_updates (telefone, clinica_id, nome, status_novo, prioridade, mensagem, topico, sentimento, urgencia, canal)
VALUES ('5511987654321', 3, 'João Silva', 'PRIMEIRO_CONTATO', 'alta', 'Estou com dores no peito, preciso de um cardiologista urgente', 'Cardiologia', 'preocupado', 'alta', 'whatsapp');

-- Exemplo 2: Paciente estética (Clínica ID: 4)  
INSERT INTO agente_updates (telefone, clinica_id, nome, status_novo, prioridade, mensagem, topico, sentimento, urgencia, canal)
VALUES ('5511976543210', 4, 'Maria Costa', 'LEAD_QUALIFICADO', 'media', 'Quero fazer botox na testa, quanto custa?', 'Harmonização Facial', 'positivo', 'normal', 'instagram');

-- Exemplo 3: Agendamento confirmado
INSERT INTO agente_updates (telefone, clinica_id, status_novo, mensagem, topico, canal)
VALUES ('5511965432109', 3, 'AGENDADO', 'Consulta confirmada para terça-feira às 14h', 'Agendamento', 'whatsapp');

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

-- Ver dashboard atualizado
SELECT clinica_nome, novos_leads_hoje, agendados 
FROM vw_dashboard_principal 
WHERE clinica_id IN (3, 4); 