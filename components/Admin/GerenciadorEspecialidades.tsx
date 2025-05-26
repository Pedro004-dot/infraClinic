'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Stethoscope
} from 'lucide-react';

interface Especialidade {
  id: number;
  nome: string;
  descricao?: string;
  ativa: boolean;
}

interface GerenciadorEspecialidadesProps {
  clinicaId: string;
}

export default function GerenciadorEspecialidades({ clinicaId }: GerenciadorEspecialidadesProps) {
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState<number | null>(null);
  const [criando, setCriando] = useState(false);
  const [formData, setFormData] = useState({ nome: '', descricao: '' });

  useEffect(() => {
    buscarEspecialidades();
  }, [clinicaId]);

  const buscarEspecialidades = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/clinicas/${clinicaId}/especialidades`);
      
      if (response.ok) {
        const data = await response.json();
        setEspecialidades(data);
      }
    } catch (error) {
      console.error('Erro ao buscar especialidades:', error);
    } finally {
      setLoading(false);
    }
  };

  const salvarEspecialidade = async () => {
    try {
      const url = editando 
        ? `/api/admin/especialidades/${editando}`
        : `/api/admin/especialidades`;
      
      const method = editando ? 'PUT' : 'POST';
      const body = editando 
        ? formData
        : { ...formData, clinica_id: parseInt(clinicaId) };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await buscarEspecialidades();
        cancelarEdicao();
      }
    } catch (error) {
      console.error('Erro ao salvar especialidade:', error);
    }
  };

  const excluirEspecialidade = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta especialidade?')) return;

    try {
      const response = await fetch(`/api/admin/especialidades/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await buscarEspecialidades();
      }
    } catch (error) {
      console.error('Erro ao excluir especialidade:', error);
    }
  };

  const iniciarEdicao = (especialidade: Especialidade) => {
    setEditando(especialidade.id);
    setFormData({
      nome: especialidade.nome,
      descricao: especialidade.descricao || ''
    });
    setCriando(false);
  };

  const iniciarCriacao = () => {
    setCriando(true);
    setEditando(null);
    setFormData({ nome: '', descricao: '' });
  };

  const cancelarEdicao = () => {
    setEditando(null);
    setCriando(false);
    setFormData({ nome: '', descricao: '' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-blue-600" />
            Especialidades ({especialidades.length})
          </CardTitle>
          <Button onClick={iniciarCriacao} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nova Especialidade
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Formulário de criação/edição */}
        {(criando || editando) && (
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Especialidade *
                </label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Dermatologia Estética"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <Textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descrição da especialidade..."
                  rows={2}
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={salvarEspecialidade}
                  disabled={!formData.nome.trim()}
                  size="sm"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
                <Button 
                  onClick={cancelarEdicao}
                  variant="outline"
                  size="sm"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de especialidades */}
        <div className="space-y-2">
          {especialidades.map((especialidade) => (
            <div 
              key={especialidade.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900">{especialidade.nome}</h4>
                  <Badge variant={especialidade.ativa ? "default" : "secondary"}>
                    {especialidade.ativa ? 'Ativa' : 'Inativa'}
                  </Badge>
                </div>
                {especialidade.descricao && (
                  <p className="text-sm text-gray-600 mt-1">{especialidade.descricao}</p>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => iniciarEdicao(especialidade)}
                  variant="outline"
                  size="sm"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => excluirEspecialidade(especialidade.id)}
                  variant="outline"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {especialidades.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Stethoscope className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>Nenhuma especialidade cadastrada</p>
              <p className="text-gray-600 text-sm">
                Clique em &quot;Nova Especialidade&quot; para começar
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 