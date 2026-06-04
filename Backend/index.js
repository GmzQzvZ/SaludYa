const app = require('../api/index');

const PORT = process.env.PORT || 3000;

if (require.main === module) {
    const server = app.listen(PORT, () => {
        console.log(`Servidor corriendo en el puerto ${PORT}`);
    });

    // Mantiene vivo el proceso en algunos entornos donde stdin se cierra de inmediato.
    // No afecta a Vercel porque este archivo no se usa allí.
    if (process.stdin.isTTY) {
        process.stdin.resume();
    }

    process.on('SIGTERM', () => server.close(() => process.exit(0)));
    process.on('SIGINT', () => server.close(() => process.exit(0)));
}

module.exports = app;
