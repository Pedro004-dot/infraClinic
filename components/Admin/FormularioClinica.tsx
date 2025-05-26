'use client';

import { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  DollarSign, 
  User, 
  Save,
  Loader2
} from 'lucide-react';
import { GerenciadorProfissionais, Profissional } from './GerenciadorProfissionais';
import ProfissionaisLista from './ProfissionaisLista';
import { useRouter } from 'next/navigation';

interface DadosClinica {
  // Dados básicos
  nome: string;
  tipo: string;
  cnpj: string;
  
  // Endereço
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  
  // Contato
  telefone: string;
  email: string;
  waze: string;
  google_maps: string;
  
  // Atendente
  nome_atendente: string;
  genero_atendente: string;
  
  // Valores
  consulta_padrao: string;
  aceita_convenio: string;
  formas_pagamento: string[];
  parcela_minima: string;
  max_parcelas: number;
  
  // Horário
  segunda_sexta: string;
  sabado: string;
  domingo: string;

  // Profissionais
  profissionais: Profissional[];
}

interface FormularioClinicaProps {
  dadosIniciais?: Partial<DadosClinica>;
  isEdit?: boolean;
  clinicaId?: number;
}

export function FormularioClinica({ 
  dadosIniciais = {},
  isEdit = false,
  clinicaId
}: FormularioClinicaProps) {
  const router = useRouter();
  const [abaAtiva, setAbaAtiva] = useState('dados-basicos');
  const [isLoading, setIsLoading] = useState(false);
  const [dados, setDados] = useState<DadosClinica>({
    nome: '',
    tipo: 'medica',
    cnpj: '',
    endereco: '',
    bairro: '',
    cidade: '',
    estado: 'SP',
    cep: '',
    telefone: '',
    email: '',
    waze: '',
    google_maps: '',
    nome_atendente: '',
    genero_atendente: 'feminino',
    consulta_padrao: '',
    aceita_convenio: 'não',
    formas_pagamento: ['Pix'],
    parcela_minima: '',
    max_parcelas: 1,
    segunda_sexta: '',
    sabado: '',
    domingo: 'Fechado',
    profissionais: [],
    ...dadosIniciais
  });

  const handleInputChange = (field: keyof DadosClinica, value: any) => {
    setDados(prev => ({ ...prev, [field]: value }));
  };

  const handleFormasPagamentoChange = (forma: string, checked: boolean) => {
    setDados(prev => ({
      ...prev,
      formas_pagamento: checked 
        ? [...prev.formas_pagamento, forma]
        : prev.formas_pagamento.filter(f => f !== forma)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Criar/atualizar a clínica
      const url = isEdit && clinicaId 
        ? `/api/admin/clinicas/${clinicaId}` 
        : '/api/admin/clinicas';
      
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
      });

      if (!response.ok) {
        throw new Error(`Erro ao ${isEdit ? 'atualizar' : 'salvar'} clínica`);
      }

      const clinica = await response.json();

      // 2. Se há profissionais e não é edição, criar eles também
      if (dados.profissionais.length > 0 && !isEdit) {
        const responseProfissionais = await fetch('/api/admin/profissionais', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clinica_id: clinica.id,
            profissionais: dados.profissionais
          }),
        });

        if (!responseProfissionais.ok) {
          console.warn('Erro ao criar profissionais, mas clínica foi criada');
        }
      }

      // 3. Redirecionar para o painel admin
      router.push('/admin');
      
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert(`Erro ao ${isEdit ? 'atualizar' : 'salvar'} clínica. Tente novamente.`);
    } finally {
      setIsLoading(false);
    }
  };

  const tiposClinica = [
    { value: 'medica', label: 'Médica' },
    { value: 'odontologica', label: 'Odontológica' },
    { value: 'veterinaria', label: 'Veterinária' },
    { value: 'estetica', label: 'Estética' }
  ];

  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const formasPagamentoOpcoes = [
    'Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Transferência', 
    'Dinheiro', 'Boleto'
  ];

  const abas = [
    { id: 'dados-basicos', label: 'Dados Básicos', icon: Building2 },
    { id: 'endereco', label: 'Endereço', icon: MapPin },
    { id: 'contato', label: 'Contato', icon: Phone },
    { id: 'atendimento', label: 'Atendimento', icon: Clock },
    { id: 'valores', label: 'Valores', icon: DollarSign },
    { id: 'profissionais', label: 'Profissionais', icon: User }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? 'Editar Clínica' : 'Nova Clínica'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isEdit ? 'Atualize as informações da clínica' : 'Preencha os dados para criar uma nova clínica'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Navegação por Abas */}
        <div className="border-b border-gray-200 bg-gray-50">
          <nav className="flex space-x-8 px-6">
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

        <div className="p-6">
          {/* Dados Básicos */}
          {abaAtiva === 'dados-basicos' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Clínica *
                  </label>
                  <input
                    type="text"
                    value={dados.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: DermaCenter Clínica Dermatológica"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Clínica *
                  </label>
                  <select
                    value={dados.tipo}
                    onChange={(e) => handleInputChange('tipo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {tiposClinica.map(tipo => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CNPJ *
                  </label>
                  <input
                    type="text"
                    value={dados.cnpj}
                    onChange={(e) => handleInputChange('cnpj', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="00.000.000/0000-00"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Endereço */}
          {abaAtiva === 'endereco' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Endereço *
                  </label>
                  <input
                    type="text"
                    value={dados.endereco}
                    onChange={(e) => handleInputChange('endereco', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Rua, Avenida, número"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CEP *
                  </label>
                  <input
                    type="text"
                    value={dados.cep}
                    onChange={(e) => handleInputChange('cep', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="00000-000"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bairro *
                  </label>
                  <input
                    type="text"
                    value={dados.bairro}
                    onChange={(e) => handleInputChange('bairro', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nome do bairro"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    value={dados.cidade}
                    onChange={(e) => handleInputChange('cidade', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nome da cidade"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado *
                  </label>
                  <select
                    value={dados.estado}
                    onChange={(e) => handleInputChange('estado', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {estados.map(estado => (
                      <option key={estado} value={estado}>
                        {estado}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Contato */}
          {abaAtiva === 'contato' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    value={dados.telefone}
                    onChange={(e) => handleInputChange('telefone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    value={dados.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="contato@clinica.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link do Waze
                  </label>
                  <input
                    type="url"
                    value={dados.waze}
                    onChange={(e) => handleInputChange('waze', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://waze.com/ul/..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link do Google Maps
                  </label>
                  <input
                    type="url"
                    value={dados.google_maps}
                    onChange={(e) => handleInputChange('google_maps', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Atendimento */}
          {abaAtiva === 'atendimento' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do(a) Atendente
                  </label>
                  <input
                    type="text"
                    value={dados.nome_atendente}
                    onChange={(e) => handleInputChange('nome_atendente', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nome da recepcionista"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gênero do Atendente
                  </label>
                  <select
                    value={dados.genero_atendente}
                    onChange={(e) => handleInputChange('genero_atendente', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="feminino">Feminino</option>
                    <option value="masculino">Masculino</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Segunda a Sexta
                  </label>
                  <input
                    type="text"
                    value={dados.segunda_sexta}
                    onChange={(e) => handleInputChange('segunda_sexta', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="08:00 às 18:00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sábado
                  </label>
                  <input
                    type="text"
                    value={dados.sabado}
                    onChange={(e) => handleInputChange('sabado', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="08:00 às 12:00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Domingo
                  </label>
                  <select
                    value={dados.domingo}
                    onChange={(e) => handleInputChange('domingo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Fechado">Fechado</option>
                    <option value="08:00 às 12:00">08:00 às 12:00</option>
                    <option value="14:00 às 18:00">14:00 às 18:00</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Valores */}
          {abaAtiva === 'valores' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor Consulta Padrão
                  </label>
                  <input
                    type="text"
                    value={dados.consulta_padrao}
                    onChange={(e) => handleInputChange('consulta_padrao', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="R$ 450,00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aceita Convênio?
                  </label>
                  <select
                    value={dados.aceita_convenio}
                    onChange={(e) => handleInputChange('aceita_convenio', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="não">Não</option>
                    <option value="sim">Sim</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Formas de Pagamento
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {formasPagamentoOpcoes.map(forma => (
                    <label key={forma} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={dados.formas_pagamento.includes(forma)}
                        onChange={(e) => handleFormasPagamentoChange(forma, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{forma}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor Mínimo da Parcela
                  </label>
                  <input
                    type="text"
                    value={dados.parcela_minima}
                    onChange={(e) => handleInputChange('parcela_minima', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="R$ 100,00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Máximo de Parcelas
                  </label>
                  <input
                    type="number"
                    value={dados.max_parcelas}
                    onChange={(e) => handleInputChange('max_parcelas', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    max="12"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Profissionais */}
          {abaAtiva === 'profissionais' && (
            <div>
              {isEdit && clinicaId ? (
                <ProfissionaisLista clinicaId={clinicaId.toString()} />
              ) : (
                <GerenciadorProfissionais
                  profissionais={dados.profissionais}
                  onChange={(profissionais) => handleInputChange('profissionais', profissionais)}
                />
              )}
            </div>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-between items-center p-6 bg-gray-50 border-t">
          <div className="text-sm text-gray-600">
            * Campos obrigatórios
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => router.push('/admin')}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEdit ? 'Atualizar' : 'Criar'} Clínica</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 