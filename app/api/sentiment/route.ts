import { NextRequest, NextResponse } from 'next/server';
import { analyzeSentimentWithAI } from '@/lib/openai';
import { createApiResponse } from '@/lib/api';
import { initRateLimit, getClientIp, getRateLimitKey } from '@/lib/rateLimit';
import { SentimentAnalysis } from '@/types/movie';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimitKey = getRateLimitKey(clientIp, '/api/sentiment');

    if (!initRateLimit(rateLimitKey, 15, 60000)) {
      return NextResponse.json(
        createApiResponse(false, 429, undefined, 'Rate limit exceeded. Maximum 15 requests per minute.'),
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { reviews } = body;

    // Validate input
    if (!Array.isArray(reviews)) {
      return NextResponse.json(
        createApiResponse(false, 400, undefined, 'Invalid request. Reviews must be an array.'),
        { status: 400 }
      );
    }

    // Filter and validate reviews
    const validReviews = reviews
      .filter(review => typeof review === 'string' && review.trim().length > 0)
      .map(review => review.trim())
      .slice(0, 20); // Limit to top 20 reviews

    if (validReviews.length === 0) {
      return NextResponse.json(
        createApiResponse(false, 400, undefined, 'Reviews list is empty. Provide at least one review.'),
        { status: 400 }
      );
    }

    // Analyze sentiment
    const analysis = await analyzeSentimentWithAI(validReviews);

    return NextResponse.json(
      createApiResponse(true, 200, analysis as SentimentAnalysis),
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error in /api/sentiment:', errorMessage);

    const friendlyError = errorMessage === 'OPENAI_ANALYSIS_FAILED'
      ? 'Sentiment AI service is temporarily unavailable. Please try again.'
      : 'Failed to analyze sentiment. Please try again.';

    return NextResponse.json(
      createApiResponse(false, 500, undefined, friendlyError),
      { status: 500 }
    );
  }
}
