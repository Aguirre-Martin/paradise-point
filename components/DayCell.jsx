'use client'

export default function DayCell({ day, status, hasNote, editable, onClick, onNoteClick }) {
  const statusColors = {
    available: 'bg-green-100 hover:bg-green-200 border-green-300',
    inquiry: 'bg-orange-100 hover:bg-orange-200 border-orange-300',
    reserved: 'bg-red-100 hover:bg-red-200 border-red-300 line-through'
  }

  const color = statusColors[status] || statusColors.available

  return (
    <div
      className={`
        aspect-square border-2 rounded-lg p-2 flex flex-col items-center justify-center
        ${color}
        ${editable ? 'cursor-pointer' : ''}
        transition-colors
      `}
      onClick={onClick}
    >
      <div className="text-lg font-semibold text-gray-900">{day}</div>
      {hasNote && editable && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onNoteClick()
          }}
          className="mt-1 text-xs text-gray-600 hover:text-gray-900"
          title="Editar nota"
        >
          📝
        </button>
      )}
      {hasNote && !editable && (
        <div className="mt-1 text-xs text-gray-600">📝</div>
      )}
    </div>
  )
}








