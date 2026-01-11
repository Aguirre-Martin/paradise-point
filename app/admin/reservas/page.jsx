'use client'
import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import PaymentsModal from '@/components/PaymentsModal'
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'

export default function AdminReservas() {
  const [activeTab, setActiveTab] = useState('proximas')
  const [reservas, setReservas] = useState([])
  const [filteredReservas, setFilteredReservas] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [showPaymentsModal, setShowPaymentsModal] = useState(false)
  const [currentReservationId, setCurrentReservationId] = useState(null)
  const [editingReserva, setEditingReserva] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    clientCuit: '',
    totalAmount: '',
    paidAmount: '',
    deposit: '60000',
    status: 'senado',
    notes: ''
  })

  useEffect(() => {
    fetchReservas()
  }, [activeTab])

  useEffect(() => {
    filterReservas()
  }, [searchTerm, reservas, statusFilter])

  const fetchReservas = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/reservations?type=${activeTab}`, {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        setReservas(data.reservations || [])
      } else {
        console.error('Error fetching reservations:', res.status, res.statusText)
      }
    } catch (error) {
      console.error('Error fetching reservations:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterReservas = () => {
    let filtered = reservas

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(r => 
        r.clientName.toLowerCase().includes(term) ||
        r.clientEmail.toLowerCase().includes(term) ||
        r.clientPhone.includes(term)
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter)
    }

    setFilteredReservas(filtered)
  }

  const calculateDays = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0
    
    try {
      // Extract date part if it's an ISO string (2026-01-12T00:00:00.000Z -> 2026-01-12)
      const checkInStr = typeof checkIn === 'string' ? checkIn.split('T')[0] : checkIn
      const checkOutStr = typeof checkOut === 'string' ? checkOut.split('T')[0] : checkOut
      
      // Parse dates at noon to avoid timezone issues
      const start = new Date(checkInStr + 'T12:00:00')
      const end = new Date(checkOutStr + 'T12:00:00')
      
      // Check if dates are valid
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0
      
      const diffTime = end - start
      // Calculate number of days (inclusive of both check-in and check-out)
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1
      return diffDays > 0 ? diffDays : 0
    } catch (error) {
      console.error('Error calculating days:', error)
      return 0
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    
    // Frontend validation - parse dates at noon to avoid timezone issues
    const checkInDate = new Date(formData.checkIn + 'T12:00:00')
    const checkOutDate = new Date(formData.checkOut + 'T12:00:00')
    
    if (checkOutDate <= checkInDate) {
      setError('La fecha de check-out debe ser posterior al check-in')
      setSubmitting(false)
      return
    }

    if (parseInt(formData.paidAmount) > parseInt(formData.totalAmount)) {
      setError('El monto pagado no puede ser mayor al monto total')
      setSubmitting(false)
      return
    }
    
    try {
      const url = editingReserva 
        ? `/api/admin/reservations/${editingReserva.id}`
        : '/api/admin/reservations'
      
      const method = editingReserva ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          checkIn: formData.checkIn + 'T12:00:00.000Z',
          checkOut: formData.checkOut + 'T12:00:00.000Z',
          clientName: formData.clientName,
          clientEmail: formData.clientEmail,
          clientPhone: formData.clientPhone,
          clientAddress: formData.clientAddress || null,
          clientCuit: formData.clientCuit || null,
          totalAmount: parseInt(formData.totalAmount),
          paidAmount: parseInt(formData.paidAmount) || 0,
          deposit: parseInt(formData.deposit) || 60000,
          status: formData.status || 'senado',
          notes: formData.notes || ''
        })
      })

      const data = await res.json()

      if (res.ok) {
        setShowModal(false)
        resetForm()
        setError('')
        fetchReservas()
        
        // If creating a new reservation, open payments modal
        if (!editingReserva && data.reservation) {
          setCurrentReservationId(data.reservation.id)
          setShowPaymentsModal(true)
        }
        
        setEditingReserva(null)
      } else {
        console.error('Error response:', data)
        setError(data.error || 'Error al guardar la reserva')
      }
    } catch (error) {
      console.error('Error saving reservation:', error)
      setError(`Error de conexión: ${error.message}. Por favor intentá nuevamente.`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta reserva? Esta acción no se puede deshacer.')) return

    try {
      const res = await fetch(`/api/admin/reservations/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (res.ok) {
        fetchReservas()
      } else {
        const data = await res.json()
        alert(data.error || 'Error al eliminar la reserva')
      }
    } catch (error) {
      console.error('Error deleting reservation:', error)
      alert('Error de conexión. Por favor intentá nuevamente.')
    }
  }

  const openModal = (reserva = null) => {
    if (reserva) {
      setEditingReserva(reserva)
      setFormData({
        checkIn: reserva.checkIn.split('T')[0],
        checkOut: reserva.checkOut.split('T')[0],
        clientName: reserva.clientName,
        clientEmail: reserva.clientEmail,
        clientPhone: reserva.clientPhone,
        clientAddress: reserva.client?.address || '',
        clientCuit: reserva.client?.cuit || '',
        totalAmount: reserva.totalAmount.toString(),
        paidAmount: reserva.paidAmount.toString(),
        deposit: reserva.deposit?.toString() || '60000',
        status: reserva.status,
        notes: reserva.notes || ''
      })
    } else {
      resetForm()
    }
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      checkIn: '',
      checkOut: '',
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      clientAddress: '',
      clientCuit: '',
      totalAmount: '',
      paidAmount: '',
      deposit: '60000',
      status: 'senado',
      notes: ''
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pagado': return 'bg-green-100 text-green-800'
      case 'senado': return 'bg-yellow-100 text-yellow-800'
      case 'cancelado': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reservas</h1>
            <p className="text-gray-600 mt-1">Gestiona todas las reservas</p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nueva Reserva
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('proximas')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'proximas'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Próximas
            </button>
            <button
              onClick={() => setActiveTab('historial')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'historial'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Historial
            </button>
          </nav>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, email o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos los estados</option>
                <option value="senado">Señado</option>
                <option value="pagado">Pagado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reservations List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-600">Cargando...</div>
          ) : filteredReservas.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'No se encontraron reservas con los filtros aplicados' 
                : 'No hay reservas'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fechas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReservas.map((reserva) => (
                    <tr key={reserva.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{reserva.clientName}</div>
                          <div className="text-sm text-gray-500">{reserva.clientEmail}</div>
                          <div className="text-sm text-gray-500">{reserva.clientPhone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(reserva.checkIn)}</div>
                        <div className="text-sm text-gray-500">{formatDate(reserva.checkOut)}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {calculateDays(reserva.checkIn, reserva.checkOut)} {calculateDays(reserva.checkIn, reserva.checkOut) === 1 ? 'día' : 'días'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(reserva.totalAmount)}</div>
                        <div className="text-sm text-gray-500">Pagado: {formatCurrency(reserva.paidAmount)}</div>
                        {reserva.paidAmount < reserva.totalAmount && (
                          <div className="text-xs text-orange-600 mt-1">
                            Pendiente: {formatCurrency(reserva.totalAmount - reserva.paidAmount)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(reserva.status)}`}>
                          {reserva.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setCurrentReservationId(reserva.id)
                            setShowPaymentsModal(true)
                          }}
                          className="text-green-600 hover:text-green-900 mr-4"
                          title="Gestionar pagos"
                        >
                          <CurrencyDollarIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => openModal(reserva)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                          title="Editar reserva"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(reserva.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar reserva"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto" style={{
          zIndex: 9999,
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url("/images/hamaca-fondo.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowModal(false)} />

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full z-[10000]" style={{zIndex: 10000}}>
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {editingReserva ? 'Editar Reserva' : 'Nueva Reserva'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false)
                        setError('')
                        setEditingReserva(null)
                        resetForm()
                      }}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Check-in</label>
                      <input
                        type="date"
                        required
                        value={formData.checkIn}
                        onChange={(e) => setFormData({...formData, checkIn: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 text-gray-900 [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                        style={{ colorScheme: 'light' }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Check-out</label>
                      <input
                        type="date"
                        required
                        value={formData.checkOut}
                        onChange={(e) => setFormData({...formData, checkOut: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 text-gray-900 [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                        style={{ colorScheme: 'light' }}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Nombre Completo *</label>
                      <input
                        type="text"
                        required
                        value={formData.clientName}
                        onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                        placeholder="Fulanito Cosme"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-600 text-gray-900"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Dirección (opcional)</label>
                      <input
                        type="text"
                        value={formData.clientAddress}
                        onChange={(e) => setFormData({...formData, clientAddress: e.target.value})}
                        placeholder="Av. Siempre Viva 742, Springfield"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-600 text-gray-900"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.clientEmail}
                        onChange={(e) => setFormData({...formData, clientEmail: e.target.value})}
                        placeholder="fulanito.cosme@ejemplo.com"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-600 text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Teléfono *</label>
                      <input
                        type="tel"
                        required
                        value={formData.clientPhone}
                        onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
                        placeholder="555-0113"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-600 text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">CUIT (opcional)</label>
                      <input
                        type="text"
                        value={formData.clientCuit}
                        onChange={(e) => setFormData({...formData, clientCuit: e.target.value})}
                        placeholder="20-12345678-9"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-600 text-gray-900"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Monto Total *</label>
                        <input
                          type="number"
                          required
                          value={formData.totalAmount}
                          onChange={(e) => setFormData({...formData, totalAmount: e.target.value})}
                          placeholder="250000"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-600 text-gray-900"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Monto Pagado *</label>
                        <input
                          type="number"
                          min="0"
                          max={formData.totalAmount || ''}
                          required
                          value={formData.paidAmount}
                          onChange={(e) => setFormData({...formData, paidAmount: e.target.value})}
                          placeholder="125000"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-600 text-gray-900"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Depósito *</label>
                        <input
                          type="number"
                          required
                          value={formData.deposit}
                          onChange={(e) => setFormData({...formData, deposit: e.target.value})}
                          placeholder="60000"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-600 text-gray-900"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Estado *</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({...formData, status: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
                        >
                          <option value="senado">Señado</option>
                          <option value="pagado">Pagado</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      </div>
                    </div>

                    {formData.totalAmount && formData.paidAmount && (
                      <div className="md:col-span-2 mt-2">
                        <p className="text-sm text-gray-500">
                          <span className="font-medium">Restante:</span> {formatCurrency(parseInt(formData.totalAmount || 0) - parseInt(formData.paidAmount || 0))}
                        </p>
                      </div>
                    )}

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Notas</label>
                      <textarea
                        rows={3}
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        placeholder="Observaciones, requisitos especiales..."
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-600 text-gray-900"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {submitting ? 'Guardando...' : editingReserva ? 'Guardar' : 'Crear'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setError('')
                      setEditingReserva(null)
                      resetForm()
                    }}
                    disabled={submitting}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none disabled:opacity-50 sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Payments Modal */}
      {showPaymentsModal && currentReservationId && (
        <PaymentsModal
          reservationId={currentReservationId}
          onClose={() => {
            setShowPaymentsModal(false)
            setCurrentReservationId(null)
          }}
          onPaymentsUpdated={() => {
            fetchReservas()
          }}
        />
      )}
    </AdminLayout>
  )
}


