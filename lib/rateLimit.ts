import { RateLimitState } from '@/types/movie';

const rateLimitStore = new Map<string, RateLimitState>();

export function initRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const limit = rateLimitStore.get(key);

  if (!limit) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    });
    return true;
  }

  if (now > limit.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    });
    return true;
  }

  if (limit.count >= maxRequests) {
    return false;
  }

  limit.count++;
  return true;
}

export function getRateLimitKey(ip: string | null, path: string): string {
  return `${ip || 'anonymous'}-${path}`;
}

export function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0];
  }
  return request.headers.get('x-real-ip') || 'anonymous';
}
