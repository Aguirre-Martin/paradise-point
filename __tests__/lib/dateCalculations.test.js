/**
 * Tests for reservation date calculations
 */

describe('Reservation Date Calculations', () => {
  // This function should match the one in app/admin/reservas/page.jsx
  const calculateDays = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0
    
    try {
      const checkInStr = typeof checkIn === 'string' ? checkIn.split('T')[0] : checkIn
      const checkOutStr = typeof checkOut === 'string' ? checkOut.split('T')[0] : checkOut
      
      const start = new Date(checkInStr + 'T12:00:00')
      const end = new Date(checkOutStr + 'T12:00:00')
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0
      
      const diffTime = end - start
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1
      return diffDays > 0 ? diffDays : 0
    } catch (error) {
      return 0
    }
  }

  describe('calculateDays', () => {
    it('should calculate correct days for 5-day reservation (Jan 12-16)', () => {
      const days = calculateDays('2026-01-12', '2026-01-16')
      expect(days).toBe(5)
    })

    it('should calculate correct days for 1-day reservation', () => {
      const days = calculateDays('2026-01-15', '2026-01-15')
      expect(days).toBe(1)
    })

    it('should calculate correct days for 7-day week', () => {
      const days = calculateDays('2026-01-01', '2026-01-07')
      expect(days).toBe(7)
    })

    it('should handle ISO date strings with time', () => {
      const days = calculateDays('2026-01-12T00:00:00.000Z', '2026-01-16T00:00:00.000Z')
      expect(days).toBe(5)
    })

    it('should return 0 for missing check-in', () => {
      const days = calculateDays(null, '2026-01-16')
      expect(days).toBe(0)
    })

    it('should return 0 for missing check-out', () => {
      const days = calculateDays('2026-01-12', null)
      expect(days).toBe(0)
    })

    it('should return 0 for invalid dates', () => {
      const days = calculateDays('invalid-date', '2026-01-16')
      expect(days).toBe(0)
    })

    it('should return 0 for checkout before checkin', () => {
      const days = calculateDays('2026-01-16', '2026-01-12')
      expect(days).toBe(0)
    })

    it('should handle dates across month boundaries', () => {
      const days = calculateDays('2026-01-30', '2026-02-03')
      expect(days).toBe(5)
    })

    it('should handle dates across year boundaries', () => {
      const days = calculateDays('2025-12-30', '2026-01-03')
      expect(days).toBe(5)
    })
  })
})

