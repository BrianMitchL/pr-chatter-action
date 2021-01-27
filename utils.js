const Sentiment = require('sentiment');
const sentiment = new Sentiment();

function randomInArray(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function findKeyword({
  state,
  body,
  fallbackApprove,
  fallbackChangesRequested,
}) {
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

  if (state === 'changes_requested') {
    if (analysis.comparative < 0 && analysis.negative.length > 0) {
      return randomInArray(analysis.negative);
    }
    if (analysis.comparative > 0 && analysis.positive.length > 0) {
      return randomInArray(analysis.positive);
    }
    if (analysis.words.length > 0) {
      return randomInArray(analysis.words);
    }
    return fallbackChangesRequested;
  } else {
    if (analysis.comparative > 0 && analysis.positive.length > 0) {
      return randomInArray(analysis.positive);
    }
    return fallbackApprove;
  }
}

module.exports = {
  randomInArray,
  findKeyword,
};
