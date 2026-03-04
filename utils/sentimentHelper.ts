export function classifySentiment(text: string): 'Positive' | 'Mixed' | 'Negative' {
  const lowerText = text.toLowerCase();

  const positiveKeywords = [
    'exceptional', 'brilliant', 'outstanding', 'excellent', 'masterpiece',
    'love', 'loved', 'amazing', 'fantastic', 'wonderful', 'great',
    'beautiful', 'stunning', 'perfect', 'superb', 'compelling',
    'recommend', 'recommended', 'best', 'gem', 'deserves', 'triumph'
  ];

  const negativeKeywords = [
    'terrible', 'awful', 'horrible', 'worst', 'disappointing',
    'boring', 'waste', 'bad', 'poor', 'mediocre', 'dull',
    'unwatchable', 'disliked', 'flop', 'disaster', 'pathetic',
    'wouldn\'t recommend', 'avoid', 'cringe', 'lacks', 'fails'
  ];

  let positiveScore = 0;
  let negativeScore = 0;

  positiveKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const matches = lowerText.match(regex);
    positiveScore += matches ? matches.length : 0;
  });

  negativeKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const matches = lowerText.match(regex);
    negativeScore += matches ? matches.length : 0;
  });

  if (positiveScore === 0 && negativeScore === 0) {
    return 'Mixed';
  }

  if (positiveScore > negativeScore * 1.5) {
    return 'Positive';
  }

  if (negativeScore > positiveScore * 1.5) {
    return 'Negative';
  }

  return 'Mixed';
}

export function getSentimentColor(sentiment: 'Positive' | 'Mixed' | 'Negative'): string {
  switch (sentiment) {
    case 'Positive':
      return 'bg-green-500';
    case 'Negative':
      return 'bg-red-500';
    case 'Mixed':
    default:
      return 'bg-yellow-500';
  }
}

export function getSentimentBgColor(sentiment: 'Positive' | 'Mixed' | 'Negative'): string {
  switch (sentiment) {
    case 'Positive':
      return 'bg-green-500';
    case 'Negative':
      return 'bg-red-500';
    case 'Mixed':
    default:
      return 'bg-yellow-500';
  }
}

export function getSentimentBorderColor(sentiment: 'Positive' | 'Mixed' | 'Negative'): string {
  switch (sentiment) {
    case 'Positive':
      return 'border-green-500';
    case 'Negative':
      return 'border-red-500';
    case 'Mixed':
    default:
      return 'border-yellow-500';
  }
}

export function getSentimentTextColor(sentiment: 'Positive' | 'Mixed' | 'Negative'): string {
  switch (sentiment) {
    case 'Positive':
      return 'text-green-300';
    case 'Negative':
      return 'text-red-300';
    case 'Mixed':
    default:
      return 'text-yellow-300';
  }
}
