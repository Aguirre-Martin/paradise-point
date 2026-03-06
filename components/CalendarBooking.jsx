'use client'

import { useState } from 'react'
import { 
  isMonday, 
  getBlockDates, 
  getDayOfWeek,
  getMondayToFridayDates,
  getWeekendDates,
  getTuesdayToSundayDates,
  getMondayToSundayDates,
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

  const hasMondayToFriday = (dates) => {
    const sortedDates = Array.from(dates).sort()
    if (sortedDates.length < 5) return false
    for (const date of sortedDates) {
      const dayOfWeek = getDayOfWeek(date)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        const mondayToFriday = getMondayToFridayDates(date)
        if (mondayToFriday.length === 5 && mondayToFriday.every(d => dates.has(d))) return true
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

  // Lunes a Domingo (7 días)
  const hasMondayToSunday = (dates) => {
    const sortedDates = Array.from(dates).sort()
    if (sortedDates.length !== 7) return false
    const firstDay = getDayOfWeek(sortedDates[0])
    const lastDay = getDayOfWeek(sortedDates[6])
    return firstDay === 1 && lastDay === 0
  }

  // Martes a Domingo (6 días)
  const hasTuesdayToSunday = (dates) => {
    const sortedDates = Array.from(dates).sort().filter(d => !isMonday(d))
    if (sortedDates.length !== 6) return false
    const firstDay = getDayOfWeek(sortedDates[0])
    const lastDay = getDayOfWeek(sortedDates[5])
    return firstDay === 2 && lastDay === 0
  }

  const calculateTotal = () => {
    if (selectedDates.size === 0) return 0

    if (hasMondayToSunday(selectedDates)) {
      return getBlockPrice('mondayToSunday')
    }
    
    if (hasTuesdayToSunday(selectedDates)) {
      return getBlockPrice('tuesdayToSunday')
    }
    
    // Calcular por bloques individuales
    const processedDates = new Set()
    let total = 0
    const sortedDates = Array.from(selectedDates).sort()
    
    for (const date of sortedDates) {
      if (processedDates.has(date)) continue
      
      const dayOfWeek = getDayOfWeek(date)
      
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        const mondayToFriday = getMondayToFridayDates(date)
        if (mondayToFriday.length === 5) {
          const blockComplete = mondayToFriday.every(d => selectedDates.has(d))
          if (blockComplete && !processedDates.has(mondayToFriday[0])) {
            total += getBlockPrice('mondayToFriday')
            mondayToFriday.forEach(d => processedDates.add(d))
            continue
          }
        }
      }
      
      if (date === '2026-03-23' || date === '2026-03-24' || date === '2025-03-23' || date === '2025-03-24') {
        const year = date.slice(0, 4)
        const feriadoBlock = [year + '-03-23', year + '-03-24']
        if (feriadoBlock.every(d => selectedDates.has(d)) && !processedDates.has(feriadoBlock[0])) {
          total += getBlockPrice('feriado23y24Marzo')
          feriadoBlock.forEach(d => processedDates.add(d))
          continue
        }
      }

      if (dayOfWeek === 5) {
        const fridayToSunday = getBlockDates(date)
        const blockComplete = fridayToSunday.every(d => selectedDates.has(d))
        const mondayToFriday = getMondayToFridayDates(date)
        const isPartOfMondayToFriday = mondayToFriday.length === 5 && mondayToFriday.every(d => selectedDates.has(d))
        
        if (blockComplete && !isPartOfMondayToFriday && !processedDates.has(fridayToSunday[0])) {
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
    const dayData = data[date]

    if (dayData?.status === 'reserved') {
      return
    }

    const dayOfWeek = getDayOfWeek(date)
    const newDates = new Set(selectedDates)

    const feriadoMarzoBlock = getBlockDates(date)
    if (feriadoMarzoBlock.length === 2 && (date === '2026-03-23' || date === '2026-03-24' || date === '2025-03-23' || date === '2025-03-24')) {
      const allAvailable = feriadoMarzoBlock.every(d => data[d]?.status !== 'reserved')
      if (!allAvailable) return
      const blockIsSelected = feriadoMarzoBlock.every(d => selectedDates.has(d))
      if (blockIsSelected) {
        feriadoMarzoBlock.forEach(d => newDates.delete(d))
      } else {
        feriadoMarzoBlock.forEach(d => { if (data[d]?.status !== 'reserved') newDates.add(d) })
      }
      setSelectedDates(newDates)
      return
    }

    // Lunes, martes, miércoles o jueves → seleccionar "Lunes a Viernes"
    if (dayOfWeek >= 1 && dayOfWeek <= 4) {
      const mondayToFriday = getMondayToFridayDates(date)
      if (mondayToFriday.length !== 5) {
        setSelectedDates(newDates)
        return
      }
      const allAvailable = mondayToFriday.every(d => data[d]?.status !== 'reserved')
      if (!allAvailable) return
      const blockIsSelected = mondayToFriday.every(d => selectedDates.has(d))
      if (blockIsSelected) {
        mondayToFriday.forEach(d => newDates.delete(d))
      } else {
        mondayToFriday.forEach(d => {
          if (data[d]?.status !== 'reserved') newDates.add(d)
        })
      }
    }
    else if (dayOfWeek === 5) {
      const mondayToFriday = getMondayToFridayDates(date)
      const hasMondayToThursday = mondayToFriday.length === 5 && mondayToFriday.slice(0, 4).every(d => selectedDates.has(d))
      
      if (hasMondayToThursday) {
        const allAvailable = mondayToFriday.every(d => data[d]?.status !== 'reserved')
        if (!allAvailable) return
        const blockIsSelected = mondayToFriday.every(d => selectedDates.has(d))
        if (blockIsSelected) {
          mondayToFriday.forEach(d => newDates.delete(d))
        } else {
          mondayToFriday.forEach(d => {
            if (data[d]?.status !== 'reserved') newDates.add(d)
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
    if (!selectedDates.has(date)) return null

    if (hasMondayToSunday(selectedDates)) {
      const info = getBlockInfo('mondayToSunday')
      return info ? Math.round(info.pricePerDay) : null
    }

    const y = date.slice(0, 4)
    if ((date === y + '-03-23' || date === y + '-03-24') && selectedDates.has(y + '-03-23') && selectedDates.has(y + '-03-24')) {
      return null
    }
    
    if (hasTuesdayToSunday(selectedDates)) {
      const dayOfWeek = getDayOfWeek(date)
      if (dayOfWeek >= 2 && dayOfWeek <= 5) return 100000
      if (dayOfWeek === 6 || dayOfWeek === 0) return 125000
    }
    
    const dayOfWeek = getDayOfWeek(date)
    
    const mondayToFriday = getMondayToFridayDates(date)
    if (mondayToFriday.length === 5 && mondayToFriday.every(d => selectedDates.has(d))) {
      const fridayToSunday = getBlockDates(date)
      const isPartOfFridayToSunday = fridayToSunday.every(d => selectedDates.has(d))
      if (!isPartOfFridayToSunday || dayOfWeek < 5) {
        const info = getBlockInfo('mondayToFriday')
        return info ? Math.round(info.pricePerDay) : null
      }
    }
    
    if (dayOfWeek === 5) {
      const fridayToSunday = getBlockDates(date)
      if (fridayToSunday.every(d => selectedDates.has(d))) {
        const isPartOfMondayToFriday = mondayToFriday.length === 5 && mondayToFriday.every(d => selectedDates.has(d))
        if (!isPartOfMondayToFriday) {
          return 125000
        }
      }
    }
    
    if (isMonday(date)) return null
    
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
    
    if (hasMondayToSunday(selectedDates)) {
      const mondayToSunday = getMondayToSundayDates(sortedDates[0])
      return [{
        dates: mondayToSunday,
        info: getBlockInfo('mondayToSunday')
      }]
    }
    
    if (hasTuesdayToSunday(selectedDates)) {
      const tuesdayToSunday = getTuesdayToSundayDates(sortedDates.find(d => !isMonday(d)) || sortedDates[0])
      return [{
        dates: tuesdayToSunday,
        info: getBlockInfo('tuesdayToSunday')
      }]
    }
    
    for (const date of sortedDates) {
      if (processedDates.has(date)) continue
      const dayOfWeek = getDayOfWeek(date)

      if (date === '2026-03-23' || date === '2026-03-24' || date === '2025-03-23' || date === '2025-03-24') {
        const year = date.slice(0, 4)
        const feriadoBlock = [year + '-03-23', year + '-03-24']
        if (feriadoBlock.every(d => selectedDates.has(d)) && !processedDates.has(feriadoBlock[0])) {
          blocks.push({
            dates: feriadoBlock,
            info: getBlockInfo('feriado23y24Marzo')
          })
          feriadoBlock.forEach(d => processedDates.add(d))
          continue
        }
      }
      
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        const mondayToFriday = getMondayToFridayDates(date)
        if (mondayToFriday.length === 5) {
          const blockComplete = mondayToFriday.every(d => selectedDates.has(d))
          if (blockComplete && !processedDates.has(mondayToFriday[0])) {
            blocks.push({
              dates: mondayToFriday,
              info: getBlockInfo('mondayToFriday')
            })
            mondayToFriday.forEach(d => processedDates.add(d))
            continue
          }
        }
      }
      
      if (dayOfWeek === 5) {
        const fridayToSunday = getBlockDates(date)
        const blockComplete = fridayToSunday.every(d => selectedDates.has(d))
        const mondayToFriday = getMondayToFridayDates(date)
        const isPartOfMondayToFriday = mondayToFriday.length === 5 && mondayToFriday.every(d => selectedDates.has(d))
        
        if (blockComplete && !isPartOfMondayToFriday && !processedDates.has(fridayToSunday[0])) {
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

          return (
            <div
              key={date}
              onClick={() => !isReserved && handleDayClick(date)}
              className={`
                aspect-square border-2 rounded-lg p-2 flex flex-col items-center justify-center
                transition-all
                ${isReserved
                  ? 'bg-gray-200 border-gray-300 line-through cursor-not-allowed opacity-50' 
                  : isInquiry
                  ? 'bg-orange-100 border-orange-300 cursor-pointer'
                  : isSelected
                  ? 'bg-blue-500 border-blue-600 text-white font-bold scale-105 shadow-lg cursor-pointer'
                  : 'bg-green-100 border-green-300 hover:bg-green-200 cursor-pointer'
                }
              `}
            >
              <div className={`text-lg font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                {day}
              </div>
              {isSelected && (() => {
                const y = date.slice(0, 4)
                const isFeriadoMarzo = (date === y + '-03-23' || date === y + '-03-24') &&
                  selectedDates.has(y + '-03-23') && selectedDates.has(y + '-03-24')
                if (isFeriadoMarzo) {
                  const info = getBlockInfo('feriado23y24Marzo')
                  return (
                    <div className="text-xs mt-1 text-white/90 text-center font-medium">
                      Feriado ${info?.price.toLocaleString('es-AR') ?? '125.000'}
                    </div>
                  )
                }
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
          <li>• <strong>Lunes a Viernes:</strong> Hacé clic en lunes, martes, miércoles o jueves y se seleccionan los 5 días</li>
          <li>• <strong>Viernes a Domingo:</strong> Hacé clic en viernes (sin tener lunes–jueves seleccionados) y se seleccionan los 3 días</li>
          <li>• <strong>Sábado y Domingo:</strong> Hacé clic en sábado o domingo y se seleccionan ambos días</li>
          <li>• <strong>23 y 24 de marzo:</strong> Feriado elegible — hacé clic en el 23 o el 24 y se seleccionan los 2 días ($125.000)</li>
          <li>• <strong>Lunes a Domingo:</strong> Si seleccionás los 7 días (lunes a domingo), aplica el bloque semanal completo (7 días)</li>
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
