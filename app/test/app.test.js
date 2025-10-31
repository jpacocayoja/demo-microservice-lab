const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../index.js');
const client = require('../connection/redis.js');

// Helper para hacer requests HTTP
async function makeRequest(method, path, body = null, port) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port,
      path,
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {}
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
    });

    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

// 🧹 Limpiamos Redis antes de iniciar los tests
test.before(async () => {
  await client.flushAll();
});

// Test 1: Verifica que se pueda crear un nuevo contenido
test('POST /contents → debe agregar un nuevo contenido', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  const response = await makeRequest('POST', '/contents', { name: 'Contenido de prueba' }, port);

  await new Promise((r) => server.close(r));

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.content.name, 'Contenido de prueba');
  assert.ok(response.body.content.id);
});

// Test 2: Verifica que se puedan listar los contenidos
test('GET /contents → debe listar los contenidos agregados', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  const response = await makeRequest('GET', '/contents', null, port);

  await new Promise((r) => server.close(r));

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.ok(Array.isArray(response.body.contents));
  assert.equal(response.body.contents.length > 0, true);
});

// Test 3: Verifica que se pueda eliminar un contenido existente
test('DELETE /contents/:id → debe eliminar un contenido existente', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  // Primero crea un contenido para eliminar
  const create = await makeRequest('POST', '/contents', { name: 'Eliminar este' }, port);
  const id = create.body.content.id;

  // Elimina el contenido creado
  const del = await makeRequest('DELETE', `/contents/${id}`, null, port);

  await new Promise((r) => server.close(r));

  assert.equal(del.status, 200);
  assert.equal(del.body.success, true);
  assert.equal(del.body.message, 'Contenido eliminado correctamente');
});

// Test 4: Verifica que devuelva 404 al intentar eliminar un contenido inexistente
test('DELETE /contents/:id → debe retornar 404 si el contenido no existe', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  const response = await makeRequest('DELETE', '/contents/noexiste', null, port);

  await new Promise((r) => server.close(r));

  assert.equal(response.status, 404);
  assert.equal(response.body.success, false);
  assert.equal(response.body.message, 'Contenido no encontrado');
});


// Teardown: cerramos la conexión a Redis para que el process termine en CI
test.after(async () => {
  try {
    if (client && typeof client.quit === 'function') {
      await client.quit();
      console.log('Redis quit() ejecutado en teardown de tests');
    } else if (client && typeof client.disconnect === 'function') {
      await client.disconnect();
      console.log('Redis disconnect() ejecutado en teardown de tests');
    } else {
      console.log('Redis client no tiene quit() ni disconnect(), omitiendo cierre.');
    }
  } catch (err) {
    console.warn('Warning: error cerrando Redis en teardown:', err && err.message ? err.message : err);
  }
});