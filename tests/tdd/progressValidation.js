const MIN_PROGRESS = 0;
const MAX_PROGRESS = 100;

const isProgressValueInRange = (progress) =>
  progress >= MIN_PROGRESS && progress <= MAX_PROGRESS;

module.exports = isProgressValueInRange;
