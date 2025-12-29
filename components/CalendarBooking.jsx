'use client'

import { useState } from 'react'
import { 
  isMonday, 
  getBlockDates, 
  getDayOfWeek,
  getTuesdayToFridayDates,
  getWeekendDates,
  getTuesdayToSundayDates,
  detectBlockType,
  getBlockInfo,
  getBlockPrice,
  calculatePriceForRange
} from '@/lib/pricing'

export default function CalendarBooking({ data = {} }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDates, setSelectedDates] = useState(new Set())

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

  // Función para detectar si hay un bloque "Martes a Viernes" completo en la selección
  const hasTuesdayToFriday = (dates) => {
    const sortedDates = Array.from(dates).sort().filter(d => !isMonday(d))
    if (sortedDates.length < 4) return false
    
    // Buscar cualquier martes, miércoles, jueves o viernes
    for (const date of sortedDates) {
      const dayOfWeek = getDayOfWeek(date)
      if (dayOfWeek >= 2 && dayOfWeek <= 5) {
        const tuesdayToFriday = getTuesdayToFridayDates(date)
        const allPresent = tuesdayToFriday.every(d => dates.has(d))
        if (allPresent) return true
      }
    }
    return false
  }

  // Función para detectar si hay un bloque "Sábado y Domingo" completo en la selección
  const hasWeekend = (dates) => {
    const sortedDates = Array.from(dates).sort().filter(d => !isMonday(d))
    if (sortedDates.length < 2) return false
    
    for (const date of sortedDates) {
      const dayOfWeek = getDayOfWeek(date)
      if (dayOfWeek === 6 || dayOfWeek === 0) {
        const weekend = getWeekendDates(date)
        const allPresent = weekend.every(d => dates.has(d))
        if (allPresent) return true
      }
    }
    return false
  }

  // Función para detectar si hay "Martes a Domingo" completo
  const hasTuesdayToSunday = (dates) => {
    const sortedDates = Array.from(dates).sort().filter(d => !isMonday(d))
    if (sortedDates.length !== 6) return false
    
    const firstDate = sortedDates[0]
    const lastDate = sortedDates[5]
    const firstDay = getDayOfWeek(firstDate)
    const lastDay = getDayOfWeek(lastDate)
    
    return firstDay === 2 && lastDay === 0
  }

  const calculateTotal = () => {
    if (selectedDates.size === 0) return 0
    
    // Primero verificar si es "Martes a Domingo" completo
    if (hasTuesdayToSunday(selectedDates)) {
      return getBlockPrice('tuesdayToSunday')
    }
    
    // Si hay "Martes a Viernes" + "Sábado y Domingo", convertir en "Martes a Domingo"
    if (hasTuesdayToFriday(selectedDates) && hasWeekend(selectedDates)) {
      const sortedDates = Array.from(selectedDates).sort().filter(d => !isMonday(d))
      if (sortedDates.length === 6) {
        const firstDay = getDayOfWeek(sortedDates[0])
        const lastDay = getDayOfWeek(sortedDates[5])
        if (firstDay === 2 && lastDay === 0) {
          return getBlockPrice('tuesdayToSunday')
        }
      }
    }
    
    // Calcular por bloques individuales
    const processedDates = new Set()
    let total = 0
    const sortedDates = Array.from(selectedDates).sort()
    
    for (const date of sortedDates) {
      if (processedDates.has(date) || isMonday(date)) continue
      
      const dayOfWeek = getDayOfWeek(date)
      
      // Verificar si es parte de "Martes a Viernes"
      if (dayOfWeek >= 2 && dayOfWeek <= 5) {
        const tuesdayToFriday = getTuesdayToFridayDates(date)
        const blockComplete = tuesdayToFriday.every(d => selectedDates.has(d))
        if (blockComplete && !processedDates.has(tuesdayToFriday[0])) {
          total += getBlockPrice('tuesdayToFriday')
          tuesdayToFriday.forEach(d => processedDates.add(d))
          continue
        }
      }
      
      // Verificar si es parte de "Viernes a Domingo" (solo si no es parte de Martes a Viernes)
      if (dayOfWeek === 5) {
        const fridayToSunday = getBlockDates(date)
        const blockComplete = fridayToSunday.every(d => selectedDates.has(d))
        // Solo aplicar si no es parte de un bloque "Martes a Viernes"
        const tuesdayToFriday = getTuesdayToFridayDates(date)
        const isPartOfTuesdayToFriday = tuesdayToFriday.every(d => selectedDates.has(d))
        
        if (blockComplete && !isPartOfTuesdayToFriday && !processedDates.has(fridayToSunday[0])) {
          total += getBlockPrice('fridayToSunday')
          fridayToSunday.forEach(d => processedDates.add(d))
          continue
        }
      }
      
      // Verificar si es parte de "Sábado y Domingo"
      if (dayOfWeek === 6 || dayOfWeek === 0) {
        const weekend = getWeekendDates(date)
        const blockComplete = weekend.every(d => selectedDates.has(d))
        if (blockComplete && !processedDates.has(weekend[0])) {
          total += getBlockPrice('weekend')
          weekend.forEach(d => processedDates.add(d))
          continue
        }
      }
    }
    
    return total
  }

  const handleDayClick = (date) => {
    if (isMonday(date)) {
      return
    }
    
    const dayData = data[date]
    
    if (dayData?.status === 'reserved') {
      return
    }

    const dayOfWeek = getDayOfWeek(date)
    const newDates = new Set(selectedDates)
    
    // Si clickean martes, miércoles o jueves → seleccionar "Martes a Viernes"
    if (dayOfWeek >= 2 && dayOfWeek <= 4) {
      const tuesdayToFriday = getTuesdayToFridayDates(date)
      
      // Verificar disponibilidad
      const allAvailable = tuesdayToFriday.every(d => {
        if (isMonday(d)) return false
        return data[d]?.status !== 'reserved'
      })
      
      if (!allAvailable) return
      
      // Verificar si el bloque completo ya está seleccionado
      const blockIsSelected = tuesdayToFriday.every(d => selectedDates.has(d))
      
      if (blockIsSelected) {
        // Deseleccionar el bloque
        tuesdayToFriday.forEach(d => newDates.delete(d))
      } else {
        // Seleccionar el bloque
        tuesdayToFriday.forEach(d => {
          if (!isMonday(d) && data[d]?.status !== 'reserved') {
            newDates.add(d)
          }
        })
      }
    }
    // Si clickean viernes → verificar contexto
    else if (dayOfWeek === 5) {
      // Primero verificar si ya hay martes-jueves seleccionados
      const tuesdayToFriday = getTuesdayToFridayDates(date)
      const hasTuesdayToThursday = tuesdayToFriday.slice(0, 3).every(d => selectedDates.has(d))
      
      if (hasTuesdayToThursday) {
        // Si ya hay martes-jueves, agregar viernes al bloque "Martes a Viernes"
        const allAvailable = tuesdayToFriday.every(d => {
          if (isMonday(d)) return false
          return data[d]?.status !== 'reserved'
        })
        
        if (!allAvailable) return
        
        const blockIsSelected = tuesdayToFriday.every(d => selectedDates.has(d))
        
        if (blockIsSelected) {
          // Deseleccionar el bloque completo
          tuesdayToFriday.forEach(d => newDates.delete(d))
        } else {
          // Agregar viernes al bloque existente
          tuesdayToFriday.forEach(d => {
            if (!isMonday(d) && data[d]?.status !== 'reserved') {
              newDates.add(d)
            }
          })
        }
      } else {
        // Si no hay martes-jueves, seleccionar "Viernes a Domingo"
        const fridayToSunday = getBlockDates(date)
        
        const allAvailable = fridayToSunday.every(d => {
          if (isMonday(d)) return false
          return data[d]?.status !== 'reserved'
        })
        
        if (!allAvailable) return
        
        const blockIsSelected = fridayToSunday.every(d => selectedDates.has(d))
        
        if (blockIsSelected) {
          fridayToSunday.forEach(d => newDates.delete(d))
        } else {
          fridayToSunday.forEach(d => {
            if (!isMonday(d) && data[d]?.status !== 'reserved') {
              newDates.add(d)
            }
          })
        }
      }
    }
    // Si clickean sábado o domingo → seleccionar "Sábado y Domingo"
    else if (dayOfWeek === 6 || dayOfWeek === 0) {
      const weekend = getWeekendDates(date)
      
      const allAvailable = weekend.every(d => {
        if (isMonday(d)) return false
        return data[d]?.status !== 'reserved'
      })
      
      if (!allAvailable) return
      
      const blockIsSelected = weekend.every(d => selectedDates.has(d))
      
      if (blockIsSelected) {
        weekend.forEach(d => newDates.delete(d))
      } else {
        weekend.forEach(d => {
          if (!isMonday(d) && data[d]?.status !== 'reserved') {
            newDates.add(d)
          }
        })
      }
    }
    
    setSelectedDates(newDates)
  }

  const clearSelection = () => {
    setSelectedDates(new Set())
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

  const total = calculateTotal()
  const sortedDates = Array.from(selectedDates).sort()

  // Función para obtener el precio por día para una fecha específica
  const getPricePerDay = (date) => {
    if (!selectedDates.has(date) || isMonday(date)) return null
    
    // Primero verificar si es parte de "Martes a Domingo" completo
    if (hasTuesdayToSunday(selectedDates)) {
      const dayOfWeek = getDayOfWeek(date)
      // Martes a Viernes: 100000 cada uno
      if (dayOfWeek >= 2 && dayOfWeek <= 5) {
        return 100000
      }
      // Sábado y Domingo: 125000 cada uno
      if (dayOfWeek === 6 || dayOfWeek === 0) {
        return 125000
      }
    }
    
    // Verificar si es parte de "Martes a Viernes" solo
    const tuesdayToFriday = getTuesdayToFridayDates(date)
    if (tuesdayToFriday.length > 0 && tuesdayToFriday.every(d => selectedDates.has(d))) {
      const fridayToSunday = getBlockDates(date)
      const isPartOfFridayToSunday = fridayToSunday.every(d => selectedDates.has(d))
      // Si no es parte de Viernes a Domingo, entonces es Martes a Viernes solo
      if (!isPartOfFridayToSunday || getDayOfWeek(date) < 5) {
        return 100000 // 400000 / 4
      }
    }
    
    // Verificar si es parte de "Viernes a Domingo" solo
    const dayOfWeek = getDayOfWeek(date)
    if (dayOfWeek === 5) {
      const fridayToSunday = getBlockDates(date)
      if (fridayToSunday.every(d => selectedDates.has(d))) {
        const tuesdayToFriday = getTuesdayToFridayDates(date)
        const isPartOfTuesdayToFriday = tuesdayToFriday.every(d => selectedDates.has(d))
        // Si no es parte de Martes a Viernes, entonces es Viernes a Domingo solo
        if (!isPartOfTuesdayToFriday) {
          return 125000 // 375000 / 3
        }
      }
    }
    
    // Verificar si es parte de "Sábado y Domingo" solo
    if (dayOfWeek === 6 || dayOfWeek === 0) {
      const weekend = getWeekendDates(date)
      if (weekend.every(d => selectedDates.has(d))) {
        // Verificar que no sea parte de Martes a Domingo
        if (!hasTuesdayToSunday(selectedDates)) {
          return 125000 // 250000 / 2
        }
      }
    }
    
    return null
  }

  // Función para obtener los bloques detectados para mostrar en el resumen
  const getDetectedBlocks = () => {
    const blocks = []
    const processedDates = new Set()
    
    // Primero verificar si es "Martes a Domingo" completo
    if (hasTuesdayToSunday(selectedDates)) {
      const tuesdayToSunday = getTuesdayToSundayDates(sortedDates[0])
      return [{
        dates: tuesdayToSunday,
        info: getBlockInfo('tuesdayToSunday')
      }]
    }
    
    // Verificar bloques individuales
    for (const date of sortedDates) {
      if (processedDates.has(date) || isMonday(date)) continue
      
      const dayOfWeek = getDayOfWeek(date)
      
      // Verificar "Martes a Viernes"
      if (dayOfWeek >= 2 && dayOfWeek <= 5) {
        const tuesdayToFriday = getTuesdayToFridayDates(date)
        const blockComplete = tuesdayToFriday.every(d => selectedDates.has(d))
        if (blockComplete && !processedDates.has(tuesdayToFriday[0])) {
          blocks.push({
            dates: tuesdayToFriday,
            info: getBlockInfo('tuesdayToFriday')
          })
          tuesdayToFriday.forEach(d => processedDates.add(d))
          continue
        }
      }
      
      // Verificar "Viernes a Domingo"
      if (dayOfWeek === 5) {
        const fridayToSunday = getBlockDates(date)
        const blockComplete = fridayToSunday.every(d => selectedDates.has(d))
        const tuesdayToFriday = getTuesdayToFridayDates(date)
        const isPartOfTuesdayToFriday = tuesdayToFriday.every(d => selectedDates.has(d))
        
        if (blockComplete && !isPartOfTuesdayToFriday && !processedDates.has(fridayToSunday[0])) {
          blocks.push({
            dates: fridayToSunday,
            info: getBlockInfo('fridayToSunday')
          })
          fridayToSunday.forEach(d => processedDates.add(d))
          continue
        }
      }
      
      // Verificar "Sábado y Domingo"
      if (dayOfWeek === 6 || dayOfWeek === 0) {
        const weekend = getWeekendDates(date)
        const blockComplete = weekend.every(d => selectedDates.has(d))
        if (blockComplete && !processedDates.has(weekend[0])) {
          blocks.push({
            dates: weekend,
            info: getBlockInfo('weekend')
          })
          weekend.forEach(d => processedDates.add(d))
          continue
        }
      }
    }
    
    return blocks
  }

  return (
    <div className="w-full">
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

      <div className="grid grid-cols-7 gap-2 mb-8">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />
          }

          const date = formatDate(day)
          const dayData = data[date] || { status: 'available', note: '' }
          const isSelected = selectedDates.has(date)
          const isReserved = dayData.status === 'reserved'
          const isInquiry = dayData.status === 'inquiry'
          const isMondayBlocked = isMonday(date)

          return (
            <div
              key={date}
              onClick={() => !isReserved && !isMondayBlocked && handleDayClick(date)}
              className={`
                aspect-square border-2 rounded-lg p-2 flex flex-col items-center justify-center
                transition-all
                ${isReserved || isMondayBlocked
                  ? 'bg-gray-200 border-gray-300 line-through cursor-not-allowed opacity-50' 
                  : isInquiry
                  ? 'bg-orange-100 border-orange-300 cursor-pointer'
                  : isSelected
                  ? 'bg-blue-500 border-blue-600 text-white font-bold scale-105 shadow-lg cursor-pointer'
                  : 'bg-green-100 border-green-300 hover:bg-green-200 cursor-pointer'
                }
              `}
              title={isMondayBlocked ? 'Lunes no disponible (día de limpieza)' : ''}
            >
              <div className={`text-lg font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                {day}
              </div>
              {isSelected && !isMondayBlocked && (() => {
                const pricePerDay = getPricePerDay(date)
                if (pricePerDay) {
                  return (
                    <div className="text-xs mt-1 text-white/90 text-center font-medium">
                      ${pricePerDay.toLocaleString('es-AR')}
                    </div>
                  )
                }
                return null
              })()}
              {isMondayBlocked && (
                <div className="text-xs mt-1 text-gray-500">
                  No disponible
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Explicación de bloques */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-gray-900 mb-2">ℹ️ Cómo funciona la selección</h4>
        <p className="text-sm text-gray-700 mb-2">
          Los alquileres se realizan por <strong>bloques completos</strong>, no por días sueltos:
        </p>
        <ul className="text-sm text-gray-700 space-y-1 ml-4">
          <li>• <strong>Martes a Viernes:</strong> Hacé clic en martes, miércoles o jueves y se seleccionan los 4 días</li>
          <li>• <strong>Viernes a Domingo:</strong> Hacé clic en viernes (sin tener martes-jueves seleccionados) y se seleccionan los 3 días</li>
          <li>• <strong>Sábado y Domingo:</strong> Hacé clic en sábado o domingo y se seleccionan ambos días</li>
          <li>• <strong>Martes a Domingo:</strong> Si seleccionás "Martes a Viernes" y luego "Sábado y Domingo", se combina en un bloque de 6 días con precio especial</li>
        </ul>
      </div>

      {/* Resumen de selección */}
      {selectedDates.size > 0 && (
        <div className="bg-blue-50 rounded-xl p-6 mb-6 border-2 border-blue-200">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-gray-900">Resumen de Selección</h3>
            <button
              onClick={clearSelection}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Limpiar selección
            </button>
          </div>
          
          <div className="mb-4">
            <p className="text-gray-700 mb-3">
              <strong>Bloques seleccionados:</strong>
            </p>
            <div className="space-y-2">
              {getDetectedBlocks().map((block, idx) => {
                const [firstYear, firstMonth, firstDay] = block.dates[0].split('-').map(Number)
                const firstDate = new Date(firstYear, firstMonth - 1, firstDay)
                const [lastYear, lastMonth, lastDay] = block.dates[block.dates.length - 1].split('-').map(Number)
                const lastDate = new Date(lastYear, lastMonth - 1, lastDay)
                
                return (
                  <div key={idx} className="bg-white rounded-lg p-3 border border-blue-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-gray-900">{block.info.name}</div>
                        <div className="text-xs text-gray-600">
                          {firstDate.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })} - {lastDate.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-blue-600">${block.info.price.toLocaleString('es-AR')}</div>
                        <div className="text-xs text-gray-500">{block.info.days} día{block.info.days !== 1 ? 's' : ''}</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-blue-200">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-gray-900">Total:</span>
              <span className="text-3xl font-bold text-blue-600">
                ${total.toLocaleString('es-AR')} ARS
              </span>
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
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span className="text-gray-700">Seleccionado</span>
        </div>
      </div>
    </div>
  )
}
