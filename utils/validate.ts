export function validateIMDbId(id: string): boolean {
  if (typeof id !== 'string') {
    return false;
  }
  const imdbIdRegex = /^tt\d{7,9}$/i;
  return imdbIdRegex.test(id.trim());
}

export function validateApiKeys(): { valid: boolean; missingKeys: string[] } {
  const missingKeys: string[] = [];

  if (!process.env.OMDB_API_KEY) {
    missingKeys.push('OMDB_API_KEY');
  }
  if (!process.env.TMDB_API_KEY) {
    missingKeys.push('TMDB_API_KEY');
  }
  if (!process.env.OPENAI_API_KEY) {
    missingKeys.push('OPENAI_API_KEY');
  }

  return {
    valid: missingKeys.length === 0,
    missingKeys
  };
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength).trim() + '...';
}

export function normalizeReviewText(review: string): string {
  return review
    .trim()
    .replace(/\s+/g, ' ')
    .substring(0, 500);
}
