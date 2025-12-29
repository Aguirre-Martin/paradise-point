'use client'
import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import Calendar from '@/components/Calendar'
import { PrinterIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'

export default function AdminCalendario() {
  const [calendarData, setCalendarData] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('calendar')
  const [searchDate, setSearchDate] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  useEffect(() => {
    fetchCalendarData()
  }, [])

  const fetchCalendarData = async () => {
    try {
      const res = await fetch('/api/calendar')
      if (res.ok) {
        const data = await res.json()
        setCalendarData(data)
      }
    } catch (error) {
      console.error('Error fetching calendar:', error)
    } finally {
      setLoading(false)
    }
  }

  const getReservationsList = () => {
    const reservations = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    Object.entries(calendarData).forEach(([date, info]) => {
      const dateObj = new Date(date + 'T00:00:00')
      if (dateObj >= today && (info.status === 'reserved' || info.status === 'inquiry')) {
        reservations.push({ date, ...info, dateObj })
      }
    })

    return reservations.sort((a, b) => a.dateObj - b.dateObj)
  }

  const getFilteredReservations = () => {
    let reservations = getReservationsList()

    if (searchDate) {
      reservations = reservations.filter(r => r.date.includes(searchDate))
    }

    if (filterMonth) {
      reservations = reservations.filter(r => r.date.startsWith(filterMonth))
    }

    if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start + 'T00:00:00')
      const endDate = new Date(dateRange.end + 'T00:00:00')
      reservations = reservations.filter(r => 
        r.dateObj >= startDate && r.dateObj <= endDate
      )
    }

    return reservations
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExportCSV = () => {
    const reservations = getReservationsList()
    const csv = [
      ['Fecha', 'Estado', 'Nota'],
      ...reservations.map(r => [
        r.date,
        r.status === 'reserved' ? 'Reservado' : 'Consulta',
        r.note || ''
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reservas-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Calendario</h1>
            <p className="text-gray-600 mt-1">Gestiona la disponibilidad y reservas</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              <PrinterIcon className="h-5 w-5 mr-2" />
              Imprimir
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Exportar CSV
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('calendar')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'calendar'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Vista Calendario
              </button>
              <button
                onClick={() => setActiveTab('list')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'list'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Lista de Reservas
              </button>
            </nav>
          </div>

          {/* Calendar Tab */}
          {activeTab === 'calendar' && (
            <div className="p-6">
              {loading ? (
                <div className="text-center py-12 text-gray-600">Cargando calendario...</div>
              ) : (
                <>
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      Gestión del Calendario
                    </h2>
                    <p className="text-gray-600 mb-2">
                      Hacé clic en un día para cambiar el estado: Disponible → Consulta → Reservado → Disponible
                    </p>
                    <p className="text-gray-600">
                      Hacé clic en el ícono 📝 de cualquier día para agregar o editar una nota.
                    </p>
                  </div>

                  <Calendar
                    data={calendarData}
                    editable={true}
                    onDayChange={(date, status) => {
                      setCalendarData(prev => ({
                        ...prev,
                        [date]: { ...prev[date], status }
                      }))
                    }}
                    onNoteChange={(date, note) => {
                      setCalendarData(prev => ({
                        ...prev,
                        [date]: { ...prev[date], note }
                      }))
                    }}
                  />
                </>
              )}
            </div>
          )}

          {/* List Tab */}
          {activeTab === 'list' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Próximas Reservas y Consultas
                </h2>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Buscar por fecha
                    </label>
                    <input
                      type="date"
                      value={searchDate}
                      onChange={(e) => setSearchDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Filtrar por mes
                    </label>
                    <input
                      type="month"
                      value={filterMonth}
                      onChange={(e) => setFilterMonth(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rango de fechas
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Desde"
                      />
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Hasta"
                      />
                    </div>
                  </div>
                </div>

                {/* Clear filters */}
                {(searchDate || filterMonth || dateRange.start || dateRange.end) && (
                  <button
                    onClick={() => {
                      setSearchDate('')
                      setFilterMonth('')
                      setDateRange({ start: '', end: '' })
                    }}
                    className="mb-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>

              {/* Reservations list */}
              <div className="space-y-4">
                {getFilteredReservations().length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No hay reservas o consultas próximas
                  </div>
                ) : (
                  getFilteredReservations().map(reservation => (
                    <div
                      key={reservation.date}
                      className={`p-4 rounded-lg border-l-4 ${
                        reservation.status === 'reserved'
                          ? 'bg-green-50 border-green-500'
                          : 'bg-yellow-50 border-yellow-500'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-semibold text-gray-900">
                              {new Date(reservation.date + 'T00:00:00').toLocaleDateString('es-AR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              reservation.status === 'reserved'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {reservation.status === 'reserved' ? 'Reservado' : 'Consulta'}
                            </span>
                          </div>
                          {reservation.note && (
                            <p className="mt-2 text-gray-700">
                              <span className="font-medium">Nota:</span> {reservation.note}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

