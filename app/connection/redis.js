const { createClient } = require('redis');

const DEFAULT_PORT = 6379;
const envUrl = process.env.REDIS_URL;
const envHost = process.env.REDIS_HOST;
const envPort = process.env.REDIS_PORT || DEFAULT_PORT;

// Helper
const isFullRedisUrl = (s) => typeof s === 'string' && /^redis(?:s)?:\/\//i.test(s);
const stripTrailingSlashes = (s) => (typeof s === 'string' ? s.replace(/\/+$/, '') : s);

// Decide options safely
let client;
try {
  if (isFullRedisUrl(envUrl)) {
    const url = stripTrailingSlashes(envUrl);
    console.log('Redis: using full URL ->', url);
    client = createClient({ url });
  } else {
    // envUrl puede ser "host:port", "host" o undefined
    let host = envHost || '127.0.0.1';
    let port = Number(envPort);

    if (envUrl) {
      const maybe = envUrl.trim();
      if (maybe.includes(':')) {
        const [h, p] = maybe.split(':');
        if (h) host = h;
        if (p && !Number.isNaN(Number(p))) port = Number(p);
      } else if (maybe.length) {
        host = maybe;
      }
    }

    console.log(`Redis: using socket -> ${host}:${port}`);
    client = createClient({
      socket: {
        host,
        port,
      },
    });
  }
} catch (err) {
  // Fallback seguro
  console.error('Redis: error creando cliente, fallback a socket 127.0.0.1:6379', err && err.message);
  client = createClient({ socket: { host: '127.0.0.1', port: DEFAULT_PORT } });
}

client.on('error', (err) => console.error('Error en Redis:', err));
client.on('ready', () => console.log('Conectado a Redis'));

(async () => {
  try {
    await client.connect();
  } catch (err) {
    console.error('Error al conectar Redis (se continúa sin Redis):', err && err.message ? err.message : err);
    // no hacemos throw para no romper tests/CI automáticamente
  }
})();

module.exports = client;
