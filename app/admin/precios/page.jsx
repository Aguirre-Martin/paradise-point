'use client'
import AdminLayout from '@/components/AdminLayout'
import { CurrencyDollarIcon } from '@heroicons/react/24/outline'

export default function AdminPrecios() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Precios</h1>
          <p className="text-gray-600 mt-1">Gestiona los precios y promociones</p>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <div className="text-center">
            <CurrencyDollarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Próximamente</h3>
            <p className="text-gray-600">
              Esta sección estará disponible pronto. Por ahora, los precios se gestionan desde el código.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

