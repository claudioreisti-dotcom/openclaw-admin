const requests = new Map<string, { count: number; reset: number }>()

export function rateLimit(
  ip: string,
  limit = 60,
  windowMs = 60_000
): { success: boolean; remaining: number } {
  const now = Date.now()
  const entry = requests.get(ip)

  if (!entry || now > entry.reset) {
    requests.set(ip, { count: 1, reset: now + windowMs })
    return { success: true, remaining: limit - 1 }
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0 }
  }

  entry.count++
  return { success: true, remaining: limit - entry.count }
}
