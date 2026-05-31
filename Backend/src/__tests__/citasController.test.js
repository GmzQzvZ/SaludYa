jest.mock('../config/db', () => ({
  query: jest.fn()
}));

jest.mock('uuid', () => ({
  v4: jest.fn()
}));

jest.mock('../utils/mailer', () => ({
  sendMail: jest.fn()
}));

const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const transporter = require('../utils/mailer');
const citasController = require('../controllers/citasController');

function createRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('citasController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('crearCita rechaza campos requeridos vacios', async () => {
    const req = { body: {}, usuario: { id: 'u-1' } };
    const res = createRes();
    await citasController.crearCita(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('crearCita detecta conflicto de horario', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id_cita: 'c-1' }] });
    const req = { body: { fecha_hora: '2026-05-23 08:00:00', motivo: 'General' }, usuario: { id: 'u-1' } };
    const res = createRes();
    await citasController.crearCita(req, res);
    expect(res.status).toHaveBeenCalledWith(409);
  });

  test('crearCita inserta una cita programada', async () => {
    db.query.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [{ nombre: 'Ana', email: 'ana@test.com' }] });
    uuidv4.mockReturnValue('cita-1');
    const req = { body: { fecha_hora: '2026-05-23 08:00:00', motivo: 'General' }, usuario: { id: 'u-1' } };
    const res = createRes();
    await citasController.crearCita(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(transporter.sendMail).toHaveBeenCalled();
  });

  test('crearCita continua si no encuentra correo del paciente', async () => {
    db.query.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [] });
    uuidv4.mockReturnValue('cita-1');
    const req = { body: { fecha_hora: '2026-05-23 08:00:00', motivo: 'General' }, usuario: { id: 'u-1' } };
    const res = createRes();
    await citasController.crearCita(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('crearCita responde con error interno si la consulta falla', async () => {
    db.query.mockRejectedValueOnce(new Error('db down'));
    const req = { body: { fecha_hora: '2026-05-23 08:00:00', motivo: 'General' }, usuario: { id: 'u-1' } };
    const res = createRes();
    await citasController.crearCita(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('obtenerTodasCitas retorna los resultados', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id_cita: 'c-1' }] });
    const res = createRes();
    await citasController.obtenerTodasCitas({}, res);
    expect(res.json).toHaveBeenCalledWith([{ id_cita: 'c-1' }]);
  });

  test('obtenerTodasCitas responde con error interno cuando falla', async () => {
    db.query.mockRejectedValueOnce(new Error('db down'));
    const res = createRes();
    await citasController.obtenerTodasCitas({}, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('obtenerMisCitas usa el id del usuario autenticado', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id_cita: 'c-1' }] });
    const req = { usuario: { id: 'u-1' } };
    const res = createRes();
    await citasController.obtenerMisCitas(req, res);
    expect(res.json).toHaveBeenCalledWith([{ id_cita: 'c-1' }]);
  });

  test('obtenerMisCitas responde con error cuando falla la consulta', async () => {
    db.query.mockRejectedValueOnce(new Error('db down'));
    const req = { usuario: { id: 'u-1' } };
    const res = createRes();
    await citasController.obtenerMisCitas(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('actualizarEstado rechaza estados no permitidos', async () => {
    const req = { params: { id_cita: 'c-1' }, body: { nuevoEstado: 'invalido' } };
    const res = createRes();
    await citasController.actualizarEstado(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('actualizarEstado persiste un estado valido', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    db.query.mockResolvedValueOnce({ rows: [{ fecha_hora: '2026-05-23 08:00:00', motivo: 'General', nombre: 'Test User', email: 'test@example.com' }] });
    const req = { params: { id_cita: 'c-1' }, body: { nuevoEstado: 'cancelada' } };
    const res = createRes();
    await citasController.actualizarEstado(req, res);
    expect(res.json).toHaveBeenCalledWith({ message: 'Estado actualizado y correo enviado' });
  });

  test('actualizarEstado continua si no encuentra datos para el correo', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    db.query.mockResolvedValueOnce({ rows: [] });
    const req = { params: { id_cita: 'c-1' }, body: { nuevoEstado: 'cancelada' } };
    const res = createRes();
    await citasController.actualizarEstado(req, res);
    expect(res.json).toHaveBeenCalledWith({ message: 'Estado actualizado y correo enviado' });
  });

  test('actualizarEstado maneja error al enviar correo', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    db.query.mockResolvedValueOnce({ rows: [{ fecha_hora: '2026-05-23 08:00:00', motivo: 'General', nombre: 'Test User', email: 'test@example.com' }] });
    transporter.sendMail.mockRejectedValueOnce(new Error('mail down'));
    const req = { params: { id_cita: 'c-1' }, body: { nuevoEstado: 'cancelada' } };
    const res = createRes();
    await citasController.actualizarEstado(req, res);
    expect(res.json).toHaveBeenCalledWith({ message: 'Estado actualizado y correo enviado' });
  });

  test('actualizarEstado responde con error cuando la consulta falla', async () => {
    db.query.mockRejectedValueOnce(new Error('db down'));
    const req = { params: { id_cita: 'c-1' }, body: { nuevoEstado: 'cancelada' } };
    const res = createRes();
    await citasController.actualizarEstado(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
