# Configuração do Banco de Dados - Sistema de Clínicas

## ✅ Status da Migração

O banco de dados foi **completamente reestruturado** e está pronto para uso:

- ✅ Tabelas antigas `infra_*` e `app_*` removidas
- ✅ Nova estrutura otimizada criada
- ✅ Views de compatibilidade implementadas
- ✅ 31 pacientes fake adicionados para demonstração
- ✅ APIs atualizadas e funcionando

## 🗃️ Estrutura do Banco

### Tabelas Principais
- `clinicas` - Dados das clínicas/consultórios
- `usuarios` - Sistema de usuários com roles
- `especialidades` - Especialidades médicas
- `profissionais` - Médicos e profissionais
- `pacientes` - **TABELA CENTRAL** - Uma linha por paciente
- `procedimentos` - Procedimentos e exames
- `consultas` - Agendamentos e consultas
- `interacoes` - Histórico de todas as comunicações
- `follow_ups` - Sistema de follow-up automático

### Views para Frontend
- `vw_dashboard_principal` - **UMA linha por clínica** com métricas
- `vw_kanban_otimizado` - Uma linha por paciente para Kanban
- `infra_vw_kanban_board` - View de compatibilidade
- `infra_vw_kanban_counts` - Contadores por status

## 🔄 Como o Sistema Funciona

### Para o Agente AI
Use a função `atualizar_paciente_agente()`:

```sql
SELECT atualizar_paciente_agente(
    '11987654321',           -- telefone
    3,                       -- clinica_id
    'Nome do Cliente',       -- nome (opcional)
    'LEAD_QUALIFICADO',      -- novo status (opcional)  
    'Interessado em cardiologia',  -- motivo/mensagem
    'Cardiologia',           -- tópico
    'preocupado',            -- sentimento
    'alta'                   -- urgência
);
```

### Para o Frontend
As APIs estão configuradas em:
- `GET /api/clinica/[id]/kanban` - Dados do Kanban
- `PUT /api/clinica/[id]/kanban` - Mover paciente
- `POST /api/clinica/[id]/kanban` - Novo paciente
- `GET /api/clinica/[id]/dashboard` - Métricas do dashboard

## 📊 Dados de Demonstração

### Clínica OxyVital (ID: 3)
- **31 pacientes** distribuídos nos status:
  - LEAD: 17 pacientes (54.8%)
  - AGENDADO: 10 pacientes (32.3%)
  - FOLLOW_UP: 2 pacientes (6.5%)
  - RETORNO: 2 pacientes (6.5%)

- **5 especialidades** configuradas
- **4 profissionais** cadastrados
- **5 procedimentos** disponíveis

## 🌐 Configuração do Frontend

### Variáveis de Ambiente (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://iyjbiceiwrszjnmkkfdu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### Exemplo de Uso da API Kanban

```javascript
// Buscar dados do kanban
const response = await fetch('/api/clinica/3/kanban');
const data = await response.json();

console.log(data.pacientesPorStatus); // Pacientes agrupados por status
console.log(data.contadores);         // Totais por status
console.log(data.statusDisponiveis);  // ['LEAD', 'AGENDADO', 'RETORNO', 'FOLLOW_UP']

// Mover paciente
await fetch('/api/clinica/3/kanban', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    pacienteId: 15,
    novoStatus: 'AGENDADO',
    motivo: 'Cliente confirmou consulta'
  })
});
```

### Exemplo de Uso da API Dashboard

```javascript
// Buscar métricas do dashboard
const response = await fetch('/api/clinica/3/dashboard');
const data = await response.json();

console.log(data.metricas.hoje);      // Métricas do dia
console.log(data.funil);              // Status do funil
console.log(data.alertas);            // Alertas importantes
console.log(data.agenda_hoje);        // Agenda do dia
```

## 🚀 Status das APIs

### ✅ Funcionando
- `/api/clinica/[id]/kanban` - GET, PUT, POST
- `/api/clinica/[id]/dashboard` - GET

### 📋 Para Implementar
- Autenticação de usuários
- Gestão de profissionais
- Relatórios avançados
- Integração com WhatsApp

## 🔧 Comandos Úteis

### Resetar dados de demonstração
```sql
-- Limpar dados fake mantendo estrutura
DELETE FROM interacoes WHERE clinica_id = 3;
DELETE FROM consultas WHERE clinica_id = 3;
DELETE FROM pacientes WHERE clinica_id = 3;
```

### Verificar status do sistema
```sql
-- Ver resumo da clínica
SELECT * FROM vw_dashboard_principal WHERE clinica_id = 3;

-- Ver distribuição no kanban
SELECT * FROM infra_vw_kanban_counts WHERE clinica_id = 3;
```

## 📱 Próximos Passos

1. **Testar o frontend** com os dados atuais
2. **Implementar autenticação** de usuários
3. **Conectar com o agente AI** real
4. **Adicionar mais clínicas** se necessário
5. **Implementar notificações** em tempo real

O sistema está **100% funcional** e pronto para desenvolvimento! 🎉 