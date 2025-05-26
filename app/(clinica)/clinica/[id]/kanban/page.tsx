'use client';

import { useParams } from 'next/navigation';
import { useKanban } from '@/hooks/useKanban';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  UserCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

export default function KanbanClinica() {
  const params = useParams();
  const clinicaId = parseInt(params.id as string);
  
  const {
    pacientesPorStatus,
    contadores,
    statusDisponiveis,
    moverPaciente,
    isMovendoPaciente,
    getNomeStatus,
    getCorStatus,
    getCorPrioridade,
    isLoading,
    hasError,
    refetch
  } = useKanban(clinicaId);

  const onDragEnd = (result: any) => {
    if (!result.destination || isMovendoPaciente) return;

    const { source, destination, draggableId } = result;

    // Se moveu para a mesma coluna, não faz nada
    if (source.droppableId === destination.droppableId) return;

    // Extrair o ID do paciente do draggableId
    const pacienteId = parseInt(draggableId);
    const novoStatus = destination.droppableId;

    // Mover paciente no backend
    moverPaciente(pacienteId, novoStatus);
  };

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar kanban</h2>
        <p className="text-gray-600 mb-4">Ocorreu um erro ao buscar os dados.</p>
        <button 
          onClick={refetch}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 px-6 pt-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kanban</h1>
          <p className="text-gray-600 text-sm">Gerencie o funil de pacientes da clínica</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors">
          <PlusIcon className="h-4 w-4" />
          Novo Paciente
        </button>
      </div>

      {/* Kanban Board */}
      <div className="px-6 pb-6 h-full">
        {isLoading ? (
          <div className="grid grid-cols-4 gap-6 h-full">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, cardIndex) => (
                    <div key={cardIndex} className="bg-white p-4 rounded-lg">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-4 gap-6 h-full">
              {statusDisponiveis.map((status) => {
                const pacientes = pacientesPorStatus[status] || [];
                const count = contadores[status] || 0;
                
                return (
                  <div key={status} className={`rounded-lg border-2 ${getCorStatus(status)} flex flex-col h-full`}>
                    {/* Header da Coluna */}
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">
                          {getNomeStatus(status)}
                        </h2>
                        <span className="px-3 py-1 text-sm font-medium bg-white text-gray-700 rounded-full border">
                          {count}
                        </span>
                      </div>
                    </div>

                    {/* Lista de Pacientes */}
                    <Droppable droppableId={status}>
                      {(provided, snapshot) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className={`flex-1 p-4 space-y-3 overflow-y-auto transition-colors ${
                            snapshot.isDraggingOver ? 'bg-white/50' : ''
                          }`}
                        >
                          {pacientes.map((paciente, index) => (
                            <Draggable
                              key={paciente.id}
                              draggableId={paciente.id.toString()}
                              index={index}
                              isDragDisabled={isMovendoPaciente}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`bg-white rounded-lg shadow-sm border-l-4 p-4 cursor-grab transition-all hover:shadow-md ${
                                    getCorPrioridade(paciente.prioridade)
                                  } ${
                                    snapshot.isDragging ? 'rotate-1 shadow-lg scale-105' : ''
                                  } ${
                                    isMovendoPaciente ? 'opacity-50' : ''
                                  }`}
                                >
                                  {/* Header do Card */}
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                                      <UserCircleIcon className="h-8 w-8 text-gray-400 flex-shrink-0" />
                                      <div className="min-w-0 flex-1">
                                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                                          {paciente.nome_preferido || paciente.nome}
                                        </h3>
                                        <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                                          <PhoneIcon className="h-3 w-3" />
                                          <span className="truncate">{paciente.telefone}</span>
                                        </div>
                                      </div>
                                    </div>
                                    <span
                                      className={`px-2 py-1 text-xs rounded-full font-medium flex-shrink-0 ${
                                        paciente.prioridade === 'alta'
                                          ? 'bg-red-100 text-red-700'
                                          : paciente.prioridade === 'media'
                                          ? 'bg-yellow-100 text-yellow-700'
                                          : 'bg-green-100 text-green-700'
                                      }`}
                                    >
                                      {paciente.prioridade === 'alta' ? 'Alta' : 
                                       paciente.prioridade === 'media' ? 'Média' : 'Baixa'}
                                    </span>
                                  </div>

                                  {/* Email */}
                                  {paciente.email && (
                                    <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                                      <EnvelopeIcon className="h-3 w-3" />
                                      <span className="truncate">{paciente.email}</span>
                                    </div>
                                  )}

                                  {/* Tempo no Status */}
                                  <div className="flex items-center space-x-2 text-xs text-gray-500 mb-3">
                                    <ClockIcon className="h-3 w-3" />
                                    <span>{paciente.tempo_no_status}</span>
                                  </div>
                                  
                                  {/* Tags */}
                                  <div className="space-y-2">
                                    {paciente.ultimo_topico && (
                                      <div className="flex flex-wrap gap-1">
                                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full font-medium">
                                          {paciente.ultimo_topico}
                                        </span>
                                      </div>
                                    )}

                                    {paciente.proxima_consulta && (
                                      <div className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                                        📅 {new Date(paciente.proxima_consulta).toLocaleDateString('pt-BR')}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                          
                          {pacientes.length === 0 && (
                            <div className="text-center py-12 text-gray-400">
                              <UserCircleIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                              <p className="text-sm">Nenhum paciente</p>
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        )}
      </div>
    </div>
  );
} 