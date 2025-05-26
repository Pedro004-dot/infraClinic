'use client';

import { useState } from 'react';
import { Plus, Trash2, User, GraduationCap, Stethoscope, Calendar, DollarSign, Clock } from 'lucide-react';

export interface Profissional {
  id: string;
  nome: string;
  titulo: string;
  crm: string;
  especialidades: string[];
  formacao: string[];
  sintomas_atendidos: string[];
  procedimentos: string[];
  calendar_id: string;
  dias_atendimento: string;
  horario_atendimento: string;
  duracao_consulta: number;
  duracao_retorno: number;
  duracao_procedimento: number;
  valor_consulta: string;
  observacoes: string;
}

interface GerenciadorProfissionaisProps {
  profissionais: Profissional[];
  onChange: (profissionais: Profissional[]) => void;
}

export function GerenciadorProfissionais({ profissionais, onChange }: GerenciadorProfissionaisProps) {
  const [expandido, setExpandido] = useState<string | null>(null);

  const adicionarProfissional = () => {
    const novoProfissional: Profissional = {
      id: Date.now().toString(),
      nome: '',
      titulo: 'Dr.',
      crm: '',
      especialidades: [''],
      formacao: [''],
      sintomas_atendidos: [''],
      procedimentos: [''],
      calendar_id: '',
      dias_atendimento: '',
      horario_atendimento: '',
      duracao_consulta: 45,
      duracao_retorno: 30,
      duracao_procedimento: 60,
      valor_consulta: '',
      observacoes: ''
    };
    
    onChange([...profissionais, novoProfissional]);
    setExpandido(novoProfissional.id);
  };

  const removerProfissional = (id: string) => {
    onChange(profissionais.filter(p => p.id !== id));
    if (expandido === id) {
      setExpandido(null);
    }
  };

  const atualizarProfissional = (id: string, campo: keyof Profissional, valor: any) => {
    onChange(profissionais.map(p => 
      p.id === id ? { ...p, [campo]: valor } : p
    ));
  };

  const adicionarItem = (id: string, campo: 'especialidades' | 'formacao' | 'sintomas_atendidos' | 'procedimentos') => {
    const profissional = profissionais.find(p => p.id === id);
    if (profissional) {
      const novoArray = [...profissional[campo], ''];
      atualizarProfissional(id, campo, novoArray);
    }
  };

  const removerItem = (id: string, campo: 'especialidades' | 'formacao' | 'sintomas_atendidos' | 'procedimentos', index: number) => {
    const profissional = profissionais.find(p => p.id === id);
    if (profissional) {
      const novoArray = profissional[campo].filter((_, i) => i !== index);
      atualizarProfissional(id, campo, novoArray);
    }
  };

  const atualizarItem = (id: string, campo: 'especialidades' | 'formacao' | 'sintomas_atendidos' | 'procedimentos', index: number, valor: string) => {
    const profissional = profissionais.find(p => p.id === id);
    if (profissional) {
      const novoArray = [...profissional[campo]];
      novoArray[index] = valor;
      atualizarProfissional(id, campo, novoArray);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <User className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Profissionais</h3>
        </div>
        <button
          type="button"
          onClick={adicionarProfissional}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Profissional</span>
        </button>
      </div>

      {profissionais.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Nenhum profissional cadastrado</p>
          <p className="text-gray-600 text-sm">
            Não há profissionais cadastrados. Clique em &quot;Novo Profissional&quot; para começar.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {profissionais.map((profissional) => (
            <div key={profissional.id} className="bg-white border rounded-lg">
              {/* Header do Profissional */}
              <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Stethoscope className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {profissional.nome || 'Novo Profissional'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {profissional.crm || 'CRM não informado'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setExpandido(expandido === profissional.id ? null : profissional.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    {expandido === profissional.id ? 'Recolher' : 'Expandir'}
                  </button>
                  <button
                    type="button"
                    onClick={() => removerProfissional(profissional.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Formulário Expandido */}
              {expandido === profissional.id && (
                <div className="p-6 space-y-6">
                  {/* Dados Básicos */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Título
                      </label>
                      <select
                        value={profissional.titulo}
                        onChange={(e) => atualizarProfissional(profissional.id, 'titulo', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Dr.">Dr.</option>
                        <option value="Dra.">Dra.</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        value={profissional.nome}
                        onChange={(e) => atualizarProfissional(profissional.id, 'nome', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nome do profissional"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CRM/CRO *
                      </label>
                      <input
                        type="text"
                        value={profissional.crm}
                        onChange={(e) => atualizarProfissional(profissional.id, 'crm', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="CRM-SP 123456"
                        required
                      />
                    </div>
                  </div>

                  {/* Especialidades */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Especialidades
                      </label>
                      <button
                        type="button"
                        onClick={() => adicionarItem(profissional.id, 'especialidades')}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        + Adicionar
                      </button>
                    </div>
                    <div className="space-y-2">
                      {profissional.especialidades.map((especialidade, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={especialidade}
                            onChange={(e) => atualizarItem(profissional.id, 'especialidades', index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Ex: Dermatologia Clínica"
                          />
                          {profissional.especialidades.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removerItem(profissional.id, 'especialidades', index)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Formação */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Formação
                      </label>
                      <button
                        type="button"
                        onClick={() => adicionarItem(profissional.id, 'formacao')}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        + Adicionar
                      </button>
                    </div>
                    <div className="space-y-2">
                      {profissional.formacao.map((formacao, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={formacao}
                            onChange={(e) => atualizarItem(profissional.id, 'formacao', index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Ex: Medicina - USP"
                          />
                          {profissional.formacao.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removerItem(profissional.id, 'formacao', index)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sintomas Atendidos */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Sintomas Atendidos
                      </label>
                      <button
                        type="button"
                        onClick={() => adicionarItem(profissional.id, 'sintomas_atendidos')}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        + Adicionar
                      </button>
                    </div>
                    <div className="space-y-2">
                      {profissional.sintomas_atendidos.map((sintoma, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={sintoma}
                            onChange={(e) => atualizarItem(profissional.id, 'sintomas_atendidos', index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Ex: Câncer de pele, Acne, Melasma"
                          />
                          {profissional.sintomas_atendidos.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removerItem(profissional.id, 'sintomas_atendidos', index)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Procedimentos */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Procedimentos
                      </label>
                      <button
                        type="button"
                        onClick={() => adicionarItem(profissional.id, 'procedimentos')}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        + Adicionar
                      </button>
                    </div>
                    <div className="space-y-2">
                      {profissional.procedimentos.map((procedimento, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={procedimento}
                            onChange={(e) => atualizarItem(profissional.id, 'procedimentos', index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Ex: Botox, Dermatoscopia, Cirurgia"
                          />
                          {profissional.procedimentos.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removerItem(profissional.id, 'procedimentos', index)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Agenda e Horários */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dias de Atendimento
                      </label>
                      <input
                        type="text"
                        value={profissional.dias_atendimento}
                        onChange={(e) => atualizarProfissional(profissional.id, 'dias_atendimento', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex: Segundas, Quartas e Sextas"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Horário de Atendimento
                      </label>
                      <input
                        type="text"
                        value={profissional.horario_atendimento}
                        onChange={(e) => atualizarProfissional(profissional.id, 'horario_atendimento', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex: 08:00 às 17:00"
                      />
                    </div>
                  </div>

                  {/* Durações */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duração Consulta (min)
                      </label>
                      <input
                        type="number"
                        value={profissional.duracao_consulta}
                        onChange={(e) => atualizarProfissional(profissional.id, 'duracao_consulta', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="15"
                        max="180"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duração Retorno (min)
                      </label>
                      <input
                        type="number"
                        value={profissional.duracao_retorno}
                        onChange={(e) => atualizarProfissional(profissional.id, 'duracao_retorno', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="15"
                        max="120"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duração Procedimento (min)
                      </label>
                      <input
                        type="number"
                        value={profissional.duracao_procedimento}
                        onChange={(e) => atualizarProfissional(profissional.id, 'duracao_procedimento', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="30"
                        max="300"
                      />
                    </div>
                  </div>

                  {/* Valor e Observações */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Valor da Consulta
                      </label>
                      <input
                        type="text"
                        value={profissional.valor_consulta}
                        onChange={(e) => atualizarProfissional(profissional.id, 'valor_consulta', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex: R$ 450,00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Calendar ID (Google)
                      </label>
                      <input
                        type="text"
                        value={profissional.calendar_id}
                        onChange={(e) => atualizarProfissional(profissional.id, 'calendar_id', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="email@group.calendar.google.com"
                      />
                    </div>
                  </div>

                  {/* Observações */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Observações
                    </label>
                    <textarea
                      value={profissional.observacoes}
                      onChange={(e) => atualizarProfissional(profissional.id, 'observacoes', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Informações adicionais sobre o profissional..."
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 