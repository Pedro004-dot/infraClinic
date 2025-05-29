# Instruções para o Agente AI - Atualização de Pacientes

## 📋 TABELA PRINCIPAL PARA ATUALIZAR

### `agente_updates` - Tabela para inserção direta do agente

O agente deve **SEMPRE** inserir dados nesta tabela. O sistema processará automaticamente.

```sql
INSERT INTO agente_updates (
    telefone,           -- OBRIGATÓRIO: telefone do paciente (com DDD)
    clinica_id,         -- OBRIGATÓRIO: sempre usar 3 (Clínica OxyVital)
    nome,               -- Opcional: nome do paciente
    status_novo,        -- Opcional: novo status (ver opções abaixo)
    prioridade,         -- Opcional: alta, media, baixa
    mensagem,           -- Opcional: mensagem/conversa do paciente
    topico,             -- Opcional: assunto da conversa
    sentimento,         -- Opcional: positivo, neutro, negativo, preocupado
    urgencia,           -- Opcional: alta, normal, baixa
    canal               -- Opcional: whatsapp, instagram, telefone, etc
) VALUES (
    '11987654321',      -- Telefone com DDD
    3,                  -- Clínica OxyVital
    'João Silva',       -- Nome
    'LEAD_QUALIFICADO', -- Status
    'alta',             -- Prioridade
    'Cliente interessado em consulta cardiológica',
    'Cardiologia',      -- Tópico
    'preocupado',       -- Sentimento
    'alta',             -- Urgência
    'whatsapp'          -- Canal
);
```

## 📊 STATUS DISPONÍVEIS

```sql
-- Ver opções disponíveis
SELECT * FROM agente_status_opcoes;
```

| Status | Descrição |
|--------|-----------|
| `PRIMEIRO_CONTATO` | Novo lead que acabou de entrar em contato |
| `LEAD_QUALIFICADO` | Lead demonstrou interesse real |
| `AGENDADO` | Consulta ou procedimento agendado |
| `EM_ATENDIMENTO` | Paciente sendo atendido no momento |
| `CONCLUIDO` | Atendimento finalizado com sucesso |
| `FOLLOW_UP` | Aguardando retorno ou acompanhamento |

## 🎯 PRIORIDADES

| Prioridade | Quando usar |
|------------|-------------|
| `alta` | Urgente, emergência, VIP |
| `media` | Situação normal |
| `baixa` | Pode aguardar |

## 💬 EXEMPLOS PRÁTICOS

### 1. Novo paciente com interesse em consulta
```sql
INSERT INTO agente_updates (telefone, clinica_id, nome, status_novo, prioridade, mensagem, topico, sentimento, urgencia, canal)
VALUES ('11999888777', 3, 'Maria Santos', 'PRIMEIRO_CONTATO', 'media', 'Boa tarde, gostaria de agendar uma consulta com cardiologista', 'Cardiologia', 'neutro', 'normal', 'whatsapp');
```

### 2. Cliente urgente com dor
```sql
INSERT INTO agente_updates (telefone, clinica_id, status_novo, prioridade, mensagem, topico, sentimento, urgencia, canal)
VALUES ('11888777666', 3, 'LEAD_QUALIFICADO', 'alta', 'Estou com fortes dores no peito, preciso de atendimento urgente', 'Emergência', 'preocupado', 'alta', 'whatsapp');
```

### 3. Atualizar status de paciente existente
```sql
INSERT INTO agente_updates (telefone, clinica_id, status_novo, mensagem, topico, canal)
VALUES ('11987654321', 3, 'AGENDADO', 'Consulta agendada para amanhã às 14h', 'Agendamento', 'whatsapp');
```

### 4. Follow-up simples
```sql
INSERT INTO agente_updates (telefone, clinica_id, status_novo, mensagem, topico, sentimento, canal)
VALUES ('11777666555', 3, 'FOLLOW_UP', 'Como está se sentindo após o exame?', 'Pós-consulta', 'positivo', 'whatsapp');
```

## 🔍 CONSULTAR PACIENTES EXISTENTES

```sql
-- Ver todos os pacientes da clínica
SELECT * FROM agente_pacientes_clinica WHERE clinica_id = 3;

-- Buscar paciente específico
SELECT * FROM agente_pacientes_clinica 
WHERE telefone = '11987654321' AND clinica_id = 3;

-- Ver pacientes por status
SELECT * FROM agente_pacientes_clinica 
WHERE status_atual = 'PRIMEIRO_CONTATO' AND clinica_id = 3;
```

## ⚡ PROCESSAMENTO AUTOMÁTICO

Após inserir na `agente_updates`, execute para processar:

```sql
-- Processar todas as atualizações pendentes
SELECT processar_agente_updates();
```

## 🚨 REGRAS IMPORTANTES

1. **SEMPRE usar telefone com DDD** (ex: 11987654321)
2. **SEMPRE usar clinica_id ** (Clínica OxyVital)
3. **NÃO editar diretamente** as tabelas `pacientes` ou `interacoes`
4. **Usar apenas** status da lista permitida
5. **Se paciente não existir**, será criado automaticamente
6. **Se paciente existir**, será atualizado

## 📈 VERIFICAR RESULTADOS

```sql
-- Ver últimas atualizações processadas
SELECT * FROM agente_updates 
WHERE processado = true 
ORDER BY data_update DESC 
LIMIT 10;

-- Ver erros se houver
SELECT * FROM agente_updates 
WHERE erro IS NOT NULL;

-- Ver dashboard atualizado
SELECT * FROM vw_dashboard_principal WHERE clinica_id = 3;
```

## 🎯 WORKFLOW COMPLETO

1. **Recebeu mensagem** → INSERT na `agente_updates`
2. **Sistema processa** → Atualiza `pacientes` e `interacoes`
3. **Dashboard atualiza** → Métricas em tempo real
4. **Kanban atualiza** → Novo card ou movimentação

**✅ SIMPLES E DIRETO!** 