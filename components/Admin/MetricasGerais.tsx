import { Building2, Users, Calendar, TrendingUp } from 'lucide-react';

interface Clinica {
  id: number;
  nome: string;
  total_pacientes: number;
  agendamentos_mes: number;
  status: 'ativa' | 'inativa' | 'configurando';
}

interface MetricasGeraisProps {
  clinicas?: Clinica[];
}

export function MetricasGerais({ clinicas = [] }: MetricasGeraisProps) {
  const totalClinicas = clinicas.length;
  const clinicasAtivas = clinicas.filter(c => c.status === 'ativa').length;
  const totalPacientes = clinicas.reduce((acc, c) => acc + c.total_pacientes, 0);
  const totalAgendamentos = clinicas.reduce((acc, c) => acc + c.agendamentos_mes, 0);

  const metricas = [
    {
      name: 'Total de Clínicas',
      value: totalClinicas.toString(),
      icon: Building2,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      name: 'Clínicas Ativas',
      value: clinicasAtivas.toString(),
      icon: TrendingUp,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      name: 'Total de Pacientes',
      value: totalPacientes.toLocaleString(),
      icon: Users,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      name: 'Agendamentos/Mês',
      value: totalAgendamentos.toLocaleString(),
      icon: Calendar,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricas.map((metrica) => {
        const Icon = metrica.icon;
        
        return (
          <div key={metrica.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${metrica.bgColor}`}>
                <Icon className={`w-6 h-6 ${metrica.textColor}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {metrica.name}
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {metrica.value}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
} 