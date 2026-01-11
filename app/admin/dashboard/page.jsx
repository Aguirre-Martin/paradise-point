"use client";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    ocupacionMes: 0,
    ingresosMes: 0,
    proximasReservas: [],
    diasDisponibles: 0,
    totalReservasMes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const res = await fetch("/api/admin/metrics", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pagado":
        return "bg-green-100 text-green-800";
      case "senado":
        return "bg-yellow-100 text-yellow-800";
      case "cancelado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Cargando métricas...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Vista general del mes actual</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Ocupación */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ocupación</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {metrics.ocupacionMes}%
                </p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <ChartBarIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">Este mes</p>
          </div>

          {/* Ingresos */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(metrics.ingresosMes)}
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              {metrics.totalReservasMes} reservas
            </p>
          </div>

          {/* Días disponibles */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Días Disponibles
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {metrics.diasDisponibles}
                </p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <CalendarDaysIcon className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">Restantes este mes</p>
          </div>

          {/* Próximas reservas */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Próximas Reservas
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {metrics.proximasReservas.length}
                </p>
              </div>
              <div className="bg-orange-100 rounded-full p-3">
                <ClockIcon className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">Los próximos 30 días</p>
          </div>
        </div>

        {/* Próximas Reservas */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Próximas Reservas
            </h2>
          </div>
          <div className="p-6">
            {metrics.proximasReservas.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No hay reservas próximas
              </p>
            ) : (
              <div className="space-y-4">
                {metrics.proximasReservas.slice(0, 5).map((reserva) => (
                  <div
                    key={reserva.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {reserva.clientName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(reserva.checkIn)} -{" "}
                        {formatDate(reserva.checkOut)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          reserva.status
                        )}`}
                      >
                        {reserva.status}
                      </span>
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(reserva.totalAmount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href="/admin/calendario"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <CalendarDaysIcon className="h-8 w-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900">Ver Calendario</h3>
            <p className="text-sm text-gray-600 mt-1">
              Gestionar disponibilidad
            </p>
          </a>

          <a
            href="/admin/reservas"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <ClockIcon className="h-8 w-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-gray-900">Nueva Reserva</h3>
            <p className="text-sm text-gray-600 mt-1">Agregar manualmente</p>
          </a>

          <a
            href="/admin/clientes"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <ChartBarIcon className="h-8 w-8 text-purple-600 mb-3" />
            <h3 className="font-semibold text-gray-900">Ver Clientes</h3>
            <p className="text-sm text-gray-600 mt-1">Gestionar clientes</p>
          </a>
        </div>
      </div>
    </AdminLayout>
  );
}
