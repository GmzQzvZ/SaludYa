const { loadScript, flushPromises } = require('./testHelpers');

describe('doctor_cronograma.js', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    document.body.innerHTML = `
      <div id="calendar"></div>
      <button class="schedule-report-btn"></button>
    `;
    window.CitasStore = {
      fetchAll: jest.fn(() => Promise.resolve([
        {
          id_cita: 'c-1',
          especialidad: 'General',
          paciente: 'Ana',
          estado: 'cancelada',
          fecha_hora: '2026-05-23T08:00:00.000Z'
        }
      ])),
      subscribe: jest.fn(() => () => {})
    };
    global.Blob = jest.fn(function(parts, options) {
      this.parts = parts;
      this.options = options;
    });
    global.URL.createObjectURL = jest.fn(() => 'blob:url');
    global.URL.revokeObjectURL = jest.fn();
    const calendarApi = {
      render: jest.fn(),
      removeAllEvents: jest.fn(),
      addEventSource: jest.fn()
    };
    window.FullCalendar = {
      Calendar: jest.fn(() => calendarApi)
    };
  });

  test('carga las citas en el calendario con colores por estado', async () => {
    loadScript('../doctor_cronograma.js');

    document.dispatchEvent(new Event('DOMContentLoaded'));
    await flushPromises();

    expect(window.FullCalendar.Calendar).toHaveBeenCalled();
    const calendarApi = window.FullCalendar.Calendar.mock.results[0].value;
    expect(calendarApi.render).toHaveBeenCalled();
    expect(calendarApi.removeAllEvents).toHaveBeenCalled();
    expect(calendarApi.addEventSource).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 'c-1',
        title: 'General - Ana - CANCELADA',
        backgroundColor: '#dc3545',
        borderColor: '#dc3545',
        textColor: '#000'
      })
    ]);
  });

  test('sale temprano si no hay calendario o FullCalendar', async () => {
    document.body.innerHTML = '';
    window.FullCalendar = undefined;

    loadScript('../doctor_cronograma.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    expect(window.CitasStore.fetchAll).not.toHaveBeenCalled();
  });

  test('soporta errores al cargar citas', async () => {
    window.CitasStore.fetchAll.mockRejectedValueOnce(new Error('db down'));

    loadScript('../doctor_cronograma.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await flushPromises();

    expect(window.CitasStore.fetchAll).toHaveBeenCalled();
  });

  test('renderiza el contenido personalizado de los eventos', async () => {
    loadScript('../doctor_cronograma.js');

    document.dispatchEvent(new Event('DOMContentLoaded'));
    await flushPromises();

    const calendarOptions = window.FullCalendar.Calendar.mock.calls[0][1];
    const rendered = calendarOptions.eventContent({
      event: {
        title: 'General - Ana - CANCELADA'
      }
    });

    expect(rendered.domNodes).toHaveLength(1);
    expect(rendered.domNodes[0].querySelector('.fc-event-title').textContent).toBe(
      'General - Ana - CANCELADA'
    );
  });

  test('usa colores por defecto cuando el estado es desconocido', async () => {
    window.CitasStore.fetchAll.mockResolvedValueOnce([{
      id_cita: 'c-2',
      especialidad: 'Dermatologia',
      paciente: '',
      estado: 'pendiente-raro',
      fecha_hora: '2026-05-23T10:00:00.000Z'
    }]);

    loadScript('../doctor_cronograma.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await flushPromises();

    const calendarApi = window.FullCalendar.Calendar.mock.results[0].value;
    expect(calendarApi.addEventSource).toHaveBeenCalledWith([
      expect.objectContaining({
        backgroundColor: '#6c757d',
        borderColor: '#6c757d',
        textColor: '#fff'
      })
    ]);
  });

  test('genera y descarga el reporte CSV', async () => {
    loadScript('../doctor_cronograma.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await flushPromises();

    document.querySelector('.schedule-report-btn').click();
    await flushPromises();

    expect(global.Blob).toHaveBeenCalled();
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:url');
  });

  test('no falla si no existe el boton de reporte', async () => {
    document.body.innerHTML = `<div id="calendar"></div>`;

    loadScript('../doctor_cronograma.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await flushPromises();

    expect(window.CitasStore.subscribe).toHaveBeenCalled();
  });
});
