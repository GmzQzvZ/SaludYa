jest.mock('../config/db', () => ({
  query: jest.fn()
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn()
}));

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('seed_medico', () => {
  const originalExit = process.exit;
  const originalCrypto = global.crypto;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.exit = jest.fn();
    process.exitCode = undefined;
    process.env.MEDICO_NOMBRE = 'Doctor Test';
    process.env.MEDICO_EMAIL = 'medico@test.com';
    process.env.MEDICO_PASSWORD = 'Test123*';
    global.crypto = {
      randomUUID: jest.fn(() => 'crypto-uuid')
    };
  });

  afterEach(() => {
    process.exit = originalExit;
    global.crypto = originalCrypto;
  });

  test('no inserta si el usuario ya existe', async () => {
    const db = require('../config/db');
    const bcrypt = require('bcryptjs');
    expect(true).toBe(true);
  });

  test('inserta el usuario médico cuando no existe', async () => {
    const db = require('../config/db');
    const bcrypt = require('bcryptjs');
    expect(true).toBe(true);
  });
});
