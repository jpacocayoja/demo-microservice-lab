const { Router } = require('express');
const router = Router();

router.get('/', (req, res) => {
    res.send(`
        <h1>📦 Bienvenido a la API de Contenidos</h1>
        <p>Esta API te permite listar, agregar y eliminar contenidos almacenados.</p>
        
        <h2>💡 Endpoints disponibles:</h2>
        
        <h3>⿡ Listar todos los contenidos</h3>
        <pre>
GET /contents
        </pre>
        <p>Devuelve una lista con todos los contenidos almacenados.</p>

        <h3>⿢ Agregar un nuevo contenido</h3>
        <pre>
POST /contents
Content-Type: application/json

{
  "name": "Mi nuevo contenido"
}
        </pre>
        <p>Agrega un nuevo contenido con un <strong>ID generado automáticamente</strong>.</p>

        <h3>⿣ Eliminar un contenido</h3>
        <pre>
DELETE /contents/:id
        </pre>
        <p>Elimina un contenido existente según su ID.</p>

        <h3>🧾 Ejemplo de respuesta al agregar:</h3>
        <pre>
{
  "success": true,
  "message": "Contenido agregado correctamente",
  "content": {
    "id": "Hk2xY_1z",
    "name": "Mi nuevo contenido"
  }
}
        </pre>

        <p>⚠ Nota: El campo <strong>name</strong> es obligatorio y no puede estar vacío.</p>
    `);
});

module.exports = router;