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
    db.query.mockResolvedValue([[{ nombre: 'Doctor Test', email: 'medico@test.com', rol: 'especialista' }]]);

    require('../scripts/seed_medico');
    await flushPromises();
    await flushPromises();

    expect(db.query).toHaveBeenCalledWith(
      'SELECT id_usuario, nombre, email, rol FROM usuarios WHERE email = ?',
      ['medico@test.com']
    );
    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalled();
  });

  test('inserta el usuario médico cuando no existe', async () => {
    const db = require('../config/db');
    const bcrypt = require('bcryptjs');
    db.query
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([{}]);
    bcrypt.hash.mockResolvedValue('hashed-password');

    require('../scripts/seed_medico');
    await flushPromises();
    await flushPromises();

    expect(bcrypt.hash).toHaveBeenCalledWith('Test123*', 10);
    expect(db.query).toHaveBeenCalledWith(
      'INSERT INTO usuarios (id_usuario, nombre, email, password, rol) VALUES (?, ?, ?, ?, ?)',
      [expect.any(String), 'Doctor Test', 'medico@test.com', 'hashed-password', 'especialista']
    );
    expect(process.exit).toHaveBeenCalled();
  });
});
