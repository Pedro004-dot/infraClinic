'use client';

import { Building2, MapPin, Phone, Users, Calendar, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clinica } from '@/hooks/useClinicasAdmin';

interface ClinicaCardProps {
  clinica: Clinica;
  onEdit?: (clinica: Clinica) => void;
  onDelete?: (id: number) => void;
}

export function ClinicaCard({ clinica, onEdit, onDelete }: ClinicaCardProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativa':
        return 'bg-green-100 text-green-800';
      case 'inativa':
        return 'bg-red-100 text-red-800';
      case 'configurando':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoLabel = (tipo: string) => {
    const tipos = {
      'medica': 'Médica',
      'odontologica': 'Odontológica',
      'veterinaria': 'Veterinária',
      'estetica': 'Estética'
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  };

  const formatarData = (dataString?: string) => {
    if (!dataString) return 'Não informado';
    
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  const formatarEndereco = () => {
    const partes = [];
    if (clinica.cidade) partes.push(clinica.cidade);
    if (clinica.estado) partes.push(clinica.estado);
    return partes.length > 0 ? partes.join(', ') : 'Endereço não informado';
  };

  const formatarTelefone = () => {
    return clinica.telefone || 'Não informado';
  };

  // Determinar status baseado nos dados disponíveis
  const determinarStatus = () => {
    if (!clinica.telefone || !clinica.email) {
      return 'configurando';
    }
    return 'ativa';
  };

  const status = determinarStatus();

  const handleCardClick = () => {
    router.push(`/admin/clinicas/${clinica.id}/editar`);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/admin/clinicas/${clinica.id}/editar`);
    setShowMenu(false);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja deletar esta clínica?')) {
      onDelete?.(clinica.id);
    }
    setShowMenu(false);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                {clinica.nome}
              </h3>
              <p className="text-sm text-gray-600">
                {getTipoLabel(clinica.tipo)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
              {status === 'ativa' ? 'Ativa' : status === 'inativa' ? 'Inativa' : 'Configurando'}
            </span>
            
            <div className="relative">
              <button
                onClick={handleMenuClick}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                  <div className="py-1">
                    <button
                      onClick={handleEditClick}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Editar</span>
                    </button>
                    {onDelete && (
                      <button
                        onClick={handleDeleteClick}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Deletar</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Informações */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="line-clamp-1">{formatarEndereco()}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Phone className="w-4 h-4 flex-shrink-0" />
            <span>{formatarTelefone()}</span>
          </div>
          
          {clinica.valor_consulta && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="font-medium">Consulta:</span>
              <span>R$ {clinica.valor_consulta.toFixed(2).replace('.', ',')}</span>
            </div>
          )}
        </div>

        {/* Estatísticas Mockadas (por enquanto) */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>Pacientes</span>
              </div>
              <p className="text-lg font-semibold text-gray-900 mt-1">-</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Este mês</span>
              </div>
              <p className="text-lg font-semibold text-gray-900 mt-1">-</p>
            </div>
          </div>
        </div>

        {/* Data de criação */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Criada em: {formatarData(clinica.created_at)}
          </p>
        </div>

        {/* Indicador de clique */}
        <div className="mt-3 text-center">
          <p className="text-xs text-blue-600 font-medium">
            Clique para editar
          </p>
        </div>
      </div>
    </div>
  );
} 