const isValidProgressValue = require('../../server/services/progressValidation');

describe('progress value service validation', () => {
  test.each([
    ['lower boundary', 0, true],
    ['upper boundary', 100, true],
    ['interior integer', 45, true],
    ['interior decimal', 37.5, true],
    ['below lower boundary', -0.01, false],
    ['above upper boundary', 100.01, false],
    ['numeric string', '50', false],
    ['null', null, false],
    ['undefined', undefined, false],
    ['NaN', NaN, false],
    ['infinity', Infinity, false],
  ])('validates %s', (_description, progress, expected) => {
    expect(isValidProgressValue(progress)).toBe(expected);
  });
});
