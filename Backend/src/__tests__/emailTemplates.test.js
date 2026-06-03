const {
  getWelcomeTemplate,
  getPasswordResetTemplate,
  getAppointmentTemplate,
  getStatusUpdateTemplate
} = require('../utils/emailTemplates');

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

  test('la plantilla de cita formatea la fecha y la especialidad', () => {
    const html = getAppointmentTemplate('Ana', '2026-05-23T08:00:00.000Z', 'General');

    expect(html).toContain('Ana');
    expect(html).toContain('General');
    expect(html).toContain('Cita Confirmada');
  });

  test('la plantilla de estado incluye el nuevo estado', () => {
    const html = getStatusUpdateTemplate('Ana', '2026-05-23T08:00:00.000Z', 'General', 'cancelada');

    expect(html).toContain('Ana');
    expect(html).toContain('General');
    expect(html).toContain('cancelada');
  });
});
