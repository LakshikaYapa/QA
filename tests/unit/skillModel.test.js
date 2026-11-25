const mongoose = require('../../server/node_modules/mongoose');
const Skill = require('../../server/models/Skill');

const validSkillData = () => ({
  user: new mongoose.Types.ObjectId(),
  name: 'JavaScript',
  category: 'Programming',
  level: 'Beginner',
});

const expectValidationErrorFor = (data, path) => {
  const validationError = new Skill(data).validateSync();

  expect(validationError).toBeInstanceOf(mongoose.Error.ValidationError);
  expect(validationError.errors[path]).toBeDefined();
};

describe('Skill model validation', () => {
  test('accepts a valid skill record', () => {
    const validationError = new Skill(validSkillData()).validateSync();

    expect(validationError).toBeUndefined();
  });

  test('requires a user reference', () => {
    const { user, ...dataWithoutUser } = validSkillData();

    expectValidationErrorFor(dataWithoutUser, 'user');
  });

  test('requires a skill name', () => {
    const { name, ...dataWithoutName } = validSkillData();

    expectValidationErrorFor(dataWithoutName, 'name');
  });

  test('requires a skill category', () => {
    const { category, ...dataWithoutCategory } = validSkillData();

    expectValidationErrorFor(dataWithoutCategory, 'category');
  });

  test('requires a skill level', () => {
    const { level, ...dataWithoutLevel } = validSkillData();

    expectValidationErrorFor(dataWithoutLevel, 'level');
  });

  test('rejects a level outside the defined enum', () => {
    expectValidationErrorFor(
      { ...validSkillData(), level: 'Expert' },
      'level'
    );
  });

  test('accepts the Intermediate level', () => {
    const validationError = new Skill({
      ...validSkillData(),
      level: 'Intermediate',
    }).validateSync();

    expect(validationError).toBeUndefined();
  });

  test('accepts the Advanced level', () => {
    const validationError = new Skill({
      ...validSkillData(),
      level: 'Advanced',
    }).validateSync();

    expect(validationError).toBeUndefined();
  });
});
