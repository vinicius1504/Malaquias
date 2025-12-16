import { handlers } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit'

const { GET: originalGET, POST: originalPOST } = handlers

export const GET = originalGET

// POST com rate limiting para prevenir força bruta
export async function POST(request: NextRequest) {
  const ip = getClientIP(request)
  const rateLimitResult = checkRateLimit(`auth:${ip}`, RATE_LIMITS.login)

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Muitas tentativas. Tente novamente em 1 minuto.' },
      {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Remaining': '0',
        },
      }
    )
  }

  return originalPOST(request)
}
