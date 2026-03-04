import { Movie } from '@/types/movie';

interface OMDbResponse {
  Title: string;
  Year: string;
  Poster: string;
  imdbRating: string;
  Plot: string;
  Actors: string;
  Ratings?: Array<{
    Source: string;
    Value: string;
  }>;
  Response: string;
  Error?: string;
}

export async function fetchMovieFromOMDb(imdbId: string): Promise<Movie | null> {
  if (!process.env.OMDB_API_KEY) {
    throw new Error('OMDB_API_KEY is not configured');
  }

  try {
    const url = new URL('https://www.omdbapi.com/');
    url.searchParams.set('apikey', process.env.OMDB_API_KEY);
    url.searchParams.set('i', imdbId);
    url.searchParams.set('type', 'movie');
    url.searchParams.set('plot', 'full');

    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error(`OMDb API error: ${response.status}`);
    }

    const data: OMDbResponse = await response.json();

    if (data.Response === 'False' || data.Error) {
      return null;
    }

    const cast = data.Actors
      ? data.Actors.split(',').map(actor => actor.trim())
      : [];
    const rottenTomatoesRating = data.Ratings?.find(
      rating => rating.Source === 'Rotten Tomatoes'
    )?.Value;

    return {
      title: data.Title || 'Unknown Title',
      poster: data.Poster && data.Poster !== 'N/A' ? data.Poster : '/placeholder.svg',
      year: data.Year || 'Unknown Year',
      rating: data.imdbRating ? `${data.imdbRating}/10` : 'N/A',
      imdbRatingValue: data.imdbRating && data.imdbRating !== 'N/A' ? data.imdbRating : undefined,
      rottenTomatoesRating: rottenTomatoesRating && rottenTomatoesRating !== 'N/A'
        ? rottenTomatoesRating
        : undefined,
      plot: data.Plot || 'No plot available',
      cast,
      reviews: [] // Will be populated by TMDB
    };
  } catch (error) {
    console.error('Error fetching from OMDb:', error);
    throw error;
  }
}
