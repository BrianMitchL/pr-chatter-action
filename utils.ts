import Sentiment from 'sentiment';
const sentiment = new Sentiment();

export function randomInArray<T extends any>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

interface FindKeywordParams {
  state: 'approved' | 'changes_requested';
  body: string;
  fallbackApprove: string;
  fallbackChangesRequested: string;
}

export function findKeyword({
  state,
  body,
  fallbackApprove,
  fallbackChangesRequested,
}: FindKeywordParams): string {
  const analysis = sentiment.analyze(body);

  const random = Math.random();

  // 5% rickroll
  if (random < 0.05) {
    return 'rickroll';
  }

  // 25% a top trending GIF
  if (random < 0.3) {
    return '';
  }

  // lean towards negativity for changes_requested
  if (state === 'changes_requested') {
    // if the sentiment is negative, use a negative word
    if (analysis.comparative < 0 && analysis.negative.length > 0) {
      return randomInArray(analysis.negative);
    }
    // if it's positive, use a positive word
    if (analysis.comparative > 0 && analysis.positive.length > 0) {
      return randomInArray(analysis.positive);
    }
    // if it's exactly neutral, use any word
    if (analysis.words.length > 0) {
      return randomInArray(analysis.words);
    }
    // if no words match, use a fallback word
    return fallbackChangesRequested;
  } else {
    // if the sentiment is positive, use a positive word
    if (analysis.comparative > 0 && analysis.positive.length > 0) {
      return randomInArray(analysis.positive);
    }
    // if not a positive sentiment, use a fallback word
    return fallbackApprove;
  }
}
