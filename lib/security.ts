// lib/security.ts
import CryptoJS from 'crypto-js'

const SECRET = process.env.CSRF_SECRET || 'your-32-character-secret'

export const encrypt = (text: string) => {
  return CryptoJS.AES.encrypt(text, SECRET).toString()
}

export const decrypt = (ciphertext: string) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET)
    return bytes.toString(CryptoJS.enc.Utf8)
  } catch {
    return null
  }
}