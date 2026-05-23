jest.mock('mysql2/promise', () => ({
  createPool: jest.fn()
}));

jest.mock('dotenv', () => ({
  config: jest.fn()
}));

const mysql = require('mysql2/promise');

describe('db config', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.DB_HOST = 'localhost';
    process.env.DB_USER = 'root';
    process.env.DB_PASSWORD = 'pass';
    process.env.DB_NAME = 'saludya';
  });

  test('crea el pool con la configuración esperada', async () => {
    const release = jest.fn();
    mysql.createPool.mockReturnValue({
      getConnection: jest.fn().mockResolvedValue({ release })
    });

    delete require.cache[require.resolve('../config/db')];
    require('../config/db');

    expect(mysql.createPool).toHaveBeenCalledWith({
      host: 'localhost',
      user: 'root',
      password: 'pass',
      database: 'saludya',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  });
});
