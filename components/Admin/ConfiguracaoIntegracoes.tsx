'use client';

import { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  CheckCircle, 
  AlertCircle, 
  QrCode, 
  Smartphone,
  Save,
  Loader2,
  RefreshCw
} from 'lucide-react';

interface ConfiguracaoIntegracoesProps {
  clinicaId: string;
}

interface StatusWhatsApp {
  conectado: boolean;
  numero: string;
  qrCode?: string;
  ultimaConexao?: string;
}

export function ConfiguracaoIntegracoes({ clinicaId }: ConfiguracaoIntegracoesProps) {
  const [statusWhatsApp, setStatusWhatsApp] = useState<StatusWhatsApp>({
    conectado: false,
    numero: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);

  useEffect(() => {
    fetchStatusIntegracoes();
  }, [clinicaId]);

  const fetchStatusIntegracoes = async () => {
    try {
      setIsLoading(true);
      
      // Simular busca do status das integrações
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dados mockados
      setStatusWhatsApp({
        conectado: true,
        numero: "(11) 3456-7890",
        ultimaConexao: "há 2 horas"
      });
    } catch (error) {
      console.error('Erro ao buscar status das integrações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const conectarWhatsApp = async () => {
    try {
      setIsConnecting(true);
      setShowQrCode(true);
      
      // Simular geração do QR Code
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular QR Code (normalmente viria da API)
      setStatusWhatsApp(prev => ({
        ...prev,
        qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
      }));
      
      // Simular conexão bem-sucedida após 5 segundos
      setTimeout(() => {
        setStatusWhatsApp(prev => ({
          ...prev,
          conectado: true,
          numero: "(11) 3456-7890",
          ultimaConexao: "agora",
          qrCode: undefined
        }));
        setShowQrCode(false);
        setIsConnecting(false);
      }, 5000);
      
    } catch (error) {
      console.error('Erro ao conectar WhatsApp:', error);
      setIsConnecting(false);
      setShowQrCode(false);
    }
  };

  const desconectarWhatsApp = async () => {
    try {
      setIsLoading(true);
      
      // Simular desconexão
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStatusWhatsApp({
        conectado: false,
        numero: '',
      });
    } catch (error) {
      console.error('Erro ao desconectar WhatsApp:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* WhatsApp Integration */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <MessageCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">WhatsApp Business</h3>
              <p className="text-gray-600 text-sm">
                Conecte sua conta do WhatsApp para atendimento automatizado
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {statusWhatsApp.conectado ? (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Conectado</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Desconectado</span>
              </div>
            )}
          </div>
        </div>

        {statusWhatsApp.conectado ? (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Smartphone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Número conectado:</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{statusWhatsApp.numero}</p>
                  {statusWhatsApp.ultimaConexao && (
                    <p className="text-xs text-gray-500 mt-1">
                      Última conexão: {statusWhatsApp.ultimaConexao}
                    </p>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={fetchStatusIntegracoes}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={desconectarWhatsApp}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                  >
                    Desconectar
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Status do Atendimento</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">Mensagens hoje:</span>
                  <p className="text-blue-900">127</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Tempo médio resposta:</span>
                  <p className="text-blue-900">2 min 30s</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Taxa de conversão:</span>
                  <p className="text-blue-900">68%</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {showQrCode ? (
              <div className="bg-white rounded-lg p-6 border border-green-200 text-center">
                <div className="mb-4">
                  <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900 mb-2">Escaneie o QR Code</h4>
                  <p className="text-gray-600 text-sm">
                    Abra o WhatsApp no seu celular e escaneie o código abaixo
                  </p>
                </div>
                
                <div className="bg-gray-100 rounded-lg p-8 mb-4">
                  {isConnecting ? (
                    <div className="flex flex-col items-center space-y-4">
                      <Loader2 className="w-16 h-16 text-green-600 animate-spin" />
                      <p className="text-gray-600">Gerando QR Code...</p>
                    </div>
                  ) : (
                    <div className="w-48 h-48 bg-white border-2 border-gray-300 rounded-lg mx-auto flex items-center justify-center">
                      <QrCode className="w-32 h-32 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => {
                    setShowQrCode(false);
                    setIsConnecting(false);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-6 border border-green-200 text-center">
                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="font-medium text-gray-900 mb-2">WhatsApp não conectado</h4>
                <p className="text-gray-600 text-sm mb-6">
                  Conecte sua conta do WhatsApp Business para começar a receber e responder mensagens automaticamente.
                </p>
                
                <button
                  onClick={conectarWhatsApp}
                  disabled={isConnecting}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
                >
                  {isConnecting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MessageCircle className="w-4 h-4" />
                  )}
                  <span>Conectar WhatsApp</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Configurações Adicionais */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações do WhatsApp</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Respostas automáticas</label>
              <p className="text-xs text-gray-500">Enviar mensagens automáticas fora do horário</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Notificações de agendamento</label>
              <p className="text-xs text-gray-500">Enviar lembretes de consulta automaticamente</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Confirmação de agendamento</label>
              <p className="text-xs text-gray-500">Solicitar confirmação 24h antes da consulta</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Save className="w-4 h-4" />
            <span>Salvar Configurações</span>
          </button>
        </div>
      </div>
    </div>
  );
} 