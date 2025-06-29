import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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

// Tipo atualizado para conversas recentes com dados da IA
export interface ConversaRecente {
  id: number;
  clinica_id: number;
  paciente_id: number | null;
  paciente_nome: string;
  intencao: string;
  canal: string;
  data_interacao: Date;
  tempo: string;
  status_atual: string;
  topico: string;
  // Novos campos da IA
  sentimento?: string;
  origem_lead?: string;
  campanha_origem?: string;
  total_mensagens?: number;
  tempo_primeira_resposta?: number;
}

// Tipo atualizado para cards do Kanban com dados da IA
export interface KanbanCard {
  // Dados do paciente
  id: number;
  clinica_id: number;
  nome: string;
  nome_preferido: string;
  telefone: string;
  email: string | null;
  tags: string[];              // ['vip', 'gestante', etc]
  prioridade: 'alta' | 'media' | 'baixa';
  
  // Status e tempo
  status_atual: string;        // 'LEAD', 'AGENDADO', etc
  tempo_no_status: string;     // Já formatado: "2 horas atrás"
  detalhes_status?: object;    // JSON com detalhes específicos
  
  // Última interação
  ultimo_topico: string;       // 'Dermatologia', 'Consulta', etc
  ultima_intencao: string;     // 'agendar', 'informacao', etc
  
  // Próxima consulta
  proxima_consulta: Date | null;
  tipo_consulta: string | null;
  profissional_nome: string | null;
  
  // Dados únicos da IA (NOVOS)
  sentimento: string;          // 'positivo', 'neutro', 'negativo', 'preocupado'
  topicos_abordados: string | null;
  origem_lead: string;         // 'whatsapp', 'instagram', etc
  campanha_origem: string | null;
  
  // Informações de follow-up (NOVOS)
  follow_up_agendado: boolean;
  follow_up_data: string | null;
  follow_up_tipo: string | null;
  
  // Métricas de conversação (NOVOS)
  total_mensagens_recebidas: number;
  total_mensagens_enviadas: number;
  tempo_primeira_resposta: number | null;
  
  // Contagem
  total_no_status?: number;    // Total de cards neste status
}

export interface KanbanCount {
  clinica_id: number;
  status: string;              // 'LEAD', 'AGENDADO', etc
  total: number;               // Quantidade neste status
}

// Novos tipos para insights da IA
export interface InsightsIA {
  sentimentos: {
    positivo: number;
    neutro: number;
    negativo: number;
    preocupado: number;
  };
  intencoes_principais: Record<string, number>;
  origens_lead: Record<string, number>;
  follow_ups_pendentes: number;
}

// Tipo para estatísticas do Kanban
export interface EstatisticasKanban {
  total_pacientes: number;
  por_prioridade: {
    alta: number;
    media: number;
    baixa: number;
  };
  por_sentimento: {
    positivo: number;
    neutro: number;
    negativo: number;
    preocupado: number;
  };
  por_origem: Record<string, number>;
  agendamentos_pendentes: number;
  follow_ups_agendados: number;
}

// Tipo para alertas inteligentes
export interface AlertaInteligente {
  tipo: 'urgent' | 'warning' | 'info';
  titulo: string;
  mensagem: string;
  acao: string;
}

// Tipo para agenda do dia
export interface AgendaDia {
  id: number;
  paciente_nome: string;
  telefone: string;
  data_agendamento: string;
  profissional_nome: string | null;
  especialidade_nome: string | null;
  valor_consulta: number | null;
  observacoes: string | null;
}

// Tipo completo para resposta do Dashboard
export interface DashboardResponse {
  metricas: {
    hoje: {
      novos_leads: number;
      agendamentos: number;
      taxa_conversao: number;
      tempo_resposta_medio: number;
      faturamento: number;
    };
    semana: {
      novos_leads: number;
      agendamentos: number;
    };
    mes: {
      novos_leads: number;
      agendamentos: number;
      faturamento: number;
    };
  };
  funil: {
    primeiro_contato: number;
    leads_qualificados: number;
    agendados: number;
    em_atendimento: number;
    concluidos: number;
    cancelados: number;
  };
  alertas: AlertaInteligente[];
  conversas_recentes: ConversaRecente[];
  agenda_hoje: AgendaDia[];
  meta: {
    clinica_id: number;
    clinica_nome: string;
    ultima_atualizacao: string;
    total_pacientes_ativos: number;
    fonte_dados: string;
    total_conversas: number;
  };
  insights_ia: InsightsIA; // NOVO
}

// Tipo completo para resposta do Kanban
export interface KanbanResponse {
  pacientesPorStatus: Record<string, KanbanCard[]>;
  contadores: Record<string, number>;
  statusDisponiveis: string[];
  estatisticas: EstatisticasKanban; // NOVO
  total_pacientes: number;
  ultima_atualizacao: string;
  fonte_dados: string;
} 