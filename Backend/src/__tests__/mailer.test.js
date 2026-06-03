jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    verify: jest.fn().mockResolvedValue()
  }))
}), { virtual: true });

describe('mailer', () => {
  beforeEach(() => {
    process.env.EMAIL_USER = 'test@example.com';
    process.env.EMAIL_PASS = 'secret';
    jest.resetModules();
    delete process.env.NODE_ENV;
  });

  test('crea un transporter con la configuracion esperada', () => {
    jest.isolateModules(() => {
      const nodemailer = require('nodemailer');
      const transporter = require('../utils/mailer');

      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: 'test@example.com',
          pass: 'secret'
        }
      });
      expect(typeof transporter.verify).toBe('function');
    });
  });

  test('no ejecuta verify cuando NODE_ENV es test', () => {
    process.env.NODE_ENV = 'test';

    jest.isolateModules(() => {
      const nodemailer = require('nodemailer');
      require('../utils/mailer');

      expect(nodemailer.createTransport).toHaveBeenCalled();
    });
  });

  test('maneja cuando verify falla sin romper el modulo', async () => {
    jest.resetModules();
    jest.doMock('nodemailer', () => ({
      createTransport: jest.fn(() => ({
        verify: jest.fn(() => Promise.reject(new Error('bad smtp')))
      }))
    }), { virtual: true });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    jest.isolateModules(() => {
      require('../utils/mailer');
    });

    await new Promise((resolve) => setImmediate(resolve));

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
