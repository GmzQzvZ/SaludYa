jest.mock('jsonwebtoken', () => ({
  verify: jest.fn()
}));

const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/authMiddleware');

function createRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('authMiddleware', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'secret';
    jest.clearAllMocks();
  });

  test('rechaza peticiones sin token', () => {
    const req = {
      header: jest.fn(() => undefined)
    };
    const res = createRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'No hay token, autorización denegada.'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('acepta un token válido', () => {
    const req = {
      header: jest.fn(() => 'Bearer token-123')
    };
    const res = createRes();
    const next = jest.fn();

    jwt.verify.mockReturnValue({ usuario: { id: 7, rol: 'paciente' } });

    authMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('token-123', 'secret');
    expect(req.usuario).toEqual({ id: 7, rol: 'paciente' });
    expect(next).toHaveBeenCalled();
  });

  test('rechaza un token inválido', () => {
    const req = {
      header: jest.fn(() => 'Bearer token-123')
    };
    const res = createRes();
    const next = jest.fn();

    jwt.verify.mockImplementation(() => {
      throw new Error('invalid');
    });

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Token no es válido o ya caducó.'
    });
    expect(next).not.toHaveBeenCalled();
  });
});
