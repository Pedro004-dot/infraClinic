import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface RealtimeCallbacks {
  onNewPatient?: () => void
  onNewAppointment?: () => void
  onNewInteraction?: () => void
  onStatusChange?: () => void
  clinicaId: number
}

export function useRealtime({
  onNewPatient,
  onNewAppointment,
  onNewInteraction,
  onStatusChange,
  clinicaId
}: RealtimeCallbacks) {
  useEffect(() => {
    // Canal para novos pacientes
    const pacientesChannel = supabase
      .channel('pacientes-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'infra_pacientes',
        filter: `clinica_id=eq.${clinicaId}`
      }, (payload) => {
        console.log('Novo paciente:', payload)
        onNewPatient?.()
      })
      .subscribe()

    // Canal para novos agendamentos
    const agendamentosChannel = supabase
      .channel('agendamentos-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'infra_consultas',
        filter: `clinica_id=eq.${clinicaId}`
      }, (payload) => {
        console.log('Novo agendamento:', payload)
        onNewAppointment?.()
      })
      .subscribe()

    // Canal para novas interações
    const interacoesChannel = supabase
      .channel('interacoes-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'infra_interacoes',
        filter: `clinica_id=eq.${clinicaId}`
      }, (payload) => {
        console.log('Nova interação:', payload)
        onNewInteraction?.()
      })
      .subscribe()

    // Canal para mudanças de status (kanban)
    const statusChannel = supabase
      .channel('status-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'infra_paciente_status'
      }, (payload) => {
        console.log('Mudança de status:', payload)
        onStatusChange?.()
      })
      .subscribe()

    // Canal para conversas (tempo de resposta)
    const conversasChannel = supabase
      .channel('conversas-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'infra_conversas',
        filter: `clinica_id=eq.${clinicaId}`
      }, (payload) => {
        console.log('Mudança em conversa:', payload)
        onNewInteraction?.()
      })
      .subscribe()

    // Cleanup function
    return () => {
      supabase.removeChannel(pacientesChannel)
      supabase.removeChannel(agendamentosChannel)
      supabase.removeChannel(interacoesChannel)
      supabase.removeChannel(statusChannel)
      supabase.removeChannel(conversasChannel)
    }
  }, [clinicaId, onNewPatient, onNewAppointment, onNewInteraction, onStatusChange])

  // Função para testar a conexão real-time
  const testConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('infra_pacientes')
        .select('id')
        .limit(1)

      if (error) {
        console.error('Erro na conexão:', error)
        return false
      }

      console.log('Conexão com Supabase OK')
      return true
    } catch (error) {
      console.error('Erro ao testar conexão:', error)
      return false
    }
  }

  return { testConnection }
} 