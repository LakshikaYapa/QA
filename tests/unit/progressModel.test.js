const mongoose = require('../../server/node_modules/mongoose');
const Progress = require('../../server/models/Progress');

const validProgressData = () => ({
  user: new mongoose.Types.ObjectId(),
  skill: new mongoose.Types.ObjectId(),
  progress: 50,
});

const expectValidationErrorFor = (data, path) => {
  const validationError = new Progress(data).validateSync();

  expect(validationError).toBeInstanceOf(mongoose.Error.ValidationError);
  expect(validationError.errors[path]).toBeDefined();
};

describe('Progress model validation', () => {
  test('accepts a valid progress record', () => {
    const validationError = new Progress(validProgressData()).validateSync();

    expect(validationError).toBeUndefined();
  });

  test('requires a user', () => {
    const { user, ...dataWithoutUser } = validProgressData();

    expectValidationErrorFor(dataWithoutUser, 'user');
  });

  test('requires a skill', () => {
    const { skill, ...dataWithoutSkill } = validProgressData();

    expectValidationErrorFor(dataWithoutSkill, 'skill');
  });

  test('requires progress', () => {
    const { progress, ...dataWithoutProgress } = validProgressData();

    expectValidationErrorFor(dataWithoutProgress, 'progress');
  });

  test('rejects progress below 0', () => {
    expectValidationErrorFor(
      { ...validProgressData(), progress: -1 },
      'progress'
    );
  });

  test('rejects progress above 100', () => {
    expectValidationErrorFor(
      { ...validProgressData(), progress: 101 },
      'progress'
    );
  });

  test('accepts progress equal to 0', () => {
    const validationError = new Progress({
      ...validProgressData(),
      progress: 0,
    }).validateSync();

    expect(validationError).toBeUndefined();
  });

  test('accepts progress equal to 100', () => {
    const validationError = new Progress({
      ...validProgressData(),
      progress: 100,
    }).validateSync();

    expect(validationError).toBeUndefined();
  });
});
