'use client';

import { useEffect, useState } from 'react';
import { Movie } from '@/types/movie';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface MovieCardProps {
  movie: Movie;
}

const FALLBACK_POSTER = '/placeholder.svg';

export default function MovieCard({ movie }: MovieCardProps) {
  const [posterSrc, setPosterSrc] = useState(movie.poster || FALLBACK_POSTER);
  const [posterFailed, setPosterFailed] = useState(false);
  const [expandedPlot, setExpandedPlot] = useState(false);
  const maxPlotLength = 220;
  const shouldTruncatePlot = movie.plot.length > maxPlotLength;
  const visiblePlot = shouldTruncatePlot && !expandedPlot
    ? `${movie.plot.slice(0, maxPlotLength).trimEnd()}...`
    : movie.plot;

  useEffect(() => {
    setPosterSrc(movie.poster || FALLBACK_POSTER);
    setPosterFailed(false);
    setExpandedPlot(false);
  }, [movie.poster, movie.plot, movie.title]);

  const handlePosterError = () => {
    if (posterSrc !== FALLBACK_POSTER) {
      setPosterSrc(FALLBACK_POSTER);
      return;
    }

    // Stop retry loop if fallback image also fails.
    setPosterFailed(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 rounded-2xl overflow-hidden shadow-2xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {/* Poster */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="flex justify-center items-start"
        >
          <div className="relative w-40 h-56 rounded-lg overflow-hidden shadow-lg">
            {posterFailed ? (
              <div className="w-full h-full bg-slate-700/70 flex items-center justify-center">
                <span className="text-xs tracking-wide text-gray-200 font-semibold">
                  No Poster
                </span>
              </div>
            ) : (
              <Image
                key={posterSrc}
                src={posterSrc}
                alt={movie.title}
                fill
                className="object-cover"
                onError={handlePosterError}
              />
            )}
          </div>
        </motion.div>

        {/* Movie Details */}
        <div className="col-span-1 md:col-span-2 flex flex-col justify-between">
          <div>
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-white mb-2"
            >
              {movie.title}
            </motion.h2>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex gap-4 mb-4"
            >
              <div className="px-4 py-2 bg-secondary rounded-lg">
                <p className="text-white font-semibold">{movie.year}</p>
              </div>
              <div className="px-4 py-2 bg-accent rounded-lg">
                <p className="text-white font-semibold">★ {movie.rating}</p>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-200 mb-4 leading-relaxed"
            >
              {visiblePlot}
            </motion.p>

            {shouldTruncatePlot && (
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setExpandedPlot(prev => !prev)}
                className="mb-4 text-sm font-semibold text-secondary underline underline-offset-4"
              >
                {expandedPlot ? 'Show less' : 'Read more'}
              </motion.button>
            )}
          </div>

          {/* Cast */}
          {movie.cast.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-gray-300 font-semibold mb-2">Cast:</p>
              <div className="flex flex-wrap gap-2">
                {movie.cast.map((actor, index) => (
                  <motion.span
                    key={actor}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-white text-sm hover:bg-opacity-30 transition-all"
                  >
                    {actor}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
