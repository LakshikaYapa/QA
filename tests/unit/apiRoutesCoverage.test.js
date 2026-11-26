const jwt = require('../../server/node_modules/jsonwebtoken');
const request = require('../../server/node_modules/supertest');

const mockGenerateContent = jest.fn();
const mockCloudinaryUploadStream = jest.fn();

jest.mock('../../server/models/User', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

jest.mock('../../server/models/Skill', () => ({
  create: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findOneAndDelete: jest.fn(),
}));

jest.mock('../../server/models/Progress', () => ({
  create: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findOneAndDelete: jest.fn(),
}));

jest.mock('../../server/models/CareerPath', () => ({
  find: jest.fn(),
}));

jest.mock('../../server/models/Project', () => ({
  create: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findOneAndDelete: jest.fn(),
}));

jest.mock('../../server/node_modules/bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

jest.mock('../../server/config/db', () => jest.fn());

jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: { generateContent: mockGenerateContent },
  })),
}), { virtual: true });

jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: { upload_stream: mockCloudinaryUploadStream },
  },
}), { virtual: true });

const bcrypt = require('../../server/node_modules/bcryptjs');
const User = require('../../server/models/User');
const Skill = require('../../server/models/Skill');
const Progress = require('../../server/models/Progress');
const CareerPath = require('../../server/models/CareerPath');
const Project = require('../../server/models/Project');
const connectDB = require('../../server/config/db');
const { app, startServer } = require('../../server/index');

const TEST_SECRET = 'api-route-coverage-secret';
const USER_ID = '507f1f77bcf86cd799439011';
const PROJECT_ID = '507f1f77bcf86cd799439012';
const authHeader = () =>
  `Bearer ${jwt.sign({ userId: USER_ID }, TEST_SECRET)}`;

const queryWithSelect = (result) => ({
  select: jest.fn().mockResolvedValue(result),
});

const queryWithSort = (result) => ({
  sort: jest.fn().mockResolvedValue(result),
});

const queryWithCollation = (result) => ({
  collation: jest.fn().mockResolvedValue(result),
});

describe('Core API route coverage', () => {
  const originalGeminiKey = process.env.GEMINI_API_KEY;

  beforeAll(() => {
    process.env.JWT_SECRET = TEST_SECRET;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateContent.mockReset();
    mockCloudinaryUploadStream.mockReset();
    connectDB.mockReset();
    delete process.env.GEMINI_API_KEY;
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    delete process.env.JWT_SECRET;
    if (originalGeminiKey === undefined) {
      delete process.env.GEMINI_API_KEY;
    } else {
      process.env.GEMINI_API_KEY = originalGeminiKey;
    }
  });

  test('serves the API health endpoint', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.text).toBe('Skill and Career Development API is running');
  });

  describe('authentication routes', () => {
    test('rejects login requests with missing credentials', async () => {
      const response = await request(app).post('/api/auth/login').send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Email and password are required' });
    });

    test('rejects a login when the account is not found', async () => {
      User.findOne.mockReturnValue(queryWithCollation(null));

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: ' STUDENT@example.com ', password: 'Password1!' });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: 'Invalid email or password' });
      expect(User.findOne).toHaveBeenCalledWith({ email: 'student@example.com' });
    });

    test('rejects a login with an incorrect password', async () => {
      User.findOne.mockReturnValue(
        queryWithCollation({ _id: USER_ID, password: 'hash' })
      );
      bcrypt.compare.mockResolvedValue(false);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'student@example.com', password: 'wrong' });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: 'Invalid email or password' });
    });

    test('logs in a valid user and returns a JWT', async () => {
      const user = {
        _id: USER_ID,
        name: 'Student',
        email: 'student@example.com',
        password: 'hash',
      };
      User.findOne.mockReturnValue(queryWithCollation(user));
      bcrypt.compare.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: user.email, password: 'Password1!' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.user).toEqual({
        id: USER_ID,
        name: user.name,
        email: user.email,
      });
      expect(jwt.verify(response.body.token, TEST_SECRET).userId).toBe(USER_ID);
    });

    test('validates registration fields and password strength', async () => {
      const missing = await request(app).post('/api/auth/register').send({});
      const weak = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Student', email: 'student@example.com', password: 'weak' });

      expect(missing.status).toBe(400);
      expect(missing.body).toEqual({ message: 'All fields are required' });
      expect(weak.status).toBe(400);
      expect(weak.body.message).toContain('Password must be at least 8 characters');
    });

    test('rejects duplicate registrations and creates new users', async () => {
      User.findOne.mockReturnValueOnce(queryWithCollation({ _id: USER_ID }));
      const duplicate = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Student', email: 'student@example.com', password: 'Password1!' });

      expect(duplicate.status).toBe(409);

      User.findOne.mockReturnValueOnce(queryWithCollation(null));
      bcrypt.hash.mockResolvedValue('hashed-password');
      User.create.mockResolvedValue({
        _id: USER_ID,
        name: 'Student',
        email: 'student@example.com',
      });
      const created = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Student', email: 'STUDENT@example.com', password: 'Password1!' });

      expect(created.status).toBe(201);
      expect(User.create).toHaveBeenCalledWith({
        name: 'Student',
        email: 'student@example.com',
        password: 'hashed-password',
      });
    });
  });

  describe('profile and skills routes', () => {
    test('gets an owned profile and returns 404 for a missing user', async () => {
      const profile = { _id: USER_ID, name: 'Student' };
      User.findById.mockReturnValueOnce(queryWithSelect(profile));
      const found = await request(app)
        .get('/api/profile')
        .set('Authorization', authHeader());

      User.findById.mockReturnValueOnce(queryWithSelect(null));
      const missing = await request(app)
        .get('/api/profile')
        .set('Authorization', authHeader());

      expect(found.status).toBe(200);
      expect(found.body).toEqual(profile);
      expect(missing.status).toBe(404);
    });

    test('updates a profile owned by the authenticated user', async () => {
      const user = {
        _id: USER_ID,
        email: 'student@example.com',
        save: jest.fn().mockResolvedValue(),
      };
      User.findById.mockResolvedValue(user);
      const payload = {
        name: 'Updated Student', university: 'UOR', degree: 'CE', studyYear: 4,
        careerGoal: 'Engineer', github: 'github-url', linkedin: 'linkedin-url',
      };

      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', authHeader())
        .send(payload);

      expect(response.status).toBe(200);
      expect(user.save).toHaveBeenCalled();
      expect(response.body.user).toMatchObject(payload);
    });

    test('validates and creates skills', async () => {
      const invalid = await request(app)
        .post('/api/skills')
        .set('Authorization', authHeader())
        .send({ name: 'JavaScript' });
      Skill.create.mockResolvedValue({ _id: 'skill-1', name: 'JavaScript' });
      const created = await request(app)
        .post('/api/skills')
        .set('Authorization', authHeader())
        .send({ name: 'JavaScript', category: 'Programming', level: 'Beginner' });

      expect(invalid.status).toBe(400);
      expect(created.status).toBe(201);
      expect(Skill.create).toHaveBeenCalledWith({
        user: USER_ID, name: 'JavaScript', category: 'Programming', level: 'Beginner',
      });
    });

    test('lists, updates, and deletes owned skills', async () => {
      const skill = { _id: 'skill-1', save: jest.fn().mockResolvedValue() };
      Skill.find.mockReturnValue(queryWithSort([{ _id: 'skill-1', name: 'JavaScript' }]));
      const listed = await request(app).get('/api/skills').set('Authorization', authHeader());

      Skill.findOne.mockResolvedValue(skill);
      const updated = await request(app)
        .put('/api/skills/skill-1')
        .set('Authorization', authHeader())
        .send({ name: 'TypeScript', category: 'Programming', level: 'Intermediate' });

      Skill.findOneAndDelete.mockResolvedValue(skill);
      const deleted = await request(app)
        .delete('/api/skills/skill-1')
        .set('Authorization', authHeader());

      expect(listed.status).toBe(200);
      expect(updated.status).toBe(200);
      expect(skill.name).toBe('TypeScript');
      expect(deleted.status).toBe(200);
    });
  });

  describe('progress and career routes', () => {
    test('covers missing, missing-skill, duplicate, and successful progress creation', async () => {
      const missing = await request(app).post('/api/progress').set('Authorization', authHeader()).send({});

      Skill.findOne.mockResolvedValueOnce(null);
      const missingSkill = await request(app)
        .post('/api/progress').set('Authorization', authHeader()).send({ skillId: 'skill-1', progress: 20 });

      Skill.findOne.mockResolvedValueOnce({ _id: 'skill-1' });
      Progress.findOne.mockResolvedValueOnce({ _id: 'progress-1' });
      const duplicate = await request(app)
        .post('/api/progress').set('Authorization', authHeader()).send({ skillId: 'skill-1', progress: 20 });

      const progress = { _id: 'progress-2', progress: 20, populate: jest.fn().mockResolvedValue() };
      Skill.findOne.mockResolvedValueOnce({ _id: 'skill-1' });
      Progress.findOne.mockResolvedValueOnce(null);
      Progress.create.mockResolvedValueOnce(progress);
      const created = await request(app)
        .post('/api/progress').set('Authorization', authHeader()).send({ skillId: 'skill-1', progress: 20 });

      expect(missing.status).toBe(400);
      expect(missingSkill.status).toBe(404);
      expect(duplicate.status).toBe(400);
      expect(created.status).toBe(201);
      expect(progress.populate).toHaveBeenCalledWith('skill', 'name category level');
    });

    test('lists career paths and handles data-access failures', async () => {
      CareerPath.find.mockResolvedValueOnce([{ title: 'Developer' }]);
      const found = await request(app).get('/api/career-paths').set('Authorization', authHeader());
      CareerPath.find.mockRejectedValueOnce(new Error('database failure'));
      const failed = await request(app).get('/api/career-paths').set('Authorization', authHeader());

      expect(found.status).toBe(200);
      expect(found.body).toEqual([{ title: 'Developer' }]);
      expect(failed.status).toBe(500);
    });

    test('validates, saves, and reads a selected career', async () => {
      const invalid = await request(app)
        .put('/api/career-paths/selected').set('Authorization', authHeader()).send({ title: '' });

      User.findByIdAndUpdate.mockReturnValueOnce(queryWithSelect({ selectedCareer: { title: 'Developer' } }));
      const saved = await request(app)
        .put('/api/career-paths/selected').set('Authorization', authHeader())
        .send({ title: ' Developer ', description: 'Build software', skills: ['JavaScript'] });

      User.findById.mockReturnValueOnce(queryWithSelect({ selectedCareer: { title: 'Developer' } }));
      const loaded = await request(app)
        .get('/api/career-paths/selected').set('Authorization', authHeader());

      expect(invalid.status).toBe(400);
      expect(saved.status).toBe(200);
      expect(loaded.status).toBe(200);
      expect(loaded.body.selectedCareer.title).toBe('Developer');
    });

    test('returns configuration and validation errors without calling Gemini', async () => {
      const missingKey = await request(app)
        .post('/api/career-paths/recommendations').set('Authorization', authHeader()).send({});
      const roadmapMissingKey = await request(app)
        .post('/api/roadmap/resources').set('Authorization', authHeader()).send({});

      process.env.GEMINI_API_KEY = 'test-key';
      const roadmapInvalid = await request(app)
        .post('/api/roadmap/resources').set('Authorization', authHeader()).send({ careerTitle: '', skill: '' });

      expect(missingKey.status).toBe(500);
      expect(roadmapMissingKey.status).toBe(500);
      expect(roadmapInvalid.status).toBe(400);
    });
  });

  describe('project routes', () => {
    test('lists projects and creates a valid project', async () => {
      Project.find.mockReturnValue(queryWithSort([{ _id: PROJECT_ID, title: 'Portfolio' }]));
      const listed = await request(app).get('/api/projects').set('Authorization', authHeader());
      const invalid = await request(app).post('/api/projects').set('Authorization', authHeader()).send({});

      Project.create.mockResolvedValue({ _id: PROJECT_ID, title: 'Portfolio' });
      const created = await request(app)
        .post('/api/projects').set('Authorization', authHeader())
        .send({ title: 'Portfolio', technologies: ['React'] });

      expect(listed.status).toBe(200);
      expect(invalid.status).toBe(400);
      expect(created.status).toBe(201);
    });

    test('validates project updates before querying the database', async () => {
      const invalidId = await request(app)
        .put('/api/projects/not-an-id').set('Authorization', authHeader()).send({ title: 'Portfolio' });
      const unknownField = await request(app)
        .put(`/api/projects/${PROJECT_ID}`).set('Authorization', authHeader()).send({ owner: 'other-user' });
      const invalidTitle = await request(app)
        .put(`/api/projects/${PROJECT_ID}`).set('Authorization', authHeader()).send({ title: ' ' });
      const invalidTechnologies = await request(app)
        .put(`/api/projects/${PROJECT_ID}`).set('Authorization', authHeader()).send({ technologies: ['React', 1] });

      expect(invalidId.status).toBe(400);
      expect(unknownField.status).toBe(400);
      expect(invalidTitle.status).toBe(400);
      expect(invalidTechnologies.status).toBe(400);
      expect(Project.findOne).not.toHaveBeenCalled();
    });

    test('updates an owned project and reports a missing project', async () => {
      const project = { _id: PROJECT_ID, save: jest.fn().mockResolvedValue() };
      Project.findOne.mockResolvedValueOnce(null);
      const missing = await request(app)
        .put(`/api/projects/${PROJECT_ID}`).set('Authorization', authHeader()).send({ title: 'Portfolio' });

      Project.findOne.mockResolvedValueOnce(project);
      const updated = await request(app)
        .put(`/api/projects/${PROJECT_ID}`).set('Authorization', authHeader())
        .send({ title: 'Updated portfolio', description: 'A project', technologies: ['React'] });

      expect(missing.status).toBe(404);
      expect(updated.status).toBe(200);
      expect(project.title).toBe('Updated portfolio');
      expect(project.save).toHaveBeenCalled();
    });

    test('handles project deletion and empty image uploads safely', async () => {
      Project.findOneAndDelete.mockResolvedValueOnce(null);
      const missing = await request(app)
        .delete(`/api/projects/${PROJECT_ID}`).set('Authorization', authHeader());

      Project.findOneAndDelete.mockResolvedValueOnce({ _id: PROJECT_ID });
      const deleted = await request(app)
        .delete(`/api/projects/${PROJECT_ID}`).set('Authorization', authHeader());

      const image = await request(app)
        .post(`/api/projects/${PROJECT_ID}/image`).set('Authorization', authHeader());

      expect(missing.status).toBe(404);
      expect(deleted.status).toBe(200);
      expect(image.status).toBe(400);
      expect(image.body).toEqual({ message: 'Please select an image.' });
    });
  });

  describe('generated career and roadmap routes', () => {
    test('checks recommendation prerequisites before calling Gemini', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';

      User.findById.mockReturnValueOnce(queryWithSelect(null));
      const missingUser = await request(app)
        .post('/api/career-paths/recommendations')
        .set('Authorization', authHeader());

      User.findById.mockReturnValueOnce(queryWithSelect({ degree: '' }));
      Skill.find.mockReturnValueOnce(queryWithSelect([{ name: 'JavaScript' }]));
      const missingDegree = await request(app)
        .post('/api/career-paths/recommendations')
        .set('Authorization', authHeader());

      User.findById.mockReturnValueOnce(queryWithSelect({ degree: 'Computer Science' }));
      Skill.find.mockReturnValueOnce(queryWithSelect([]));
      const missingSkills = await request(app)
        .post('/api/career-paths/recommendations')
        .set('Authorization', authHeader());

      expect(missingUser.status).toBe(404);
      expect(missingDegree.status).toBe(400);
      expect(missingSkills.status).toBe(400);
      expect(mockGenerateContent).not.toHaveBeenCalled();
    });

    test('generates recommendations with Gemini and retries a recognized unavailable response', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      User.findById.mockReturnValue(queryWithSelect({
        degree: 'Computer Science', careerGoal: 'Backend developer',
      }));
      Skill.find.mockReturnValue(queryWithSelect([
        { name: 'Node.js', category: 'Programming', level: 'Intermediate' },
      ]));
      const recommendations = [
        { title: 'Backend Developer' },
        { title: 'Software Engineer' },
        { title: 'Platform Engineer' },
      ];
      mockGenerateContent
        .mockRejectedValueOnce({ error: { code: 'UNAVAILABLE' } })
        .mockResolvedValueOnce({ text: JSON.stringify(recommendations) });
      jest.spyOn(console, 'warn').mockImplementation(() => {});

      const response = await request(app)
        .post('/api/career-paths/recommendations')
        .set('Authorization', authHeader());

      expect(response.status).toBe(200);
      expect(response.body.recommendations).toEqual(recommendations);
      expect(mockGenerateContent.mock.calls.map(([args]) => args.model)).toEqual([
        'gemini-3.8-flash',
        'gemini-3.6-flash',
      ]);
    });

    test('returns a gateway error for Gemini failures, empty output, and invalid recommendation shapes', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      User.findById.mockReturnValue(queryWithSelect({ degree: 'Computer Science' }));
      Skill.find.mockReturnValue(queryWithSelect([{ name: 'Node.js' }]));

      mockGenerateContent.mockRejectedValueOnce(new Error('upstream failure'));
      const upstreamFailure = await request(app)
        .post('/api/career-paths/recommendations')
        .set('Authorization', authHeader());

      mockGenerateContent.mockResolvedValueOnce({ text: ' ' });
      const empty = await request(app)
        .post('/api/career-paths/recommendations')
        .set('Authorization', authHeader());

      mockGenerateContent.mockResolvedValueOnce({ text: JSON.stringify([{ title: 'Only one' }]) });
      const invalidShape = await request(app)
        .post('/api/career-paths/recommendations')
        .set('Authorization', authHeader());

      expect(upstreamFailure.status).toBe(502);
      expect(empty.status).toBe(502);
      expect(invalidShape.status).toBe(502);
      expect(mockGenerateContent).toHaveBeenCalledTimes(3);
    });

    test('returns valid roadmap resources and reports malformed provider data', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      const resources = {
        courses: [{ title: 'Node fundamentals', provider: 'Example', url: '', description: 'Learn Node' }],
        books: [],
        duration: '4 weeks',
        practicalTask: 'Create a small API',
      };
      mockGenerateContent.mockResolvedValueOnce({ text: JSON.stringify(resources) });
      const valid = await request(app)
        .post('/api/roadmap/resources')
        .set('Authorization', authHeader())
        .send({ careerTitle: 'Backend developer', careerDescription: 'Build APIs', skill: 'Node.js' });

      mockGenerateContent.mockResolvedValueOnce({ text: '{"courses": "invalid"}' });
      const invalid = await request(app)
        .post('/api/roadmap/resources')
        .set('Authorization', authHeader())
        .send({ careerTitle: 'Backend developer', skill: 'Node.js' });

      expect(valid.status).toBe(200);
      expect(valid.body.resources).toEqual(resources);
      expect(invalid.status).toBe(502);
      expect(mockGenerateContent).toHaveBeenCalledTimes(2);
    });
  });

  describe('image uploads and persistence failures', () => {
    test('uploads a profile image and reports missing users or cloud-storage errors', async () => {
      const user = { _id: USER_ID, save: jest.fn().mockResolvedValue() };
      User.findById.mockResolvedValueOnce(user);
      mockCloudinaryUploadStream.mockImplementationOnce((options, callback) => ({
        end: () => callback(null, { secure_url: 'https://images.example/profile.png' }),
      }));
      const uploaded = await request(app)
        .post('/api/profile/photo')
        .set('Authorization', authHeader())
        .attach('photo', Buffer.from('image bytes'), { filename: 'profile.png', contentType: 'image/png' });

      User.findById.mockResolvedValueOnce(null);
      const missingUser = await request(app)
        .post('/api/profile/photo')
        .set('Authorization', authHeader())
        .attach('photo', Buffer.from('image bytes'), { filename: 'profile.png', contentType: 'image/png' });

      User.findById.mockResolvedValueOnce({ _id: USER_ID });
      mockCloudinaryUploadStream.mockImplementationOnce((options, callback) => ({
        end: () => callback({ message: 'upload service failed' }),
      }));
      const failedUpload = await request(app)
        .post('/api/profile/photo')
        .set('Authorization', authHeader())
        .attach('photo', Buffer.from('image bytes'), { filename: 'profile.png', contentType: 'image/png' });

      expect(uploaded.status).toBe(200);
      expect(uploaded.body.profilePhoto).toBe('https://images.example/profile.png');
      expect(user.save).toHaveBeenCalled();
      expect(missingUser.status).toBe(404);
      expect(failedUpload.status).toBe(500);
      expect(failedUpload.body).toEqual({ message: 'Could not upload profile photo.' });
    });

    test('uploads a project image and handles missing records and Cloudinary failures', async () => {
      const project = { _id: PROJECT_ID, save: jest.fn().mockResolvedValue() };
      Project.findOne.mockResolvedValueOnce(project);
      mockCloudinaryUploadStream.mockImplementationOnce((options, callback) => ({
        end: () => callback(null, { secure_url: 'https://images.example/project.png' }),
      }));
      const uploaded = await request(app)
        .post(`/api/projects/${PROJECT_ID}/image`)
        .set('Authorization', authHeader())
        .attach('image', Buffer.from('image bytes'), { filename: 'project.png', contentType: 'image/png' });

      Project.findOne.mockResolvedValueOnce(null);
      const missing = await request(app)
        .post(`/api/projects/${PROJECT_ID}/image`)
        .set('Authorization', authHeader())
        .attach('image', Buffer.from('image bytes'), { filename: 'project.png', contentType: 'image/png' });

      Project.findOne.mockResolvedValueOnce({ _id: PROJECT_ID });
      mockCloudinaryUploadStream.mockImplementationOnce((options, callback) => ({
        end: () => callback(null, null),
      }));
      const failedUpload = await request(app)
        .post(`/api/projects/${PROJECT_ID}/image`)
        .set('Authorization', authHeader())
        .attach('image', Buffer.from('image bytes'), { filename: 'project.png', contentType: 'image/png' });

      expect(uploaded.status).toBe(200);
      expect(uploaded.body.imageUrl).toBe('https://images.example/project.png');
      expect(project.save).toHaveBeenCalled();
      expect(missing.status).toBe(404);
      expect(failedUpload.status).toBe(500);
      expect(failedUpload.body).toEqual({ message: 'Could not upload project image.' });
    });
  });

  describe('database and startup error handling', () => {
    test('returns server errors when auth, profile, skills, projects, and selected-career queries fail', async () => {
      User.findOne.mockReturnValueOnce({
        collation: jest.fn().mockRejectedValue(new Error('database unavailable')),
      });
      const login = await request(app)
        .post('/api/auth/login')
        .send({ email: 'student@example.com', password: 'Password1!' });

      User.findOne.mockReturnValueOnce({
        collation: jest.fn().mockRejectedValue(new Error('database unavailable')),
      });
      const register = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Student', email: 'student@example.com', password: 'Password1!' });

      User.findById.mockReturnValueOnce({
        select: jest.fn().mockRejectedValue(new Error('database unavailable')),
      });
      const profile = await request(app).get('/api/profile').set('Authorization', authHeader());

      Skill.find.mockReturnValueOnce({
        sort: jest.fn().mockRejectedValue(new Error('database unavailable')),
      });
      const skills = await request(app).get('/api/skills').set('Authorization', authHeader());

      Project.find.mockReturnValueOnce({
        sort: jest.fn().mockRejectedValue(new Error('database unavailable')),
      });
      const projects = await request(app).get('/api/projects').set('Authorization', authHeader());

      User.findByIdAndUpdate.mockReturnValueOnce({
        select: jest.fn().mockRejectedValue(new Error('database unavailable')),
      });
      const selectedCareer = await request(app)
        .put('/api/career-paths/selected')
        .set('Authorization', authHeader())
        .send({ title: 'Developer', description: 'Build software', skills: [] });

      for (const response of [login, register, profile, skills, projects, selectedCareer]) {
        expect(response.status).toBe(500);
      }
    });

    test('guards server startup on a missing secret and propagates database failures', async () => {
      delete process.env.JWT_SECRET;
      await expect(startServer()).rejects.toThrow('JWT_SECRET is missing');

      process.env.JWT_SECRET = TEST_SECRET;
      connectDB.mockRejectedValueOnce(new Error('database unavailable'));
      await expect(startServer()).rejects.toThrow('database unavailable');
      expect(connectDB).toHaveBeenCalledTimes(1);
    });
  });
});
