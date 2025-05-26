import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline'

interface MetricCardProps {
  name: string
  value: string
  change: string
  isPositive: boolean
  loading?: boolean
  isLoading?: boolean
  icon: React.ComponentType<{ className?: string }>
  color: string
  period?: 'hoje' | 'semana' | 'mes'
}

export function MetricCard({ 
  name, 
  value, 
  change, 
  isPositive, 
  loading,
  isLoading, 
  icon: Icon, 
  color,
  period
}: MetricCardProps) {
  // Usa isLoading se fornecido, senão usa loading
  const isLoadingState = isLoading !== undefined ? isLoading : loading

  if (isLoadingState) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
          <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
            <div className="h-6 w-6 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="mt-4 flex items-center">
          <div className="h-4 w-4 bg-gray-200 rounded mr-2"></div>
          <div className="h-4 bg-gray-200 rounded w-12"></div>
        </div>
      </div>
    )
  }

  const TrendIcon = isPositive ? ArrowTrendingUpIcon : ArrowTrendingDownIcon
  const trendColor = isPositive ? 'text-green-500' : 'text-red-500'

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{name}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
          <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
        </div>
      </div>
      <div className="mt-4 flex items-center">
        <TrendIcon className={`h-4 w-4 ${trendColor}`} />
        <span className={`ml-2 text-sm font-medium ${trendColor}`}>
          {change}
        </span>
        <span className="ml-2 text-sm text-gray-500">
          vs período anterior
        </span>
      </div>
    </div>
  )
} 