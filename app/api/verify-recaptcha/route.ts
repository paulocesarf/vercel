import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  const { token } = req.body

  if (!token) {
    return res.status(400).json({ success: false, error: 'No token provided' })
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=6LdX8x4rAAAAADsHR60ZSEBrloFIowG2XYL00DZ-&response=${token}`,
    })

    const data = await response.json()
    return res.status(200).json(data)
  } catch (error) {
    console.error('reCAPTCHA verification error:', error)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}