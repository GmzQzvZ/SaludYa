jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue({
      release: jest.fn()
    })
  }))
}));

jest.mock('dotenv', () => ({
  config: jest.fn()
}));

const { Pool } = require('pg');

describe('db config', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.DB_HOST = 'localhost';
    process.env.DB_USER = 'root';
    process.env.DB_PASSWORD = 'pass';
    process.env.DB_NAME = 'saludya';
  });

  test('crea el pool con la configuración esperada', async () => {
    const connect = jest.fn().mockResolvedValue({ release: jest.fn() });
    Pool.mockImplementation(() => ({
      connect
    }));

    delete require.cache[require.resolve('../config/db')];
    require('../config/db');

    expect(Pool).toHaveBeenCalledWith({
      host: 'localhost',
      port: 5432,
      user: 'root',
      password: 'pass',
      database: 'saludya',
      ssl: {
        rejectUnauthorized: false
      }
    });
  });
});
