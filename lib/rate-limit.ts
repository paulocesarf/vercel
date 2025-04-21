interface RateLimitData {
  count: number;
  lastReset: number;
}

const rateLimitMap = new Map<string, RateLimitData>();

interface RateLimitResult {
  success: boolean;
  remaining?: number;
}

export async function rateLimit(
  identifier: string,
  { max = 5, windowMs = 60_000 }: { max?: number; windowMs?: number }
): Promise<RateLimitResult> {
  const now = Date.now();
  const existingData = rateLimitMap.get(identifier);

  if (!existingData || now - existingData.lastReset > windowMs) {
    rateLimitMap.set(identifier, {
      count: 1,
      lastReset: now
    });
    return { success: true, remaining: max - 1 };
  }

  if (existingData.count < max) {
    existingData.count += 1;
    rateLimitMap.set(identifier, existingData);
    return { success: true, remaining: max - existingData.count };
  }

  return { success: false, remaining: 0 };
}

// Limpeza periódica
if (typeof window === 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitMap.entries()) {
      if (now - value.lastReset > 3600000) { // 1 hora
        rateLimitMap.delete(key);
      }
    }
  }, 300000); // 5 minutos
}