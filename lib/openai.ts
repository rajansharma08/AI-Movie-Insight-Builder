import { SentimentAnalysis } from '@/types/movie';
import { classifySentiment } from '@/utils/sentimentHelper';

interface OpenAIMessage {
  role: 'system' | 'user';
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const MODEL_CANDIDATES = ['gpt-4o-mini', 'gpt-3.5-turbo'];
const STOP_WORDS = new Set([
  'the', 'and', 'that', 'this', 'with', 'from', 'were', 'been', 'have', 'has', 'had',
  'for', 'about', 'into', 'while', 'there', 'their', 'they', 'them', 'very', 'more',
  'most', 'some', 'many', 'much', 'film', 'movie', 'audience', 'overall', 'review',
  'reviews', 'reaction', 'reactions', 'felt', 'feel', 'like', 'just', 'also', 'than',
  'because', 'would', 'could', 'should', 'story', 'plot'
]);

function parseSentimentJson(content: string): SentimentAnalysis {
  let parsed: Partial<SentimentAnalysis> | null = null;

  try {
    parsed = JSON.parse(content) as Partial<SentimentAnalysis>;
  } catch {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('OpenAI returned non-JSON content');
    }
    parsed = JSON.parse(jsonMatch[0]) as Partial<SentimentAnalysis>;
  }

  const aiSummary = typeof parsed.aiSummary === 'string'
    ? parsed.aiSummary.trim()
    : '';
  const sentiment = parsed.sentiment;

  if (!aiSummary || (sentiment !== 'Positive' && sentiment !== 'Mixed' && sentiment !== 'Negative')) {
    throw new Error('OpenAI returned invalid sentiment payload');
  }

  return {
    aiSummary,
    sentiment,
    source: 'openai'
  };
}

function pickOne<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function getTopThemes(reviews: string[]): string[] {
  const counts = new Map<string, number>();

  reviews
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 4 && !STOP_WORDS.has(word))
    .forEach(word => {
      counts.set(word, (counts.get(word) || 0) + 1);
    });

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([word]) => word);
}

function getEvidenceSnippet(reviews: string[]): string {
  const candidate = (reviews.find(review => review.length > 40) || reviews[0] || '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!candidate) {
    return 'No representative audience excerpt available.';
  }

  const firstSentenceMatch = candidate.match(/^(.{20,220}?[.!?])(\s|$)/);
  if (firstSentenceMatch) {
    return firstSentenceMatch[1].trim();
  }

  if (candidate.length <= 140) {
    return candidate;
  }

  const cut = candidate.slice(0, 140);
  const lastSpace = cut.lastIndexOf(' ');
  const safeCut = lastSpace > 0 ? cut.slice(0, lastSpace) : cut;
  return `${safeCut.trim()}...`;
}

function buildLocalFallback(reviews: string[]): SentimentAnalysis {
  const combined = reviews.join(' ').toLowerCase();
  let sentiment = classifySentiment(combined);

  // Synthetic fallback reviews include explicit tone cues; honor them first.
  if (
    combined.includes('mostly negative') ||
    combined.includes('trends mostly negative') ||
    combined.includes('not fully satisfied') ||
    combined.includes('weaker audience reception')
  ) {
    sentiment = 'Negative';
  } else if (
    combined.includes('trends clearly positive') ||
    combined.includes('mostly favorable') ||
    combined.includes('strong audience approval')
  ) {
    sentiment = 'Positive';
  } else if (
    combined.includes('audience sentiment trends mixed') ||
    combined.includes('reactions appear divided')
  ) {
    sentiment = 'Mixed';
  }

  const [themeA, themeB] = getTopThemes(reviews);
  const themeText = [themeA, themeB].filter(Boolean).join(' and ');
  const snippet = getEvidenceSnippet(reviews);

  const positiveLead = pickOne([
    'Audience sentiment is clearly positive across most available comments.',
    'Most viewer reactions are favorable, indicating strong reception.',
    'The response trends positive, with broad appreciation in audience feedback.'
  ]);
  const negativeLead = pickOne([
    'Audience sentiment is mostly negative across the collected reactions.',
    'Viewer feedback trends critical, with more concerns than praise.',
    'The response leans negative based on recurring complaints in reviews.'
  ]);
  const mixedLead = pickOne([
    'Audience sentiment appears mixed, with praise and criticism both present.',
    'Viewer opinion is divided, showing a balanced split of positive and negative remarks.',
    'Overall reception is mixed rather than strongly one-sided.'
  ]);

  const positiveTail = themeText
    ? `Positive comments frequently mention ${themeText}. Representative feedback: "${snippet}".`
    : `Representative feedback: "${snippet}".`;
  const negativeTail = themeText
    ? `Critical feedback repeatedly points to ${themeText}. Representative feedback: "${snippet}".`
    : `Representative feedback: "${snippet}".`;
  const mixedTail = themeText
    ? `Discussion often centers on ${themeText}, with contrasting takes in comments. Representative feedback: "${snippet}".`
    : `Representative feedback: "${snippet}".`;

  const aiSummary = sentiment === 'Positive'
    ? `${positiveLead} ${positiveTail}`
    : sentiment === 'Negative'
      ? `${negativeLead} ${negativeTail}`
      : `${mixedLead} ${mixedTail}`;

  return { aiSummary, sentiment, source: 'fallback' };
}

function tryReadErrorCode(raw: string): string | null {
  try {
    const parsed = JSON.parse(raw) as { error?: { code?: string } };
    return parsed.error?.code || null;
  } catch {
    return null;
  }
}

export async function analyzeSentimentWithAI(reviews: string[]): Promise<SentimentAnalysis> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  if (reviews.length === 0) {
    throw new Error('No reviews available for analysis');
  }

  // Merge and truncate reviews to prevent token overflow
  const mergedReviews = reviews
    .map(review => review.trim())
    .join('\n\n')
    .substring(0, 3000);

  const messages: OpenAIMessage[] = [
    {
      role: 'system',
      content: 'You are a film critic AI assistant.'
    },
    {
      role: 'user',
      content: `Analyze the audience reviews below.

Tasks:
1. Write a short 2-3 sentence summary of audience sentiment.
2. Classify the overall sentiment as:
Positive
Mixed
Negative

Return JSON with this exact shape:
{
  "aiSummary": "string",
  "sentiment": "Positive" | "Mixed" | "Negative"
}

Reviews:
${mergedReviews}`
    }
  ];

  for (const model of MODEL_CANDIDATES) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
        max_tokens: 300,
        response_format: { type: 'json_object' }
      })
    });

    if (response.ok) {
      try {
        const data: OpenAIResponse = await response.json();
        const content = data.choices[0]?.message?.content || '';
        return parseSentimentJson(content);
      } catch (error) {
        console.error(`OpenAI parsing error on model ${model}:`, error);
      }
    } else {
      const errorData = await response.text();
      console.error(`OpenAI API error on model ${model}:`, errorData);

      const errorCode = tryReadErrorCode(errorData);
      if (errorCode === 'insufficient_quota') {
        // Quota errors won't recover by switching models in the same account.
        break;
      }
    }
  }

  // Graceful fallback keeps sentiment section usable even when OpenAI is unavailable.
  return buildLocalFallback(reviews);
}
