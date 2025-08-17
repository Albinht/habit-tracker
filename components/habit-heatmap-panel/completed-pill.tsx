import { CheckCircle, Edit } from 'lucide-react'

interface CompletedPillProps {
  isCompleted: boolean
  onEdit?: () => void
}

export function CompletedPill({ isCompleted, onEdit }: CompletedPillProps) {
  return (
    <div>
      <span className="inline-flex items-center gap-1 text-sm text-gray-600">
        Completed
        {isCompleted ? (
          <span className="text-green-600 font-medium">✓</span>
        ) : (
          <>
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-0.5 hover:bg-gray-100 rounded ml-1"
                aria-label="Edit today's entry"
              >
                <Edit className="h-3 w-3" />
              </button>
            )}
          </>
        )}
      </span>
    </div>
  )
}