const assert = require('node:assert/strict');
const path = require('node:path');
const {
  After,
  AfterAll,
  Before,
  Given,
  Then,
  When,
} = require('@cucumber/cucumber');
const jwt = require('jsonwebtoken');
const request = require('supertest');

const originalGeminiKey = process.env.GEMINI_API_KEY;
process.env.GEMINI_API_KEY =
  process.env.GEMINI_API_KEY || 'bdd-test-key-not-used';

const { app } = require(path.resolve(__dirname, '../../../index.js'));
const Skill = require(path.resolve(__dirname, '../../../models/Skill.js'));
const Progress = require(path.resolve(__dirname, '../../../models/Progress.js'));

const JWT_SECRET = 'bdd-progress-test-secret';
const originalJwtSecret = process.env.JWT_SECRET;
const originalMethods = {
  skillFindOne: Skill.findOne,
  progressFindOne: Progress.findOne,
  progressCreate: Progress.create,
  progressFind: Progress.find,
};

Before(function () {
  process.env.JWT_SECRET = JWT_SECRET;
  this.databaseCalls = { skillLookup: 0, progressLookup: 0, progressCreate: 0 };
  const world = this;

  Skill.findOne = async ({ _id, user }) => {
    world.databaseCalls.skillLookup += 1;
    return { _id, user };
  };
  Progress.findOne = async () => {
    world.databaseCalls.progressLookup += 1;
    return null;
  };
  Progress.create = async (record) => {
    world.databaseCalls.progressCreate += 1;
    world.createdProgress = record;
    return {
      ...record,
      _id: 'bdd-progress-record',
      populate: async function () {
        return this;
      },
    };
  };
});

After(function () {
  Skill.findOne = originalMethods.skillFindOne;
  Progress.findOne = originalMethods.progressFindOne;
  Progress.create = originalMethods.progressCreate;
  Progress.find = originalMethods.progressFind;
  if (originalJwtSecret === undefined) {
    delete process.env.JWT_SECRET;
  } else {
    process.env.JWT_SECRET = originalJwtSecret;
  }
});

AfterAll(function () {
  if (originalGeminiKey === undefined) {
    delete process.env.GEMINI_API_KEY;
  } else {
    process.env.GEMINI_API_KEY = originalGeminiKey;
  }
});

Given('an authenticated learner', function () {
  this.userId = '507f1f77bcf86cd799439011';
  this.authorization = `Bearer ${jwt.sign(
    { userId: this.userId },
    JWT_SECRET
  )}`;
});

Given('the learner owns skill {string}', function (skillId) {
  this.skillId = skillId;
});

Given('the progress database is unavailable', function () {
  const world = this;
  Progress.find = () => ({
    populate() {
      return {
        async sort() {
          world.databaseCalls.progressListRead = true;
          throw new Error('test database unavailable');
        },
      };
    },
  });
});

When('the learner records {int} percent progress', async function (value) {
  this.progressValue = value;
  this.response = await request(app)
    .post('/api/progress')
    .set('Authorization', this.authorization)
    .send({ skillId: this.skillId, progress: value });
});

When('the learner loads progress', async function () {
  this.response = await request(app)
    .get('/api/progress')
    .set('Authorization', this.authorization);
});

Then(
  'the API creates a progress record at {int} percent',
  function (expectedValue) {
    assert.equal(this.response.status, 201);
    assert.equal(this.response.body.progress, expectedValue);
    assert.equal(this.createdProgress.progress, expectedValue);
    assert.equal(this.databaseCalls.progressCreate, 1);
  }
);

Then('the API responds with a server error', function () {
  assert.equal(this.response.status, 500);
  assert.deepEqual(this.response.body, { message: 'Server error' });
  assert.equal(this.databaseCalls.progressListRead, true);
});
