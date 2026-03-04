import { NextRequest, NextResponse } from 'next/server';
import { fetchMovieFromOMDb } from '@/lib/omdb';
import { fetchCastFromTMDb, fetchMovieIdFromTMDb, fetchReviewsFromTMDb } from '@/lib/tmdb';
import { validateIMDbId } from '@/utils/validate';
import { createApiResponse } from '@/lib/api';
import { initRateLimit, getClientIp, getRateLimitKey } from '@/lib/rateLimit';
import { getUsableReviews } from '@/utils/reviewFallback';

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimitKey = getRateLimitKey(clientIp, '/api/movie');

    if (!initRateLimit(rateLimitKey, 20, 60000)) {
      return NextResponse.json(
        createApiResponse(false, 429, undefined, 'Rate limit exceeded. Maximum 20 requests per minute.'),
        { status: 429 }
      );
    }

    // Get query parameter
    const { searchParams } = new URL(request.url);
    const imdbId = searchParams.get('imdbId');
    const normalizedImdbId = imdbId?.trim().toLowerCase();

    // Validate input
    if (!normalizedImdbId || !validateIMDbId(normalizedImdbId)) {
      return NextResponse.json(
        createApiResponse(false, 400, undefined, 'Invalid IMDb ID. Must start with "tt" followed by 7-9 digits.'),
        { status: 400 }
      );
    }

    // Fetch movie data from OMDb
    const movie = await fetchMovieFromOMDb(normalizedImdbId);

    if (!movie) {
      return NextResponse.json(
        createApiResponse(false, 404, undefined, 'Movie not found. Please check the IMDb ID.'),
        { status: 404 }
      );
    }

    // Fetch TMDB data and apply fallback review generation when TMDB has no reviews.
    try {
      const tmdbId = await fetchMovieIdFromTMDb(normalizedImdbId);
      if (tmdbId) {
        const [reviews, tmdbCast] = await Promise.all([
          fetchReviewsFromTMDb(tmdbId),
          fetchCastFromTMDb(tmdbId)
        ]);

        movie.reviews = getUsableReviews(reviews, movie);
        movie.cast = Array.from(new Set([...movie.cast, ...tmdbCast])).slice(0, 15);
      } else {
        movie.reviews = getUsableReviews([], movie);
      }
    } catch (error) {
      console.error('Error fetching TMDB data:', error);
      movie.reviews = getUsableReviews([], movie);
    }

    return NextResponse.json(
      createApiResponse(true, 200, movie),
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error in /api/movie:', errorMessage);

    return NextResponse.json(
      createApiResponse(false, 500, undefined, 'Failed to fetch movie data. Please try again.'),
      { status: 500 }
    );
  }
}
