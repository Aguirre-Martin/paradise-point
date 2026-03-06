'use client'
import AdminLayout from '@/components/AdminLayout'
import { Cog6ToothIcon } from '@heroicons/react/24/outline'

export default function AdminConfig() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-600 mt-1">Configura el sistema</p>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <div className="text-center">
            <Cog6ToothIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Próximamente</h3>
            <p className="text-gray-600">
              Gestión de usuarios admin, reglas de la casa, comodidades y más.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}




