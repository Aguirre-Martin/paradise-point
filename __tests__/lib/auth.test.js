/**
 * Tests for authentication utilities
 */

import jwt from 'jsonwebtoken'

// Mock environment variables
const TEST_SECRET = 'test-secret-key-for-testing-only'
process.env.JWT_SECRET = TEST_SECRET

describe('Authentication Utils', () => {
  // Import after setting env var
  const { generateToken, verifyToken } = require('@/lib/auth')
  
  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const payload = { id: 1, email: 'test@example.com', role: 'admin' }
      const token = generateToken(payload)
      
      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')
      
      // Verify the token contains the payload
      const decoded = jwt.verify(token, TEST_SECRET)
      expect(decoded.id).toBe(payload.id)
      expect(decoded.email).toBe(payload.email)
      expect(decoded.role).toBe(payload.role)
    })

    it('should generate tokens with expiration', () => {
      const payload = { id: 1, email: 'test@example.com' }
      const token = generateToken(payload)
      
      const decoded = jwt.verify(token, TEST_SECRET)
      expect(decoded.exp).toBeTruthy()
      expect(decoded.exp).toBeGreaterThan(Date.now() / 1000)
    })
  })

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const payload = { id: 1, email: 'test@example.com', role: 'user' }
      const token = generateToken(payload)
      
      const decoded = verifyToken(token)
      expect(decoded).toBeTruthy()
      expect(decoded.id).toBe(payload.id)
      expect(decoded.email).toBe(payload.email)
    })

    it('should return null for invalid token', () => {
      const decoded = verifyToken('invalid-token')
      expect(decoded).toBeNull()
    })

    it('should return null for expired token', () => {
      const payload = { id: 1, email: 'test@example.com' }
      const expiredToken = jwt.sign(payload, TEST_SECRET, { expiresIn: '-1s' })
      
      const decoded = verifyToken(expiredToken)
      expect(decoded).toBeNull()
    })
  })
})

