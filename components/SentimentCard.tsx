'use client';

import { SentimentAnalysis } from '@/types/movie';
import { motion } from 'framer-motion';

interface SentimentCardProps {
  analysis: SentimentAnalysis;
}

export default function SentimentCard({ analysis }: SentimentCardProps) {
  const sentimentStyles = analysis.sentiment === 'Positive'
    ? {
        badge: 'bg-green-500 text-white',
        dot: 'bg-green-400',
        label: 'text-green-300',
        summaryBg: 'bg-green-50/10',
        summaryBorder: 'border-green-500'
      }
    : analysis.sentiment === 'Negative'
      ? {
          badge: 'bg-red-500 text-white',
          dot: 'bg-red-400',
          label: 'text-red-300',
          summaryBg: 'bg-red-50/10',
          summaryBorder: 'border-red-500'
        }
      : {
          badge: 'bg-yellow-500 text-white',
          dot: 'bg-yellow-400',
          label: 'text-yellow-300',
          summaryBg: 'bg-yellow-50/10',
          summaryBorder: 'border-yellow-500'
        };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="w-full bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 rounded-2xl p-8 shadow-2xl"
    >
      <motion.h3
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.35 }}
        className="text-2xl font-bold text-white mb-4"
      >
        AI Sentiment Analysis
      </motion.h3>

      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.25 }}
        className="mb-4"
      >
        <span className="px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-white/10 text-gray-200 border border-white/20">
          {analysis.source === 'fallback' ? 'Fallback Analysis' : 'AI Analysis'}
        </span>
      </motion.div>

      {/* Sentiment Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.35 }}
        className="mb-6 flex items-center gap-3"
      >
        <span className={`px-6 py-3 rounded-full font-bold text-lg shadow-lg ${sentimentStyles.badge}`}>
          {analysis.sentiment}
        </span>
        <motion.div
          animate={{ scale: [1, 1.16, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className={`w-4 h-4 rounded-full ${sentimentStyles.dot}`}
        />
        <span className={`text-sm font-semibold tracking-wide ${sentimentStyles.label}`}>
          {analysis.sentiment} Sentiment
        </span>
      </motion.div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24, duration: 0.35 }}
        className={`${sentimentStyles.summaryBg} border-l-4 ${sentimentStyles.summaryBorder} rounded-lg p-4`}
      >
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="text-white leading-relaxed font-medium"
        >
          {analysis.aiSummary}
        </motion.p>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32, duration: 0.3 }}
        className="text-gray-400 text-sm mt-4"
      >
        {analysis.source === 'fallback'
          ? 'Based on heuristic analysis of available audience signals'
          : 'Based on audience reviews analysis'}
      </motion.p>
    </motion.div>
  );
}
