const mongoose = require('../../server/node_modules/mongoose');
const connectDB = require('../../server/config/db');

describe('Database Configuration Tests', () => {
  let consoleLog;
  let consoleError;

  beforeEach(() => {
    jest.clearAllMocks();

    delete process.env.MONGODB_URI;
    delete process.env.MONGO_URI;

    jest.spyOn(mongoose, 'connect');

    consoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should connect using MONGODB_URI when available', async () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb';
    process.env.MONGO_URI = 'mongodb://localhost:27017/otherdb';

    mongoose.connect.mockResolvedValueOnce();

    await connectDB();

    expect(mongoose.connect).toHaveBeenCalledWith(
      'mongodb://localhost:27017/testdb',
      { serverSelectionTimeoutMS: 5000 }
    );
    expect(consoleLog).toHaveBeenCalledWith(
      'MongoDB connected successfully'
    );
  });

  test('should use MONGO_URI when MONGODB_URI is unavailable', async () => {
    process.env.MONGO_URI = 'mongodb://localhost:27017/testdb';

    mongoose.connect.mockResolvedValueOnce();

    await connectDB();

    expect(mongoose.connect).toHaveBeenCalledWith(
      'mongodb://localhost:27017/testdb',
      { serverSelectionTimeoutMS: 5000 }
    );
  });

  test('should throw an error when both MongoDB URIs are missing', async () => {
    await expect(connectDB()).rejects.toThrow(
      'MongoDB connection string is missing.'
    );

    expect(mongoose.connect).not.toHaveBeenCalled();
  });

  test('should log and rethrow MongoDB connection errors', async () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb';

    const connectionError = new Error('Connection failed');
    mongoose.connect.mockRejectedValueOnce(connectionError);

    await expect(connectDB()).rejects.toThrow('Connection failed');

    expect(consoleError).toHaveBeenCalledWith(
      'MongoDB connection failed:',
      'Connection failed'
    );
  });
});
