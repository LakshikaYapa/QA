const jwt = require('../../server/node_modules/jsonwebtoken');
const request = require('../../server/node_modules/supertest');

jest.mock('../../server/models/Skill', () => ({
  findOne: jest.fn(),
}));

jest.mock('../../server/models/Progress', () => ({
  create: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findOneAndDelete: jest.fn(),
}));

const Skill = require('../../server/models/Skill');
const Progress = require('../../server/models/Progress');
const { app } = require('../../server/index');

const TEST_SECRET = 'progress-api-test-secret';
const USER_ID = 'user-for-progress-api-tests';
const PROGRESS_ID = 'progress-record-1';

const authHeader = () =>
  `Bearer ${jwt.sign({ userId: USER_ID }, TEST_SECRET)}`;

describe('Progress API endpoints', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = TEST_SECRET;
  });

  afterAll(() => {
    delete process.env.JWT_SECRET;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /api/progress rejects unauthenticated requests', async () => {
    const response = await request(app)
      .post('/api/progress')
      .send({ skillId: 'skill-1', progress: 50 });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'No token provided' });
  });

  test('POST /api/progress rejects progress outside the 0 to 100 range', async () => {
    const response = await request(app)
      .post('/api/progress')
      .set('Authorization', authHeader())
      .send({ skillId: 'skill-1', progress: 101 });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: 'Progress must be between 0 and 100',
    });
    expect(Skill.findOne).not.toHaveBeenCalled();
    expect(Progress.findOne).not.toHaveBeenCalled();
  });

  test('POST /api/progress rejects numeric strings before database lookups', async () => {
    Skill.findOne.mockResolvedValue({ _id: 'skill-1' });
    Progress.findOne.mockResolvedValue(null);
    Progress.create.mockResolvedValue({
      _id: 'progress-string-value',
      progress: '50',
      populate: jest.fn().mockResolvedValue(),
    });

    const response = await request(app)
      .post('/api/progress')
      .set('Authorization', authHeader())
      .send({ skillId: 'skill-1', progress: '50' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: 'Progress must be between 0 and 100',
    });
    expect(Skill.findOne).not.toHaveBeenCalled();
    expect(Progress.findOne).not.toHaveBeenCalled();
    expect(Progress.create).not.toHaveBeenCalled();
  });

  test('POST /api/progress rejects null progress before database lookups', async () => {
    const response = await request(app)
      .post('/api/progress')
      .set('Authorization', authHeader())
      .send({ skillId: 'skill-1', progress: null });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: 'Progress must be between 0 and 100',
    });
    expect(Skill.findOne).not.toHaveBeenCalled();
  });

  test('POST /api/progress accepts both inclusive progress boundaries', async () => {
    const atZero = {
      _id: 'progress-zero',
      progress: 0,
      populate: jest.fn().mockResolvedValue(),
    };
    const atHundred = {
      _id: 'progress-hundred',
      progress: 100,
      populate: jest.fn().mockResolvedValue(),
    };
    Skill.findOne.mockResolvedValue({ _id: 'skill-1' });
    Progress.findOne.mockResolvedValue(null);
    Progress.create
      .mockResolvedValueOnce(atZero)
      .mockResolvedValueOnce(atHundred);

    const zero = await request(app)
      .post('/api/progress')
      .set('Authorization', authHeader())
      .send({ skillId: 'skill-1', progress: 0 });
    const hundred = await request(app)
      .post('/api/progress')
      .set('Authorization', authHeader())
      .send({ skillId: 'skill-1', progress: 100 });

    expect(zero.status).toBe(201);
    expect(hundred.status).toBe(201);
    expect(Progress.create).toHaveBeenNthCalledWith(1, {
      user: USER_ID,
      skill: 'skill-1',
      progress: 0,
    });
    expect(Progress.create).toHaveBeenNthCalledWith(2, {
      user: USER_ID,
      skill: 'skill-1',
      progress: 100,
    });
  });

  test('GET /api/progress returns progress records for the authenticated user', async () => {
    const progressRecords = [
      { _id: PROGRESS_ID, user: USER_ID, progress: 75 },
    ];
    const sort = jest.fn().mockResolvedValue(progressRecords);
    const populate = jest.fn().mockReturnValue({ sort });
    Progress.find.mockReturnValue({ populate });

    const response = await request(app)
      .get('/api/progress')
      .set('Authorization', authHeader());

    expect(response.status).toBe(200);
    expect(response.body).toEqual(progressRecords);
    expect(Progress.find).toHaveBeenCalledWith({ user: USER_ID });
    expect(populate).toHaveBeenCalledWith('skill', 'name category level');
    expect(sort).toHaveBeenCalledWith({ createdAt: -1 });
  });

  test('PUT /api/progress/:id returns 404 when the record is not owned by the user', async () => {
    Progress.findOne.mockResolvedValue(null);

    const response = await request(app)
      .put(`/api/progress/${PROGRESS_ID}`)
      .set('Authorization', authHeader())
      .send({ progress: 80 });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Progress not found' });
    expect(Progress.findOne).toHaveBeenCalledWith({
      _id: PROGRESS_ID,
      user: USER_ID,
    });
  });

  test.each(['50', null])(
    'PUT /api/progress/:id rejects invalid progress value %s before database lookup',
    async (progress) => {
      const response = await request(app)
        .put(`/api/progress/${PROGRESS_ID}`)
        .set('Authorization', authHeader())
        .send({ progress });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: 'Progress must be between 0 and 100',
      });
      expect(Progress.findOne).not.toHaveBeenCalled();
    }
  );

  test('PUT /api/progress/:id returns 500 when the database lookup fails', async () => {
    Progress.findOne.mockRejectedValueOnce(new Error('database unavailable'));

    const response = await request(app)
      .put(`/api/progress/${PROGRESS_ID}`)
      .set('Authorization', authHeader())
      .send({ progress: 80 });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Server error' });
  });

  test('DELETE /api/progress/:id deletes an owned progress record', async () => {
    Progress.findOneAndDelete.mockResolvedValue({
      _id: PROGRESS_ID,
      user: USER_ID,
      progress: 60,
    });

    const response = await request(app)
      .delete(`/api/progress/${PROGRESS_ID}`)
      .set('Authorization', authHeader());

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'Progress deleted successfully',
    });
    expect(Progress.findOneAndDelete).toHaveBeenCalledWith({
      _id: PROGRESS_ID,
      user: USER_ID,
    });
  });

  test('DELETE /api/progress/:id returns 500 when the database fails', async () => {
    Progress.findOneAndDelete.mockRejectedValueOnce(
      new Error('database unavailable')
    );

    const response = await request(app)
      .delete(`/api/progress/${PROGRESS_ID}`)
      .set('Authorization', authHeader());

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Server error' });
  });
});
