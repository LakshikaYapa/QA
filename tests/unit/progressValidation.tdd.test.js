const isProgressValueInRange = require('../tdd/progressValidation');

describe('progress validation TDD example', () => {
  test('accepts a progress value inside the existing 0 to 100 range', () => {
    expect(isProgressValueInRange(50)).toBe(true);
  });
});
