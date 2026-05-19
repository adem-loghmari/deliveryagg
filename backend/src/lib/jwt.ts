import jwt from 'jsonwebtoken'
import { config } from '../config'

interface Payload {
  userId: string
  role: string
  businessId?: string
}

export function signToken(payload: Payload): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn } as jwt.SignOptions)
}

export function verifyToken(token: string): Payload {
  return jwt.verify(token, config.jwtSecret) as Payload
}
