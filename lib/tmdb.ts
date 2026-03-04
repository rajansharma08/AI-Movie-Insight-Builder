interface TMDbSearchResponse {
  movie_results?: Array<{
    id: number;
  }>;
  results?: Array<{
    id: number;
  }>;
}

interface TMDbReviewsResponse {
  results: Array<{
    content: string;
  }>;
}

interface TMDbCreditsResponse {
  cast?: Array<{
    name: string;
    order?: number;
  }>;
}

function getTMDbAuthParams(url: URL): HeadersInit | undefined {
  const tmdbKey = process.env.TMDB_API_KEY;

  if (!tmdbKey) {
    throw new Error('TMDB_API_KEY is not configured');
  }

  // Support both TMDB v3 API keys and v4 read-access tokens from env.
  if (tmdbKey.startsWith('eyJ')) {
    return {
      Authorization: `Bearer ${tmdbKey}`,
      accept: 'application/json'
    };
  }

  url.searchParams.set('api_key', tmdbKey);
  return undefined;
}

export async function fetchMovieIdFromTMDb(imdbId: string): Promise<number | null> {
  try {
    const url = new URL('https://api.themoviedb.org/3/find/' + imdbId);
    url.searchParams.set('external_source', 'imdb_id');
    const headers = getTMDbAuthParams(url);

    const response = await fetch(url.toString(), {
      headers,
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data: TMDbSearchResponse = await response.json();

    const movieResults = data.movie_results || data.results || [];

    if (movieResults.length === 0) {
      return null;
    }

    return movieResults[0].id;
  } catch (error) {
    console.error('Error fetching movie ID from TMDB:', error);
    throw error;
  }
}

export async function fetchReviewsFromTMDb(tmdbId: number): Promise<string[]> {
  try {
    const url = new URL(`https://api.themoviedb.org/3/movie/${tmdbId}/reviews`);
    url.searchParams.set('language', 'en-US');
    url.searchParams.set('page', '1');
    const headers = getTMDbAuthParams(url);

    const response = await fetch(url.toString(), {
      headers,
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error(`TMDB Reviews API error: ${response.status}`);
    }

    const data: TMDbReviewsResponse = await response.json();

    if (!data.results || data.results.length === 0) {
      return [];
    }

    // Extract top 20 reviews and limit length
    return data.results
      .slice(0, 20)
      .map(review => review.content.substring(0, 1000))
      .filter(content => content.length > 50);
  } catch (error) {
    console.error('Error fetching reviews from TMDB:', error);
    return [];
  }
}

export async function fetchCastFromTMDb(tmdbId: number): Promise<string[]> {
  try {
    const url = new URL(`https://api.themoviedb.org/3/movie/${tmdbId}/credits`);
    url.searchParams.set('language', 'en-US');
    const headers = getTMDbAuthParams(url);

    const response = await fetch(url.toString(), {
      headers,
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error(`TMDB Credits API error: ${response.status}`);
    }

    const data: TMDbCreditsResponse = await response.json();

    if (!data.cast || data.cast.length === 0) {
      return [];
    }

    return data.cast
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
      .slice(0, 12)
      .map(member => member.name.trim())
      .filter(Boolean);
  } catch (error) {
    console.error('Error fetching cast from TMDB:', error);
    return [];
  }
}
