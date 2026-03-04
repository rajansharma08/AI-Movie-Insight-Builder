import { buildSyntheticReviews, getUsableReviews } from '@/utils/reviewFallback';
import { Movie } from '@/types/movie';

function createMovie(overrides: Partial<Movie> = {}): Movie {
  return {
    title: 'Test Movie',
    poster: '/placeholder.svg',
    year: '2024',
    rating: 'N/A',
    plot: 'A tense and emotional story about friendship and redemption.',
    cast: ['Actor A'],
    reviews: [],
    ...overrides
  };
}

describe('reviewFallback utilities', () => {
  it('returns TMDB reviews when available', () => {
    const movie = createMovie();
    const tmdbReviews = [
      'This movie was compelling, emotional, and very well paced from start to finish.',
      'Strong performances and excellent direction made this a memorable watch.'
    ];

    const result = getUsableReviews(tmdbReviews, movie);
    expect(result).toHaveLength(2);
    expect(result[0]).toContain('compelling');
  });

  it('generates synthetic reviews when TMDB reviews are missing but signals exist', () => {
    const movie = createMovie({
      imdbRatingValue: '8.1',
      rottenTomatoesRating: '78%'
    });

    const result = getUsableReviews([], movie);
    expect(result.length).toBeGreaterThanOrEqual(5);
  });

  it('does not generate synthetic reviews when no useful public signals exist', () => {
    const movie = createMovie({
      plot: 'N/A',
      imdbRatingValue: undefined,
      rottenTomatoesRating: undefined
    });

    const result = getUsableReviews([], movie);
    expect(result).toEqual([]);
  });

  it('buildSyntheticReviews avoids literal N/A rating strings in generated text', () => {
    const movie = createMovie({
      plot: 'A grounded drama about conflict and reconciliation.',
      imdbRatingValue: undefined,
      rottenTomatoesRating: undefined
    });

    const generated = buildSyntheticReviews(movie);
    expect(generated.join(' ')).not.toContain('N/A');
  });
});
