import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Tipos para as views do banco
export interface DashboardMetrics {
  clinica_id: number;
  clinica_nome: string;
  
  // Valores absolutos
  novos_leads_hoje: number;
  agendamentos_hoje: number;
  tempo_resposta_minutos: number;
  taxa_conversao_hoje: number;
  

  variacao_leads: number;     
  variacao_agendamentos: number;
  variacao_tempo_resposta: number;
  variacao_taxa_conversao: number;
  
  // Dados por período
  novos_leads_semana: number;
  agendamentos_semana: number;
  novos_leads_mes: number;
  agendamentos_mes: number;
}

export interface ConversaRecente {
  id: number;
  clinica_id: number;
  paciente_id: number;
  paciente_nome: string;       // Nome completo do paciente
  intencao: string;            // Resumo da conversa
  canal: string;               // 'whatsapp', 'instagram', etc
  data_interacao: Date;
  tempo: string;               // Já formatado: "2 horas atrás", "1 dia atrás"
  status_atual: string;        // Status do paciente no funil
  topico: string;              // 'agendamento', 'duvida', etc
}

export interface KanbanCard {
  // Dados do paciente
  id: number;
  clinica_id: number;
  nome: string;
  nome_preferido: string;
  telefone: string;
  email: string;
  tags: string[];              // ['vip', 'gestante', etc]
  prioridade: 'alta' | 'media' | 'baixa';
  
  // Status e tempo
  status_atual: string;        // 'LEAD_QUALIFICADO', 'AGENDADO', etc
  tempo_no_status: string;     // Já formatado: "2 horas atrás"
  detalhes_status: object;     // JSON com detalhes específicos
  
  // Última interação
  ultimo_topico: string;       // 'Dermatologia', 'Consulta', etc
  ultima_intencao: string;     // 'agendar', 'informacao', etc
  
  // Próxima consulta
  proxima_consulta: Date | null;
  tipo_consulta: string | null;
  profissional_nome: string | null;
  
  // Contagem
  total_no_status: number;     // Total de cards neste status
}

export interface KanbanCount {
  clinica_id: number;
  status: string;              // 'LEAD_QUALIFICADO', 'AGENDADO', etc
  total: number;               // Quantidade neste status
} 