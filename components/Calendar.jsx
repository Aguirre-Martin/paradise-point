'use client'

import { useState, useEffect } from 'react'
import DayCell from './DayCell'

export default function Calendar({ data = {}, editable = false, onDayChange, onNoteChange }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [noteInput, setNoteInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayOfWeek = firstDayOfMonth.getDay()

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  const formatDate = (day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const cycleStatus = (currentStatus) => {
    if (currentStatus === 'available') return 'inquiry'
    if (currentStatus === 'inquiry') return 'reserved'
    return 'available'
  }

  const getStatusLabel = (status) => {
    const labels = {
      available: 'Disponible',
      inquiry: 'Consulta',
      reserved: 'Reservado'
    }
    return labels[status] || status
  }

  const handleDayClick = async (date) => {
    if (!editable || saving) return

    const currentStatus = data[date]?.status || 'available'
    const nextStatus = cycleStatus(currentStatus)

    setSaving(true)
    setSaveStatus(null)
    try {
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          status: nextStatus,
          note: data[date]?.note || ''
        })
      })

      if (response.ok) {
        setSaveStatus('success')
        if (onDayChange) {
          onDayChange(date, nextStatus)
        }
        setTimeout(() => {
          window.location.reload()
        }, 300)
      } else {
        setSaveStatus('error')
      }
    } catch (error) {
      console.error('Error updating day:', error)
      setSaveStatus('error')
    } finally {
      setSaving(false)
      setTimeout(() => setSaveStatus(null), 2000)
    }
  }

  const handleNoteClick = (date) => {
    if (!editable) return
    setSelectedDate(date)
    setNoteInput(data[date]?.note || '')
  }

  const handleNoteSave = async () => {
    if (!selectedDate || saving) return

    setSaving(true)
    setSaveStatus(null)
    try {
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          status: data[selectedDate]?.status || 'available',
          note: noteInput
        })
      })

      if (response.ok) {
        setSaveStatus('success')
        if (onNoteChange) {
          onNoteChange(selectedDate, noteInput)
        }
        setSelectedDate(null)
        setNoteInput('')
        setTimeout(() => {
          window.location.reload()
        }, 300)
      } else {
        setSaveStatus('error')
      }
    } catch (error) {
      console.error('Error saving note:', error)
      setSaveStatus('error')
    } finally {
      setSaving(false)
      setTimeout(() => setSaveStatus(null), 2000)
    }
  }

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const days = []
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevMonth}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        >
          ← Anterior
        </button>
        <h2 className="text-2xl font-bold text-gray-900">
          {monthNames[month]} {year}
        </h2>
        <button
          onClick={nextMonth}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        >
          Siguiente →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />
          }

          const date = formatDate(day)
          const dayData = data[date] || { status: 'available', note: '' }

          return (
            <DayCell
              key={date}
              day={day}
              status={dayData.status}
              hasNote={!!dayData.note}
              editable={editable}
              onClick={() => handleDayClick(date)}
              onNoteClick={() => handleNoteClick(date)}
            />
          )
        })}
      </div>

      {editable && (
        <div className="mt-4 text-center">
          {saving && (
            <div className="text-blue-600 text-sm">Guardando...</div>
          )}
          {saveStatus === 'success' && (
            <div className="text-green-600 text-sm">¡Guardado!</div>
          )}
          {saveStatus === 'error' && (
            <div className="text-red-600 text-sm">Error al guardar</div>
          )}
          {!saving && !saveStatus && (
            <div className="text-sm text-gray-600">
              Hacé clic en un día para cambiar el estado, o en el ícono 📝 para editar la nota
            </div>
          )}
        </div>
      )}

      {selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              Editar nota para {selectedDate}
            </h3>
            <textarea
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Agregar una nota..."
            />
            <div className="flex gap-2">
              <button
                onClick={handleNoteSave}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                onClick={() => {
                  setSelectedDate(null)
                  setNoteInput('')
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-gray-700">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-500 rounded"></div>
          <span className="text-gray-700">Consulta</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-gray-700">Reservado</span>
        </div>
      </div>
    </div>
  )
}

