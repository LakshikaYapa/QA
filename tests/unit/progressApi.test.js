const jwt = require('../../server/node_modules/jsonwebtoken');
const request = require('../../server/node_modules/supertest');

jest.mock('../../server/models/Skill', () => ({
  findOne: jest.fn(),
}));

jest.mock('../../server/models/Progress', () => ({
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
});
