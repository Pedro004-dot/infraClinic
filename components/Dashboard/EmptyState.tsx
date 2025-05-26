import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

interface EmptyStateProps {
  title: string
  message: string
  onRetry?: () => void
  isError?: boolean
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ title, message, onRetry, isError = false, actionLabel, onAction }: EmptyStateProps) {
  const Icon = isError ? ExclamationTriangleIcon : ArrowPathIcon
  const iconColor = isError ? 'text-red-500' : 'text-gray-400'
  const titleColor = isError ? 'text-red-600' : 'text-gray-900'

  // Prioriza onAction se fornecido, senão usa onRetry
  const handleAction = onAction || onRetry
  const buttonLabel = actionLabel || 'Tentar novamente'

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 p-8">
      <Icon className={`h-16 w-16 ${iconColor}`} />
      <div className="text-center space-y-2">
        <h3 className={`text-lg font-medium ${titleColor}`}>
          {title}
        </h3>
        <p className="text-gray-500 max-w-md">
          {message}
        </p>
      </div>
      {handleAction && (
        <button
          onClick={handleAction}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {buttonLabel}
        </button>
      )}
    </div>
  )
} 