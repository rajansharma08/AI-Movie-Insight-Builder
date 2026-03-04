export interface Movie {
  title: string;
  poster: string;
  year: string;
  rating: string;
  imdbRatingValue?: string;
  rottenTomatoesRating?: string;
  plot: string;
  cast: string[];
  reviews: string[];
}

export interface SentimentAnalysis {
  aiSummary: string;
  sentiment: 'Positive' | 'Mixed' | 'Negative';
  source?: 'openai' | 'fallback';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}

export interface RateLimitState {
  count: number;
  resetTime: number;
}
