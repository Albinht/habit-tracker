import { CheckCircle, Edit } from 'lucide-react'

interface CompletedPillProps {
  isCompleted: boolean
  onEdit?: () => void
}

export function CompletedPill({ isCompleted, onEdit }: CompletedPillProps) {
  return (
    <div>
      <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
        {isCompleted ? (
          <>
            Completed
            <CheckCircle className="h-4 w-4 text-green-500" aria-hidden="true" />
          </>
        ) : (
          <>
            Not completed
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-0.5 hover:bg-gray-100 rounded"
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