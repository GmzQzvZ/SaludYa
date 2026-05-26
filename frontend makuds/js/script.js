document.addEventListener('DOMContentLoaded', () => {
    const backend = window.MockBackend;
    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Evita que la página recargue
            const isLogin = document.getElementById('formTitle').textContent.includes('INICIAR');

            if (isLogin) {
                // --- LÓGICA DE INICIO DE SESIÓN ---
                // Tu HTML de login usa el id "username", pero en BD es un email
                const email = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                const selectedRole = document.querySelector('input[name="role"]:checked')?.value || 'especialista';
                const expectedRole = selectedRole === 'afiliado' ? 'paciente' : 'especialista';

                try {
                    const data = backend.api.login({ email, password });
                    const userRole = data.usuario?.rol || 'paciente';

                    if (userRole !== expectedRole) {
                        AlertSystem.error('El rol seleccionado no coincide con tu cuenta');
                        return;
                    }

                    AlertSystem.success('Inicio de sesión exitoso', 'Bienvenido a SaludYa', () => {
                        localStorage.setItem('token', data.token);
                        localStorage.setItem('usuario', JSON.stringify(data.usuario));
                        const redirectUrl = userRole === 'especialista'
                            ? 'views/Doctor/cronograma_citas.html'
                            : 'views/Patient/citas.html';
                        window.location.href = redirectUrl;
                    });
                } catch (error) {
                    AlertSystem.error('Error: ' + error.message);
                }

            } else {
                // --- LÓGICA DE REGISTRO ---
                const nombre = document.getElementById('username').value;
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                const confirmPassword = document.getElementById('confirmPassword').value;

                if (password !== confirmPassword) {
                    AlertSystem.error('Contraseñas no coinciden');
                    return;
                }

                try {
                    backend.api.register({ nombre, email, password, rol: 'paciente' });
                    AlertSystem.success('¡Cuenta creada exitosamente!', 'Ahora puedes iniciar sesión.', () => {
                        window.location.href = 'login.html';
                    });
                } catch (error) {
                    AlertSystem.error('Error: ' + error.message);
                }
            }
        });
    }

    // --- LÓGICA DE RECUPERACIÓN DE CONTRASEÑA ---
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const submitBtn = document.getElementById('submitBtn');

            // Deshabilitar botón para evitar múltiples envíos
            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';

                try {
                    backend.api.forgotPassword({ email });
                    const resetToken = Object.keys(JSON.parse(localStorage.getItem('saludya:mock:recovery') || '{}')).pop();
                    AlertSystem.success('Envío de recuperación de contraseña exitoso', `Usa este token local para continuar: ${resetToken}`, () => {
                        window.location.assign(`cambio_contrasena.html?token=${encodeURIComponent(resetToken)}`);
                    });
                } catch (error) {
                    AlertSystem.error('Error', error.message);
                } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'ENVIAR ENLACE';
            }
        });
    }

    // --- SEGURIDAD: CONTROL DE SESIÓN (FIXED PARA EVITAR LOOP) ---
    const currentPath = window.location.pathname;
    const isPublicPage = currentPath.includes('login.html') ||
        currentPath.includes('registro.html') ||
        currentPath.includes('olvido_contrasena.html') ||
        currentPath.includes('cambio_contrasena.html') ||
        currentPath === '/';

    const usuarioData = localStorage.getItem('usuario');
    const token = localStorage.getItem('token');

    if (!isPublicPage) {
        // Si es una página privada y no hay token, redirigir
        if (!usuarioData || !token) {
            window.location.href = '../../login.html';
            return;
        }

        // Mostrar nombre en el sidebar si existe el elemento
        const nameDisplay = document.getElementById('userNameDisplay');
        if (nameDisplay && usuarioData) {
            const usuario = JSON.parse(usuarioData);
            nameDisplay.textContent = usuario.nombre || 'Usuario';
        }
    } else {
        // Si estamos en login y ya hay sesión, podemos redirigir al dashboard
        if (usuarioData && token && currentPath.includes('login.html')) {
            window.location.href = 'views/Patient/citas.html';
        }
    }

    const logoutBtn = document.querySelector('a[href="../../login.html"]');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            localStorage.clear(); // Borra token y datos de usuario
        });
    }

    // --- LÓGICA DE CAMBIO DE CONTRASEÑA (RESETEO REAL) ---
    const recoveryForm = document.getElementById('recoveryForm');
    if (recoveryForm) {
        recoveryForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const submitBtn = document.getElementById('submitBtn');

            // 1. Validar que las contraseñas coincidan
            if (newPassword !== confirmPassword) {
                AlertSystem.error('Error', 'Las contraseñas no coinciden. Intenta de nuevo.');
                return;
            }

            // 2. Extraer el token de la URL (ej: ?token=abcd-1234)
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');

            if (!token) {
                AlertSystem.error('Error', 'No se encontró un token de recuperación válido.');
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Actualizando...';

            try {
                // 3. Enviar la petición al nuevo Endpoint
                try {
                    backend.api.resetPassword({ token, newPassword });
                    // Limpiar la URL por seguridad (quitar el token visible)
                    window.history.replaceState({}, document.title, window.location.pathname);

                    AlertSystem.success('¡Éxito!', 'Tu contraseña se ha actualizado correctamente.', () => {
                        window.location.href = 'login.html'; // Redirigir al login
                    });
                } catch (error) {
                    AlertSystem.error('Error', error.message);
                }
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Confirmar';
            }
        });
    }
});
