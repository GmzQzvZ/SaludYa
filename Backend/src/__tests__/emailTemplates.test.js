const { getWelcomeTemplate, getPasswordResetTemplate } = require('../utils/emailTemplates');

describe('emailTemplates', () => {
  test('la plantilla de bienvenida incluye el nombre', () => {
    const html = getWelcomeTemplate('Ana');

    expect(html).toContain('Ana');
    expect(html).toContain('Iniciar Sesión');
    expect(html).toContain('logo_saludya');
  });

  test('la plantilla de restablecimiento incluye el enlace', () => {
    const html = getPasswordResetTemplate('Luis', 'http://localhost/reset');

    expect(html).toContain('Luis');
    expect(html).toContain('http://localhost/reset');
    expect(html).toContain('Restablecer Contraseña');
  });
});
