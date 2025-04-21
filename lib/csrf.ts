// lib/csrf.ts
import { v4 as uuidv4 } from 'uuid'
import pino from 'pino'

const logger = pino()
const csrfTokens = new Map<string, { expiresAt: number }>()

export const createCsrfToken = () => {
  const token = uuidv4()
  const expiresAt = Date.now() + 15 * 60 * 1000 // 15 minutes
  
  csrfTokens.set(token, { expiresAt })
  logger.debug({ token, expiresAt }, 'CSRF token created')
  
  return token
}

export const validateCsrfToken = (token: string) => {
  logger.debug({ receivedToken: token }, 'Validating CSRF token')
  
  if (!token) {
    logger.warn('No CSRF token provided')
    return false
  }

  const storedToken = csrfTokens.get(token)
  
  if (!storedToken) {
    logger.warn('CSRF token not found in store')
    logger.debug('Current tokens:', Array.from(csrfTokens.keys()))
    return false
  }

  if (Date.now() > storedToken.expiresAt) {
    csrfTokens.delete(token)
    logger.warn('Expired CSRF token')
    return false
  }

  csrfTokens.delete(token)
  logger.debug('CSRF token validated successfully')
  return true
}