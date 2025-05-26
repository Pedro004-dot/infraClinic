'use client';

import { useState } from 'react';
import { Bot, Save, Loader2 } from 'lucide-react';

interface ConfiguracaoIAProps {
  clinicaId: string;
}

export function ConfiguracaoIA({ clinicaId }: ConfiguracaoIAProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState({
    personalidade: 'profissional',
    tom: 'amigavel',
    especialidade_foco: 'dermatologia',
    mensagem_boas_vindas: 'Olá! Seja bem-vindo(a) à DermaCenter! 🌟\n\nSou a Sofia, assistente virtual da clínica. Estou aqui para ajudar com:\n- Informações sobre nossos especialistas\n- Agendamento de consultas\n- Esclarecimento de dúvidas\n- Valores e formas de pagamento\n\nComo posso ajudar você hoje?',
    horario_funcionamento_resposta: true,
    agendamento_automatico: true,
    escalacao_humano: true
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Configurações da IA salvas com sucesso!');
    } catch (error) {
      alert('Erro ao salvar configurações.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Bot className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Configuração do Agente IA</h3>
            <p className="text-gray-600 text-sm">
              Personalize o comportamento do seu atendente virtual
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Personalidade
              </label>
              <select
                value={config.personalidade}
                onChange={(e) => setConfig(prev => ({ ...prev, personalidade: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="profissional">Profissional</option>
                <option value="amigavel">Amigável</option>
                <option value="formal">Formal</option>
                <option value="casual">Casual</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tom de Voz
              </label>
              <select
                value={config.tom}
                onChange={(e) => setConfig(prev => ({ ...prev, tom: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="amigavel">Amigável</option>
                <option value="empatico">Empático</option>
                <option value="direto">Direto</option>
                <option value="acolhedor">Acolhedor</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensagem de Boas-vindas
            </label>
            <textarea
              value={config.mensagem_boas_vindas}
              onChange={(e) => setConfig(prev => ({ ...prev, mensagem_boas_vindas: e.target.value }))}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Digite a mensagem de boas-vindas..."
            />
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Funcionalidades</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Respostas sobre horário</label>
                  <p className="text-xs text-gray-500">Responder automaticamente sobre horários de funcionamento</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.horario_funcionamento_resposta}
                  onChange={(e) => setConfig(prev => ({ ...prev, horario_funcionamento_resposta: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Agendamento automático</label>
                  <p className="text-xs text-gray-500">Permitir agendamento direto pelo chat</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.agendamento_automatico}
                  onChange={(e) => setConfig(prev => ({ ...prev, agendamento_automatico: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Escalação para humano</label>
                  <p className="text-xs text-gray-500">Transferir para atendente humano quando necessário</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.escalacao_humano}
                  onChange={(e) => setConfig(prev => ({ ...prev, escalacao_humano: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-blue-200">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Salvar Configurações</span>
          </button>
        </div>
      </div>
    </div>
  );
} 