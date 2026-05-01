document.addEventListener('DOMContentLoaded', () => {
    const toggleLoginBtn = document.getElementById('toggleLogin');
    const formTitle = document.getElementById('formTitle');
    const userGroup = document.getElementById('userGroup');
    const confirmGroup = document.getElementById('confirmGroup');
    const submitBtn = document.getElementById('submitBtn');
    
    let isLoginView = false;

    // Toggle between Register and Login form
    toggleLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        isLoginView = !isLoginView;

        if (isLoginView) {
            // Switch to Login View
            formTitle.textContent = 'INICIAR SESIÓN';
            userGroup.style.display = 'none';
            confirmGroup.style.display = 'none';
            submitBtn.textContent = 'INGRESAR';
            toggleLoginBtn.textContent = 'Crea una cuenta aquí';
            toggleLoginBtn.previousElementSibling.textContent = '¿No tienes una cuenta?';
        } else {
            // Switch to Register View
            formTitle.textContent = 'CREAR CUENTA';
            userGroup.style.display = 'block';
            confirmGroup.style.display = 'block';
            submitBtn.textContent = 'CREAR CUENTA';
            toggleLoginBtn.textContent = 'Inicia sesión aquí';
            toggleLoginBtn.previousElementSibling.textContent = 'Tienes una cuenta?';
        }
    });

    // Form submission handler
    const authForm = document.getElementById('authForm');
    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (isLoginView) {
            console.log('Intentando iniciar sesión con:', { email, password });
            alert('Funcionalidad de inicio de sesión próximamente');
        } else {
            const username = document.getElementById('username').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password !== confirmPassword) {
                alert('Las contraseñas no coinciden');
                return;
            }
            
            console.log('Intentando crear cuenta con:', { username, email, password });
            alert('Funcionalidad de registro próximamente');
        }
    });
});
