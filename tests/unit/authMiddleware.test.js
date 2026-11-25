const jwt = require('../../server/node_modules/jsonwebtoken');
const authMiddleware = require('../../server/middleware/authMiddleware');

const TEST_SECRET = 'unit-test-jwt-secret';

const createResponse = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
});

describe('authMiddleware', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = TEST_SECRET;
  });

  afterAll(() => {
    delete process.env.JWT_SECRET;
  });

  test('rejects a request when the authorization header is missing', () => {
    const req = { headers: {} };
    const res = createResponse();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'No token provided',
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('rejects a request when the authorization header has no Bearer prefix', () => {
    const req = { headers: { authorization: 'Basic some-token' } };
    const res = createResponse();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'No token provided',
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('rejects a request when the JWT is invalid', () => {
    const req = { headers: { authorization: 'Bearer invalid.token.value' } };
    const res = createResponse();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Invalid or expired token',
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('rejects a request when the JWT is expired', () => {
    const expiredToken = jwt.sign(
      { userId: 'expired-user', exp: Math.floor(Date.now() / 1000) - 60 },
      TEST_SECRET
    );
    const req = { headers: { authorization: `Bearer ${expiredToken}` } };
    const res = createResponse();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Invalid or expired token',
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('accepts a valid JWT and assigns the decoded user ID', () => {
    const validToken = jwt.sign({ userId: 'valid-user' }, TEST_SECRET);
    const req = { headers: { authorization: `Bearer ${validToken}` } };
    const res = createResponse();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(req.userId).toBe('valid-user');
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
