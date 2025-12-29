// Price configuration
// Update these values according to your actual rates

export const PRICES = {
  tuesdayToFriday: 400000,      // Tuesday to Friday (4 days)
  fridayToSunday: 375000,        // Friday to Sunday (3 days)
  weekend: 250000,               // Saturday and Sunday (2 days)
  tuesdayToSunday: 650000,        // Tuesday to Sunday (6 days - full week)
  navidad: 450000,               // December 24 and 25
  finAnio: 450000,               // December 31 and January 1
  carnaval: 500000               // Carnival dates (adjust according to year)
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
  
  // First check if it's a special date
  if (SPECIAL_DATES[dateStr]) {
    return PRICES[SPECIAL_DATES[dateStr]]
  }
  
  const dayOfWeek = getDayOfWeek(dateStr)
  
  // 0 = Sunday, 6 = Saturday
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return PRICES.weekend / 2 // Approximate price per day
  }
  
  // Tuesday to Friday (2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday)
  // Note: This price per day is approximate, actual calculation is done by blocks
  if (dayOfWeek >= 2 && dayOfWeek <= 5) {
    return PRICES.tuesdayToFriday / 4 // Approximate price per day
  }
  
  // Fallback (should not reach here)
  return 0
}

// Function to calculate price for a date range
// Considers special rules like long weekend and full week
export function calculatePriceForRange(dates) {
  if (!dates || dates.length === 0) return 0
  
  const sortedDates = Array.from(dates).sort().filter(d => !isMonday(d))
  if (sortedDates.length === 0) return 0
  
  // Parse dates correctly to avoid timezone issues
  const [startYear, startMonth, startDay] = sortedDates[0].split('-').map(Number)
  const startDate = parseDate(sortedDates[0])
  
  const [endYear, endMonth, endDay] = sortedDates[sortedDates.length - 1].split('-').map(Number)
  const endDate = parseDate(sortedDates[sortedDates.length - 1])
  
  // Calculate days difference
  const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
  const startDayOfWeek = startDate.getDay()
  const endDayOfWeek = endDate.getDay()
  
  // Check if it's full week (Tuesday to Sunday, 6 days)
  // Tuesday = 2, Sunday = 0
  // Note: Mondays are not available, so full week is Tuesday to Sunday
  if (daysDiff === 6 && startDayOfWeek === 2 && endDayOfWeek === 0 && sortedDates.length === 6) {
    return PRICES.tuesdayToSunday
  }
  
  // Check if it's Tuesday to Friday (4 days)
  if (daysDiff === 4 && startDayOfWeek === 2 && endDayOfWeek === 5 && sortedDates.length === 4) {
    return PRICES.tuesdayToFriday
  }
  
  // Check if it's long weekend (Friday to Sunday, 3 days)
  // Friday = 5, Sunday = 0
  if (daysDiff === 3 && startDayOfWeek === 5 && endDayOfWeek === 0 && sortedDates.length === 3) {
    return PRICES.fridayToSunday
  }
  
  // Check if it's Saturday and Sunday (2 days)
  if (daysDiff === 2 && ((startDayOfWeek === 6 && endDayOfWeek === 0) || (startDayOfWeek === 0 && endDayOfWeek === 6)) && sortedDates.length === 2) {
    return PRICES.weekend
  }
  
  // If no special rule applies, calculate day by day
  let total = 0
  sortedDates.forEach(dateStr => {
    // Filter out Mondays (not charged)
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
  
  // Block: Tuesday, Wednesday, Thursday (2, 3, 4) → Tuesday to Friday
  if (dayOfWeek >= 2 && dayOfWeek <= 4) {
    // Find Tuesday of that week
    const tuesday = new Date(date)
    tuesday.setDate(date.getDate() - (dayOfWeek - 2))
    // Tuesday to Friday (4 days)
    for (let i = 0; i < 4; i++) {
      const d = new Date(tuesday)
      d.setDate(tuesday.getDate() + i)
      dates.push(d.toISOString().split('T')[0])
    }
  }
  // Block: Friday (5) → Friday to Sunday (default)
  // But if Tuesday-Thursday are already selected, it's handled in CalendarBooking
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

// Function to get dates for "Tuesday to Friday" block
export function getTuesdayToFridayDates(dateStr) {
  const dayOfWeek = getDayOfWeek(dateStr)
  const date = parseDate(dateStr)
  const dates = []
  
  if (dayOfWeek >= 2 && dayOfWeek <= 5) {
    // Find Tuesday of that week
    const tuesday = new Date(date)
    tuesday.setDate(date.getDate() - (dayOfWeek - 2))
    // Tuesday to Friday (4 days)
    for (let i = 0; i < 4; i++) {
      const d = new Date(tuesday)
      d.setDate(tuesday.getDate() + i)
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

// Function to get dates for "Tuesday to Sunday" block (full week)
export function getTuesdayToSundayDates(dateStr) {
  const dayOfWeek = getDayOfWeek(dateStr)
  const date = parseDate(dateStr)
  const dates = []
  
  if (dayOfWeek >= 2) {
    // Find Tuesday of that week
    const tuesday = new Date(date)
    tuesday.setDate(date.getDate() - (dayOfWeek - 2))
    // Tuesday to Sunday (6 days, no Monday)
    for (let i = 0; i < 6; i++) {
      const d = new Date(tuesday)
      d.setDate(tuesday.getDate() + i)
      dates.push(d.toISOString().split('T')[0])
    }
  } else if (dayOfWeek === 0) {
    // If it's Sunday, go back 5 days to reach Tuesday
    const tuesday = new Date(date)
    tuesday.setDate(date.getDate() - 5)
    // Tuesday to Sunday (6 days)
    for (let i = 0; i < 6; i++) {
      const d = new Date(tuesday)
      d.setDate(tuesday.getDate() + i)
      dates.push(d.toISOString().split('T')[0])
    }
  }
  
  return dates
}

// Function to calculate price for a block
// This function now needs to know what type of block it is
export function getBlockPrice(blockType) {
  switch (blockType) {
    case 'tuesdayToFriday':
      return PRICES.tuesdayToFriday
    case 'fridayToSunday':
      return PRICES.fridayToSunday
    case 'weekend':
      return PRICES.weekend
    case 'tuesdayToSunday':
      return PRICES.tuesdayToSunday
    default:
      return 0
  }
}

// Function to detect block type based on selected dates
export function detectBlockType(dates) {
  if (!dates || dates.size === 0) return null
  
  const sortedDates = Array.from(dates).sort().filter(d => !isMonday(d))
  if (sortedDates.length === 0) return null
  
  const firstDate = sortedDates[0]
  const lastDate = sortedDates[sortedDates.length - 1]
  const firstDay = getDayOfWeek(firstDate)
  const lastDay = getDayOfWeek(lastDate)
  
  // Tuesday to Sunday (6 days)
  if (sortedDates.length === 6 && firstDay === 2 && lastDay === 0) {
    return 'tuesdayToSunday'
  }
  
  // Tuesday to Friday (4 days)
  if (sortedDates.length === 4 && firstDay === 2 && lastDay === 5) {
    return 'tuesdayToFriday'
  }
  
  // Friday to Sunday (3 days)
  if (sortedDates.length === 3 && firstDay === 5 && lastDay === 0) {
    return 'fridayToSunday'
  }
  
  // Saturday and Sunday (2 days)
  if (sortedDates.length === 2 && ((firstDay === 6 && lastDay === 0) || (firstDay === 0 && lastDay === 6))) {
    return 'weekend'
  }
  
  return null
}

// Function to get detailed information about a block
export function getBlockInfo(blockType) {
  switch (blockType) {
    case 'tuesdayToFriday':
      return { name: 'Tuesday to Friday', days: 4, price: PRICES.tuesdayToFriday, pricePerDay: PRICES.tuesdayToFriday / 4 }
    case 'fridayToSunday':
      return { name: 'Friday to Sunday', days: 3, price: PRICES.fridayToSunday, pricePerDay: 0 }
    case 'weekend':
      return { name: 'Saturday and Sunday', days: 2, price: PRICES.weekend, pricePerDay: PRICES.weekend / 2 }
    case 'tuesdayToSunday':
      return { name: 'Tuesday to Sunday', days: 6, price: PRICES.tuesdayToSunday, pricePerDay: PRICES.tuesdayToSunday / 6 }
    default:
      return null
  }
}
