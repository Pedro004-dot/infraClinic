'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Calendar, 
  Clock, 
  DollarSign, 
  Stethoscope, 
  Activity, 
  Scissors,
  Edit,
  Trash2,
  Plus,
  Users,
  Settings
} from 'lucide-react';
import GerenciadorEspecialidades from './GerenciadorEspecialidades';

interface Especialidade {
  id: number;
  nome: string;
  descricao?: string;
}

interface Sintoma {
  id: number;
  nome: string;
  categoria: string;
  experiencia_nivel: string;
}

interface Procedimento {
  id: number;
  nome: string;
  duracao_media: number;
  valor_base: number;
  valor_especifico?: number;
  duracao_especifica?: number;
}

interface Profissional {
  id: number;
  nome: string;
  titulo: string;
  documento_profissional: string;
  calendar_id: string;
  dias_atendimento: string;
  horario_atendimento: string;
  duracao_consulta: number;
  duracao_retorno: number;
  duracao_procedimento: number;
  valor_consulta_especifica: number;
  ativo: boolean;
  especialidades: Especialidade[];
  sintomas: Sintoma[];
  procedimentos: Procedimento[];
}

interface ProfissionaisListaProps {
  clinicaId: string;
}

export default function ProfissionaisLista({ clinicaId }: ProfissionaisListaProps) {
  const [abaAtiva, setAbaAtiva] = useState('profissionais');
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (abaAtiva === 'profissionais') {
      buscarProfissionais();
    }
  }, [clinicaId, abaAtiva]);

  const buscarProfissionais = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/clinicas/${clinicaId}/profissionais`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar profissionais');
      }

      const data = await response.json();
      setProfissionais(data);
    } catch (error) {
      console.error('Erro:', error);
      setError('Erro ao carregar profissionais');
    } finally {
      setLoading(false);
    }
  };

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const getExperienciaColor = (nivel: string) => {
    switch (nivel) {
      case 'especialista': return 'bg-green-100 text-green-800';
      case 'intermediario': return 'bg-yellow-100 text-yellow-800';
      case 'iniciante': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const abas = [
    { id: 'profissionais', label: 'Profissionais', icon: Users },
    { id: 'especialidades', label: 'Especialidades', icon: Stethoscope },
    { id: 'sintomas', label: 'Sintomas', icon: Activity },
    { id: 'procedimentos', label: 'Procedimentos', icon: Scissors }
  ];

  return (
    <div className="space-y-6">
      {/* Navegação por Abas */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {abas.map((aba) => {
            const Icon = aba.icon;
            return (
              <button
                key={aba.id}
                type="button"
                onClick={() => setAbaAtiva(aba.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  abaAtiva === aba.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{aba.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Conteúdo das Abas */}
      {abaAtiva === 'profissionais' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Profissionais da Clínica
            </h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Profissional
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center p-8">
              <p className="text-red-600">{error}</p>
              <Button onClick={buscarProfissionais} className="mt-4">
                Tentar novamente
              </Button>
            </div>
          ) : profissionais.length === 0 ? (
            <div className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum profissional cadastrado
              </h3>
              <p className="text-gray-600 mb-6">
                Adicione profissionais para começar a gerenciar a clínica.
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Profissional
              </Button>
            </div>
          ) : (
            <div className="grid gap-6">
              {profissionais.map((profissional) => (
                <Card key={profissional.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5 text-blue-600" />
                          {profissional.nome}
                        </CardTitle>
                        <p className="text-gray-600 mt-1">{profissional.titulo}</p>
                        {profissional.documento_profissional && (
                          <p className="text-sm text-gray-500">
                            {profissional.documento_profissional}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Especialidades */}
                    {profissional.especialidades.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                          <Stethoscope className="h-4 w-4" />
                          Especialidades
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {profissional.especialidades.map((esp) => (
                            <Badge key={esp.id} variant="secondary">
                              {esp.nome}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sintomas */}
                    {profissional.sintomas.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          Sintomas Atendidos
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {profissional.sintomas.map((sintoma) => (
                            <Badge key={sintoma.id} variant="outline">
                              {sintoma.nome}
                              {sintoma.experiencia_nivel && (
                                <span className="ml-1 text-xs">
                                  ({sintoma.experiencia_nivel})
                                </span>
                              )}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Procedimentos */}
                    {profissional.procedimentos.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                          <Scissors className="h-4 w-4" />
                          Procedimentos
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {profissional.procedimentos.map((proc) => (
                            <Badge key={proc.id} variant="default">
                              {proc.nome}
                              {proc.valor_especifico && (
                                <span className="ml-1 text-xs">
                                  R$ {proc.valor_especifico.toFixed(2)}
                                </span>
                              )}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Informações de Agenda e Valores */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      {profissional.dias_atendimento && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{profissional.dias_atendimento}</span>
                        </div>
                      )}
                      
                      {profissional.horario_atendimento && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>{profissional.horario_atendimento}</span>
                        </div>
                      )}
                      
                      {profissional.duracao_consulta && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>Consulta: {profissional.duracao_consulta}min</span>
                        </div>
                      )}
                      
                      {profissional.valor_consulta_especifica && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span>R$ {profissional.valor_consulta_especifica.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {abaAtiva === 'especialidades' && (
        <GerenciadorEspecialidades clinicaId={clinicaId} />
      )}

      {abaAtiva === 'sintomas' && (
        <div className="text-center py-12">
          <Activity className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Gerenciador de Sintomas
          </h3>
          <p className="text-gray-600">
            Em desenvolvimento...
          </p>
        </div>
      )}

      {abaAtiva === 'procedimentos' && (
        <div className="text-center py-12">
          <Scissors className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Gerenciador de Procedimentos
          </h3>
          <p className="text-gray-600">
            Em desenvolvimento...
          </p>
        </div>
      )}
    </div>
  );
} 