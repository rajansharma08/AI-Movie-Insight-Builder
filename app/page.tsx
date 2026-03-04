'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchForm from '@/components/SearchForm';
import MovieCard from '@/components/MovieCard';
import SentimentCard from '@/components/SentimentCard';
import Loader from '@/components/Loader';
import ErrorMessage from '@/components/ErrorMessage';
import { Movie, SentimentAnalysis } from '@/types/movie';

function getFriendlyMovieError(status: number, apiError?: string): string {
  if (status === 400) {
    return 'Please enter a valid IMDb ID like tt0133093.';
  }
  if (status === 404) {
    return 'Movie not found. Check the IMDb ID and try again.';
  }
  if (status === 429) {
    return 'Too many requests right now. Please wait a minute and retry.';
  }
  return apiError || 'Something went wrong while fetching movie details.';
}

function getFriendlySentimentError(status: number, apiError?: string): string {
  if (status === 400) {
    return 'Insufficient public review data for this title. Please try another movie IMDb ID.';
  }
  if (status === 429) {
    return 'Too many sentiment requests. Please wait a minute and retry.';
  }
  return apiError || 'Sentiment analysis is temporarily unavailable.';
}

export default function Home() {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [sentiment, setSentiment] = useState<SentimentAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (imdbId: string) => {
    setLoading(true);
    setError('');
    setMovie(null);
    setSentiment(null);

    try {
      // Fetch movie data
      const movieResponse = await fetch(`/api/movie?imdbId=${imdbId}`);
      const moviePayload = await movieResponse.json();

      if (!movieResponse.ok) {
        throw new Error(getFriendlyMovieError(movieResponse.status, moviePayload.error));
      }

      const movieData = moviePayload;

      if (!movieData.success) {
        throw new Error(movieData.error || 'Failed to fetch movie data');
      }

      const fetchedMovie: Movie = movieData.data;
      setMovie(fetchedMovie);

      const sentimentResponse = await fetch('/api/sentiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reviews: fetchedMovie.reviews })
      });
      const sentimentData = await sentimentResponse.json();

      if (!sentimentResponse.ok) {
        setSentiment({
          aiSummary: getFriendlySentimentError(sentimentResponse.status, sentimentData.error),
          sentiment: 'Mixed',
          source: 'fallback'
        });
        return;
      }

      if (sentimentData.success) {
        setSentiment(sentimentData.data);
      } else {
        setSentiment({
          aiSummary: getFriendlySentimentError(500, sentimentData.error),
          sentiment: 'Mixed',
          source: 'fallback'
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="pt-8 md:pt-16 pb-8 text-center relative z-10"
      >
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-2 tracking-tight">
          AI Movie Insight
        </h1>
        <p className="text-gray-300 text-lg md:text-xl">
          Discover what audiences really think
        </p>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 px-4 md:px-8 pb-16 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Search Form */}
          <SearchForm onSubmit={handleSearch} isLoading={loading} />

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-8"
              >
                <ErrorMessage
                  message={error}
                  onDismiss={() => setError('')}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading State */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-12"
              >
                <Loader message="Analyzing movie and reviews..." />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Section */}
          <AnimatePresence>
            {movie && !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-12 space-y-8"
              >
                <MovieCard movie={movie} />
                {sentiment && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.45, delay: 0.1 }}
                  >
                    <SentimentCard analysis={sentiment} />
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty State */}
          {!movie && !loading && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-16 text-center"
            >
              <p className="text-gray-400 text-lg">
                Enter an IMDb ID to get started
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="py-6 text-center text-gray-400 text-sm border-t border-white border-opacity-10 relative z-10"
      >
        <p>
          Powered by OpenAI, OMDb, and TMDB | © 2024 AI Movie Insight Builder
        </p>
      </motion.footer>
    </div>
  );
}
