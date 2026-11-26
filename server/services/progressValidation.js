const isValidProgressValue = (progress) =>
  Number.isFinite(progress) && progress >= 0 && progress <= 100;

module.exports = isValidProgressValue;
