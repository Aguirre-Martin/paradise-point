// Price configuration
// Update these values according to your actual rates

export const PRICES = {
  mondayToFriday: 500000,      // Monday to Friday (5 days)
  fridayToSunday: 375000,        // Friday to Sunday (3 days)
  weekend: 250000,               // Saturday and Sunday (2 days)
  /** @deprecated Use mondayToSunday or Lunes a Viernes + weekend. Kept for calendar block detection. */
  tuesdayToSunday: 650000,        // Tuesday to Sunday (6 days - deprecated in UI)
  mondayToSunday: 750000,        // Monday to Sunday (7 days - full week + 100000)
  navidad: 450000,               // December 24 and 25
  finAnio: 450000,               // December 31 and January 1
  carnaval: 500000,              // Carnival dates (adjust according to year)
  feriado23y24Marzo: 125000      // March 23 and 24 (2 days block)
}

// Special dates - update according to year
// Format: 'YYYY-MM-DD': 'type'
export const SPECIAL_DATES = {
  // Christmas 2025
  '2025-12-24': 'navidad',
  '2025-12-25': 'navidad',
  
  // New Year 2025/2026
  '2025-12-31': 'finAnio',
  '2026-01-01': 'finAnio',
  
  // Add carnival dates according to year
  '2026-02-14': 'carnaval',
  '2026-02-15': 'carnaval',
  '2026-02-16': 'carnaval',
  '2026-02-17': 'carnaval',
  // March 23 and 24 (feriado elegible)
  '2026-03-23': 'feriado23y24Marzo',
  '2026-03-24': 'feriado23y24Marzo',
}

// Helper to parse date consistently (avoid timezone issues)
function parseDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

// Helper function to get day of week from date
export function getDayOfWeek(dateStr) {
  return parseDate(dateStr).getDay()
}

// Helper function to check if a day is Monday (not available)
export function isMonday(dateStr) {
  return getDayOfWeek(dateStr) === 1 // 1 = Monday
}

// Helper function to get price for an individual date
// Note: For more accurate calculations, use calculatePriceForRange or detectBlockType
export function getPriceForDate(dateStr) {
  // Mondays are not available (cleaning day)
  if (isMonday(dateStr)) {
    return 0
  }
  
  if (SPECIAL_DATES[dateStr]) {
    const key = SPECIAL_DATES[dateStr]
    if (key === 'feriado23y24Marzo') return PRICES[key] / 2
    return PRICES[key]
  }
  
  const dayOfWeek = getDayOfWeek(dateStr)
  
  // 0 = Sunday, 6 = Saturday
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return PRICES.weekend / 2 // Approximate price per day
  }
  
  // Monday to Friday (1-5) - approximate price per day
  if (dayOfWeek >= 1 && dayOfWeek <= 5) {
    return PRICES.mondayToFriday / 5
  }
  
  // Fallback (should not reach here)
  return 0
}

// Function to calculate price for a date range
// Considers special rules like long weekend and full week
export function calculatePriceForRange(dates) {
  if (!dates || dates.length === 0) return 0
  
  const sortedDates = Array.from(dates).sort()
  const sortedDatesNoMonday = sortedDates.filter(d => !isMonday(d))
  if (sortedDates.length === 0) return 0

  const startDate = parseDate(sortedDates[0])
  const endDate = parseDate(sortedDates[sortedDates.length - 1])
  const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
  const startDayOfWeek = startDate.getDay()
  const endDayOfWeek = endDate.getDay()

  // Monday to Sunday (7 days)
  if (daysDiff === 7 && startDayOfWeek === 1 && endDayOfWeek === 0 && sortedDates.length === 7) {
    return PRICES.mondayToSunday
  }

  if (sortedDatesNoMonday.length === 0) return 0

  // Tuesday to Sunday (6 days)
  const firstNoMon = sortedDatesNoMonday[0]
  const lastNoMon = sortedDatesNoMonday[sortedDatesNoMonday.length - 1]
  const daysDiffNoMon = Math.ceil((parseDate(lastNoMon) - parseDate(firstNoMon)) / (1000 * 60 * 60 * 24)) + 1
  if (daysDiffNoMon === 6 && getDayOfWeek(firstNoMon) === 2 && getDayOfWeek(lastNoMon) === 0 && sortedDatesNoMonday.length === 6) {
    return PRICES.tuesdayToSunday
  }
  
  // Monday to Friday (5 days)
  if (sortedDates.length === 5) {
    const first = parseDate(sortedDates[0])
    const last = parseDate(sortedDates[4])
    if (first.getDay() === 1 && last.getDay() === 5) {
      return PRICES.mondayToFriday
    }
  }

  // Friday to Sunday (3 days)
  if (sortedDatesNoMonday.length === 3) {
    const first = parseDate(sortedDatesNoMonday[0])
    const last = parseDate(sortedDatesNoMonday[2])
    if (first.getDay() === 5 && last.getDay() === 0) {
      return PRICES.fridayToSunday
    }
  }

  // Saturday and Sunday (2 days)
  if (sortedDatesNoMonday.length === 2) {
    const d0 = getDayOfWeek(sortedDatesNoMonday[0])
    const d1 = getDayOfWeek(sortedDatesNoMonday[1])
    if ((d0 === 6 && d1 === 0) || (d0 === 0 && d1 === 6)) {
      return PRICES.weekend
    }
  }

  // March 23 and 24 (feriado block - 2 days, 125000)
  if (sortedDates.length === 2) {
    const key = sortedDates[0] + ',' + sortedDates[1]
    if (key === '2026-03-23,2026-03-24' || key === '2025-03-23,2025-03-24') {
      return PRICES.feriado23y24Marzo
    }
  }

  // If no special rule applies, calculate day by day
  let total = 0
  sortedDates.forEach(dateStr => {
    if (!isMonday(dateStr)) {
      total += getPriceForDate(dateStr)
    }
  })
  
  return total
}

// Helper function to check if it's weekend
export function isWeekend(dateStr) {
  const dayOfWeek = getDayOfWeek(dateStr)
  return dayOfWeek === 0 || dayOfWeek === 6
}

// Helper function to get all dates of a block
// This function returns the "default" block when a day is clicked
// Smart combination logic is handled in CalendarBooking
export function getBlockDates(dateStr, selectedDates = new Set()) {
  const dayOfWeek = getDayOfWeek(dateStr)
  const date = parseDate(dateStr)
  const dates = []
  
  // Block: March 23 and 24 (feriado)
  if (dateStr === '2026-03-23' || dateStr === '2026-03-24' || dateStr === '2025-03-23' || dateStr === '2025-03-24') {
    const year = dateStr.slice(0, 4)
    return [year + '-03-23', year + '-03-24']
  }

  // Block: Monday, Tuesday, Wednesday, Thursday (1-4) → Monday to Friday
  if (dayOfWeek >= 1 && dayOfWeek <= 4) {
    const monday = new Date(date)
    monday.setDate(date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    for (let i = 0; i < 5; i++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      dates.push(d.toISOString().split('T')[0])
    }
  }
  // Block: Friday (5) → Friday to Sunday (default)
  // If Mon-Thu already selected, CalendarBooking extends to Mon-Fri
  else if (dayOfWeek === 5) {
    // Friday to Sunday (3 days)
    for (let i = 0; i < 3; i++) {
      const d = new Date(date)
      d.setDate(date.getDate() + i)
      dates.push(d.toISOString().split('T')[0])
    }
  }
  // Block: Saturday and Sunday (6, 0)
  else if (dayOfWeek === 6) {
    // Saturday and Sunday
    dates.push(dateStr)
    const sunday = new Date(date)
    sunday.setDate(date.getDate() + 1)
    dates.push(sunday.toISOString().split('T')[0])
  }
  else if (dayOfWeek === 0) {
    // If Sunday is clicked, select Saturday and Sunday
    const saturday = new Date(date)
    saturday.setDate(date.getDate() - 1)
    dates.push(saturday.toISOString().split('T')[0])
    dates.push(dateStr)
  }
  
  return dates
}

// Function to get dates for "Monday to Friday" block (5 days)
export function getMondayToFridayDates(dateStr) {
  const dayOfWeek = getDayOfWeek(dateStr)
  const date = parseDate(dateStr)
  const dates = []
  if (dayOfWeek >= 1 && dayOfWeek <= 5) {
    const monday = new Date(date)
    monday.setDate(date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    for (let i = 0; i < 5; i++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      dates.push(d.toISOString().split('T')[0])
    }
  }
  return dates
}

// Function to get dates for "Saturday and Sunday" block
export function getWeekendDates(dateStr) {
  const dayOfWeek = getDayOfWeek(dateStr)
  const date = parseDate(dateStr)
  const dates = []
  
  if (dayOfWeek === 6) {
    // Saturday
    dates.push(dateStr)
    const sunday = new Date(date)
    sunday.setDate(date.getDate() + 1)
    dates.push(sunday.toISOString().split('T')[0])
  } else if (dayOfWeek === 0) {
    // Sunday
    const saturday = new Date(date)
    saturday.setDate(date.getDate() - 1)
    dates.push(saturday.toISOString().split('T')[0])
    dates.push(dateStr)
  }
  
  return dates
}

// Function to get dates for "Tuesday to Sunday" block (6 days)
export function getTuesdayToSundayDates(dateStr) {
  const dayOfWeek = getDayOfWeek(dateStr)
  const date = parseDate(dateStr)
  const dates = []
  
  if (dayOfWeek >= 2) {
    const tuesday = new Date(date)
    tuesday.setDate(date.getDate() - (dayOfWeek - 2))
    for (let i = 0; i < 6; i++) {
      const d = new Date(tuesday)
      d.setDate(tuesday.getDate() + i)
      dates.push(d.toISOString().split('T')[0])
    }
  } else if (dayOfWeek === 0) {
    const tuesday = new Date(date)
    tuesday.setDate(date.getDate() - 5)
    for (let i = 0; i < 6; i++) {
      const d = new Date(tuesday)
      d.setDate(tuesday.getDate() + i)
      dates.push(d.toISOString().split('T')[0])
    }
  }
  
  return dates
}

// Function to get dates for "Monday to Sunday" block (7 days)
export function getMondayToSundayDates(dateStr) {
  const dayOfWeek = getDayOfWeek(dateStr)
  const date = parseDate(dateStr)
  const dates = []
  const monday = new Date(date)
  monday.setDate(date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}

// Function to calculate price for a block
// This function now needs to know what type of block it is
export function getBlockPrice(blockType) {
  switch (blockType) {
    case 'mondayToFriday':
      return PRICES.mondayToFriday
    case 'fridayToSunday':
      return PRICES.fridayToSunday
    case 'weekend':
      return PRICES.weekend
    case 'tuesdayToSunday':
      return PRICES.tuesdayToSunday
    case 'mondayToSunday':
      return PRICES.mondayToSunday
    case 'feriado23y24Marzo':
      return PRICES.feriado23y24Marzo
    default:
      return 0
  }
}

// Function to detect block type based on selected dates
export function detectBlockType(dates) {
  if (!dates || dates.size === 0) return null
  
  const sortedDates = Array.from(dates).sort()
  const firstDay = sortedDates.length > 0 ? getDayOfWeek(sortedDates[0]) : null
  const lastDay = sortedDates.length > 0 ? getDayOfWeek(sortedDates[sortedDates.length - 1]) : null

  // Monday to Sunday (7 days)
  if (sortedDates.length === 7 && firstDay === 1 && lastDay === 0) {
    return 'mondayToSunday'
  }

  // Monday to Friday (5 days)
  if (sortedDates.length === 5 && firstDay === 1 && lastDay === 5) {
    return 'mondayToFriday'
  }

  const sortedNoMonday = sortedDates.filter(d => !isMonday(d))
  if (sortedNoMonday.length === 0) return null

  const firstDate = sortedNoMonday[0]
  const lastDate = sortedNoMonday[sortedNoMonday.length - 1]
  const firstDayNoMon = getDayOfWeek(firstDate)
  const lastDayNoMon = getDayOfWeek(lastDate)
  
  // Tuesday to Sunday (6 days) - deprecated
  if (sortedNoMonday.length === 6 && firstDayNoMon === 2 && lastDayNoMon === 0) {
    return 'tuesdayToSunday'
  }
  
  // Friday to Sunday (3 days)
  if (sortedNoMonday.length === 3 && firstDayNoMon === 5 && lastDayNoMon === 0) {
    return 'fridayToSunday'
  }
  
  // Saturday and Sunday (2 days)
  if (sortedNoMonday.length === 2 && ((firstDayNoMon === 6 && lastDayNoMon === 0) || (firstDayNoMon === 0 && lastDayNoMon === 6))) {
    return 'weekend'
  }

  // March 23 and 24 (feriado)
  if (sortedDates.length === 2) {
    const key = sortedDates[0] + ',' + sortedDates[1]
    if (key === '2026-03-23,2026-03-24' || key === '2025-03-23,2025-03-24') {
      return 'feriado23y24Marzo'
    }
  }
  
  return null
}

// Function to get detailed information about a block
export function getBlockInfo(blockType) {
  switch (blockType) {
    case 'mondayToFriday':
      return { name: 'Lunes a Viernes', days: 5, price: PRICES.mondayToFriday, pricePerDay: PRICES.mondayToFriday / 5 }
    case 'fridayToSunday':
      return { name: 'Friday to Sunday', days: 3, price: PRICES.fridayToSunday, pricePerDay: 0 }
    case 'weekend':
      return { name: 'Saturday and Sunday', days: 2, price: PRICES.weekend, pricePerDay: PRICES.weekend / 2 }
    case 'tuesdayToSunday':
      return { name: 'Tuesday to Sunday', days: 6, price: PRICES.tuesdayToSunday, pricePerDay: PRICES.tuesdayToSunday / 6 }
    case 'mondayToSunday':
      return { name: 'Lunes a Domingo', days: 7, price: PRICES.mondayToSunday, pricePerDay: PRICES.mondayToSunday / 7 }
    case 'feriado23y24Marzo':
      return { name: '23 y 24 de marzo', days: 2, price: PRICES.feriado23y24Marzo, pricePerDay: PRICES.feriado23y24Marzo / 2 }
    default:
      return null
  }
}
