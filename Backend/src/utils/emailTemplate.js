const getWelcomeTemplate = (nombre) => {
    const content = `
<h2>¡Hola ${nombre}!</h2>
<p>Tu cuenta ha sido creada con éxito. Estamos felices de tenerte con nosotros para cuidar de tu salud.</p>
<center><a href="http://localhost:3000/login.html" class="button">Iniciar Sesión</a></center>
    `;
    return getBaseTemplate(content, "¡Bienvenido a SaludYa!");
};

const getPasswordResetTemplate = (nombre, resetLink) => {
    const content = `
<h2>Recuperación de Contraseña</h2>
<p>Hola ${nombre}, hemos recibido una solicitud para restablecer tu contraseña.</p>
<p>Si no fuiste tú, puedes ignorar este correo. Si deseas continuar, haz clic en el siguiente botón:</p>
<center><a href="${resetLink}" class="button">Restablecer Contraseña</a></center>
<p>Este enlace expirará en 1 hora.</p>
    `;
    return getBaseTemplate(content, "Seguridad SaludYa");
};

module.exports = { getWelcomeTemplate, getPasswordResetTemplate };