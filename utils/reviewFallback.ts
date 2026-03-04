import { Movie } from '@/types/movie';

const DEFAULT_IMDB_RATING = 'N/A';
const DEFAULT_RT_RATING = 'N/A';
const DEFAULT_PLOT = 'The story gives audiences a mix of emotion, tension, and character-driven moments.';

function normalizeReview(review: string): string {
  return review
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 1000);
}

type ReviewTone = 'Positive' | 'Mixed' | 'Negative';

function parseImdbRating(imdbRating: string): number | null {
  const parsed = Number.parseFloat(imdbRating);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseRtRating(rtRating: string): number | null {
  const match = rtRating.match(/(\d{1,3})%/);
  if (!match) return null;
  const parsed = Number.parseInt(match[1], 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function inferToneFromPlot(plot: string): ReviewTone {
  const text = plot.toLowerCase();
  const positiveHints = ['uplifting', 'inspiring', 'heartwarming', 'triumph', 'hope', 'love'];
  const negativeHints = ['dark', 'tragic', 'revenge', 'betrayal', 'loss', 'violent', 'horror'];

  const positiveCount = positiveHints.filter(word => text.includes(word)).length;
  const negativeCount = negativeHints.filter(word => text.includes(word)).length;

  if (positiveCount > negativeCount + 1) return 'Positive';
  if (negativeCount > positiveCount + 1) return 'Negative';
  return 'Mixed';
}

function decideTone(imdbRating: string, rtRating: string, plot: string): ReviewTone {
  const imdb = parseImdbRating(imdbRating);
  const rt = parseRtRating(rtRating);

  if (imdb !== null && rt !== null) {
    if (imdb >= 7.2 && rt >= 70) return 'Positive';
    if (imdb <= 5.0 || rt <= 35) return 'Negative';
    return 'Mixed';
  }

  if (imdb !== null) {
    if (imdb >= 7.2) return 'Positive';
    if (imdb <= 5.0) return 'Negative';
    return 'Mixed';
  }

  if (rt !== null) {
    if (rt >= 70) return 'Positive';
    if (rt <= 35) return 'Negative';
    return 'Mixed';
  }

  return inferToneFromPlot(plot);
}

export function buildSyntheticReviews(movie: Movie): string[] {
  const imdbRating = movie.imdbRatingValue || DEFAULT_IMDB_RATING;
  const rottenTomatoesRating = movie.rottenTomatoesRating || DEFAULT_RT_RATING;
  const plot = movie.plot && movie.plot !== 'No plot available' ? movie.plot : DEFAULT_PLOT;
  const tone = decideTone(imdbRating, rottenTomatoesRating, plot);
  const hasImdb = imdbRating !== DEFAULT_IMDB_RATING;
  const hasRt = rottenTomatoesRating !== DEFAULT_RT_RATING;

  const generated =
    tone === 'Positive'
      ? [
          hasImdb
            ? `The film holds an IMDb rating of ${imdbRating}, suggesting strong audience approval for its overall execution.`
            : 'Audience reactions suggest a generally favorable response to the film overall.',
          hasRt
            ? `With Rotten Tomatoes around ${rottenTomatoesRating}, viewers generally praise the storytelling and emotional payoff.`
            : 'Viewers generally praise the storytelling and emotional payoff.',
          `A common reaction highlights this core premise: ${plot}`,
          'Many viewers call the performances engaging and the overall experience memorable.',
          'Most audience comments are favorable, with only minor criticism about pacing in a few sections.',
          'Overall, audience sentiment trends clearly positive.'
        ]
      : tone === 'Negative'
        ? [
            hasImdb
              ? `The IMDb rating of ${imdbRating} indicates many viewers were not fully satisfied with the film.`
              : 'Audience reactions indicate many viewers were not fully satisfied with the film.',
            hasRt
              ? `Rotten Tomatoes around ${rottenTomatoesRating} also suggests weaker audience reception.`
              : 'Overall audience reception appears weaker than expected.',
            `Comments often discuss the premise (${plot}) but note that execution felt uneven.`,
            'Viewers frequently mention pacing and character depth as key weaknesses.',
            'A smaller group still appreciated the concept, but many reviews remain critical overall.',
            'Overall, audience sentiment trends mostly negative.'
          ]
        : [
            hasImdb
              ? `The IMDb rating of ${imdbRating} suggests a mixed response from audiences.`
              : 'Audience reactions suggest a mixed response overall.',
            hasRt
              ? `With Rotten Tomatoes around ${rottenTomatoesRating}, reactions appear divided rather than one-sided.`
              : 'Reactions appear divided rather than one-sided.',
            `Audience discussion often focuses on the premise: ${plot}`,
            'Many viewers liked parts of the film while others felt the pacing and payoff were inconsistent.',
            'Positive comments about performances are balanced by criticism of execution in some sections.',
            'Overall, audience sentiment trends mixed.'
          ];

  return generated.map(normalizeReview).slice(0, 6);
}

export function getUsableReviews(tmdbReviews: string[], movie: Movie): string[] {
  const cleanedTmdbReviews = tmdbReviews
    .map(normalizeReview)
    .filter(review => review.length >= 50)
    .slice(0, 20);

  if (cleanedTmdbReviews.length > 0) {
    return cleanedTmdbReviews;
  }

  const hasPlotSignal = Boolean(movie.plot && movie.plot !== 'N/A' && movie.plot !== 'No plot available');
  const hasRatingSignal = Boolean(movie.imdbRatingValue || movie.rottenTomatoesRating);

  // If the title has no public rating/plot signal, avoid inventing audience reviews.
  if (!hasPlotSignal && !hasRatingSignal) {
    return [];
  }

  // TMDB reviews can be missing for less-popular titles; synthetic reviews keep sentiment analysis path active.
  return buildSyntheticReviews(movie).slice(0, 5);
}
