'use client'
import { useState, useEffect } from 'react'
import { 
  XMarkIcon, 
  PlusIcon, 
  TrashIcon,
  PencilIcon,
  DocumentArrowUpIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

export default function PaymentsModal({ reservationId, onClose, onPaymentsUpdated }) {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showProofViewer, setShowProofViewer] = useState(false)
  const [currentProofUrl, setCurrentProofUrl] = useState(null)
  const [editingPayment, setEditingPayment] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [uploadingProof, setUploadingProof] = useState(false)
  
  const [formData, setFormData] = useState({
    amount: '',
    concept: 'Depósito',
    method: 'TRANSFERENCIA',
    recipient: 'Martin',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: '',
    proofFileName: null
  })

  useEffect(() => {
    fetchPayments()
  }, [reservationId])

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/payments?reservationId=${reservationId}`, {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        setPayments(data.payments || [])
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (file) => {
    if (!file) return null

    setUploadingProof(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('reservationId', reservationId)

      const res = await fetch('/api/admin/upload/comprobante', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      if (res.ok) {
        const data = await res.json()
        return data.fileName
      } else {
        const data = await res.json()
        setError(data.error || 'Error al subir el comprobante')
        return null
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      setError('Error al subir el comprobante')
      return null
    } finally {
      setUploadingProof(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const url = editingPayment
        ? `/api/admin/payments/${editingPayment.id}`
        : '/api/admin/payments'
      
      const method = editingPayment ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          reservationId,
          amount: parseInt(formData.amount),
          concept: formData.concept,
          method: formData.method,
          recipient: formData.recipient,
          paymentDate: formData.paymentDate + 'T12:00:00.000Z',
          notes: formData.notes || null,
          proofFileName: formData.proofFileName
        })
      })

      const data = await res.json()

      if (res.ok) {
        setShowForm(false)
        setEditingPayment(null)
        resetForm()
        fetchPayments()
        if (onPaymentsUpdated) onPaymentsUpdated()
      } else {
        setError(data.error || 'Error al guardar el pago')
      }
    } catch (error) {
      console.error('Error saving payment:', error)
      setError('Error de conexión. Por favor intentá nuevamente.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este pago? Esta acción no se puede deshacer.')) return

    try {
      const res = await fetch(`/api/admin/payments/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (res.ok) {
        fetchPayments()
        if (onPaymentsUpdated) onPaymentsUpdated()
      } else {
        const data = await res.json()
        alert(data.error || 'Error al eliminar el pago')
      }
    } catch (error) {
      console.error('Error deleting payment:', error)
      alert('Error de conexión. Por favor intentá nuevamente.')
    }
  }

  const openForm = (payment = null) => {
    if (payment) {
      setEditingPayment(payment)
      setFormData({
        amount: payment.amount.toString(),
        concept: payment.concept,
        method: payment.method,
        recipient: payment.recipient,
        paymentDate: payment.paymentDate.split('T')[0],
        notes: payment.notes || '',
        proofFileName: payment.proofFileName
      })
    } else {
      resetForm()
    }
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      amount: '',
      concept: 'Depósito',
      method: 'TRANSFERENCIA',
      recipient: 'Martin',
      paymentDate: new Date().toISOString().split('T')[0],
      notes: '',
      proofFileName: null
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

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="fixed inset-0 z-[11000] overflow-y-auto bg-black/50">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div>
              <h3 className="text-lg font-medium text-gray-900">💰 Gestión de Pagos</h3>
              <p className="text-sm text-gray-500 mt-1">
                Total pagado: <span className="font-semibold text-green-600">{formatCurrency(totalPaid)}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {!showForm && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-medium text-gray-700">Historial de Pagos</h4>
                  <button
                    onClick={() => openForm()}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Agregar Pago
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-8 text-gray-600">Cargando...</div>
                ) : payments.length === 0 ? (
                  <div className="text-center py-8 text-gray-600">
                    No hay pagos registrados
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Concepto</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Método</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receptor</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comprobante</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {payments.map((payment) => (
                          <tr key={payment.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{formatDate(payment.paymentDate)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{payment.concept}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(payment.amount)}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{payment.method}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{payment.recipient}</td>
                            <td className="px-4 py-3 text-sm">
                              {payment.proofFileName ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCurrentProofUrl(`/uploads/comprobantes/${reservationId}/${payment.proofFileName}`)
                                    setShowProofViewer(true)
                                  }}
                                  className="text-blue-600 hover:text-blue-800 flex items-center"
                                >
                                  <EyeIcon className="h-4 w-4 mr-1" />
                                  Ver
                                </button>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <button
                                onClick={() => openForm(payment)}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(payment.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {showForm && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-medium text-gray-700">
                    {editingPayment ? 'Editar Pago' : 'Nuevo Pago'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingPayment(null)
                      resetForm()
                      setError('')
                    }}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Monto *</label>
                    <input
                      type="number"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      placeholder="60000"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Concepto *</label>
                    <select
                      value={formData.concept}
                      onChange={(e) => setFormData({...formData, concept: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    >
                      <option value="Depósito">Depósito</option>
                      <option value="Adelanto">Adelanto</option>
                      <option value="Pago Final">Pago Final</option>
                      <option value="Pago Parcial">Pago Parcial</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Método *</label>
                    <select
                      value={formData.method}
                      onChange={(e) => setFormData({...formData, method: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    >
                      <option value="TRANSFERENCIA">Transferencia</option>
                      <option value="EFECTIVO">Efectivo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Receptor *</label>
                    <select
                      value={formData.recipient}
                      onChange={(e) => setFormData({...formData, recipient: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    >
                      <option value="Martin">Martin</option>
                      <option value="Julieta">Julieta</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de Pago *</label>
                    <input
                      type="date"
                      required
                      value={formData.paymentDate}
                      onChange={(e) => setFormData({...formData, paymentDate: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Comprobante (opcional)</label>
                    <div className="mt-1 flex items-center">
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={async (e) => {
                          const file = e.target.files[0]
                          if (file) {
                            const fileName = await handleFileUpload(file)
                            if (fileName) {
                              setFormData({...formData, proofFileName: fileName})
                            }
                          }
                        }}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        disabled={uploadingProof}
                      />
                      {uploadingProof && (
                        <span className="ml-2 text-sm text-gray-500">Subiendo...</span>
                      )}
                    </div>
                    {formData.proofFileName && (
                      <p className="mt-1 text-xs text-green-600">✓ Comprobante cargado</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Notas</label>
                    <textarea
                      rows={2}
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Observaciones adicionales..."
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingPayment(null)
                      resetForm()
                      setError('')
                    }}
                    disabled={submitting}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || uploadingProof}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? 'Guardando...' : editingPayment ? 'Actualizar' : 'Guardar'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
          {!showForm && (
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Proof Viewer Modal */}
      {showProofViewer && currentProofUrl && (
        <div className="fixed inset-0 z-[12000] overflow-y-auto bg-black/80" onClick={() => setShowProofViewer(false)}>
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h3 className="text-lg font-medium text-gray-900">Comprobante de Pago</h3>
                <button
                  onClick={() => setShowProofViewer(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="px-6 py-4 max-h-[80vh] overflow-auto">
                {currentProofUrl.endsWith('.pdf') ? (
                  <iframe
                    src={currentProofUrl}
                    className="w-full h-[70vh]"
                    title="Comprobante PDF"
                  />
                ) : (
                  <img
                    src={currentProofUrl}
                    alt="Comprobante"
                    className="w-full h-auto"
                  />
                )}
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t flex justify-between">
                <a
                  href={currentProofUrl}
                  download
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Descargar
                </a>
                <button
                  onClick={() => setShowProofViewer(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

