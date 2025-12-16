/**
 * Rate Limiter simples para APIs
 * Usa memória em desenvolvimento e pode ser adaptado para Redis em produção
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

// Store em memória (para produção, considere usar Redis ou Vercel KV)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Limpa entradas expiradas a cada 5 minutos
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key)
      }
    }
  }, 5 * 60 * 1000)
}

interface RateLimitOptions {
  limit: number // Número máximo de requisições
  windowMs: number // Janela de tempo em milissegundos
}

interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
}

/**
 * Verifica rate limit para um identificador (IP, usuário, etc)
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { limit: 100, windowMs: 60 * 1000 }
): RateLimitResult {
  const now = Date.now()
  const key = identifier

  let entry = rateLimitStore.get(key)

  // Se não existe ou expirou, cria nova entrada
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 1,
      resetTime: now + options.windowMs,
    }
    rateLimitStore.set(key, entry)
    return {
      success: true,
      remaining: options.limit - 1,
      resetTime: entry.resetTime,
    }
  }

  // Incrementa contador
  entry.count++
  rateLimitStore.set(key, entry)

  // Verifica se excedeu limite
  if (entry.count > options.limit) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
    }
  }

  return {
    success: true,
    remaining: options.limit - entry.count,
    resetTime: entry.resetTime,
  }
}

/**
 * Rate limits pré-configurados para diferentes endpoints
 */
export const RATE_LIMITS = {
  // Login: 5 tentativas por minuto por IP
  login: { limit: 5, windowMs: 60 * 1000 },

  // APIs de admin: 60 requisições por minuto
  admin: { limit: 60, windowMs: 60 * 1000 },

  // Upload: 10 arquivos por minuto
  upload: { limit: 10, windowMs: 60 * 1000 },

  // Tradução com IA: 10 por minuto (evita custo excessivo)
  translate: { limit: 10, windowMs: 60 * 1000 },

  // APIs públicas: 100 por minuto
  public: { limit: 100, windowMs: 60 * 1000 },
}

/**
 * Helper para obter IP do request
 */
export function getClientIP(request: Request): string {
  // Vercel/Cloudflare headers
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  // Fallback
  return 'unknown'
}
