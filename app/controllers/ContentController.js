const shortid = require('shortid');
const client = require('../connection/redis');

/**
 *  Listar todos los contenidos
 */
const findContents= async (req, res) => {
    try {
        // Obtener todos los IDs guardados
        const ids = await client.lRange('contents', 0, -1);

        if (!ids || ids.length === 0) {
            return res.status(200).json({ success: true, contents: [] });
        }

        // Obtener cada contenido por su clave
        const contents = [];
        for (const id of ids) {
            const data = await client.hGetAll(`content:${id}`);
            if (Object.keys(data).length > 0) {
                contents.push(data);
            }
        }

        return res.json({ success: true, contents });
    } catch (error) {
        console.error('Error al listar contenidos:', error);
        return res.status(500).json({ success: false, message: 'Error al listar contenidos' });
    }
};

/**
 *  Agregar contenido
 */
const addContent = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || name.trim() === '') {
            return res.status(400).json({ success: false, message: 'El name es obligatorio' });
        }

        const id = shortid.generate();

        // Guardar el contenido
        await client.hSet(`content:${id}`, {
            id,
            name
        });

        // Agregar el id a la lista
        await client.rPush('contents', id);

        return res.json({ success: true, message: 'Contenido agregado correctamente', content: { id, name } });
    } catch (error) {
        console.error('Error al agregar contenido:', error);
        return res.status(500).json({ success: false, message: 'Error al agregar contenido' });
    }
};

/**
 *  Eliminar contenido
 */
const destroyContent = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que exista
        const exist = await client.exists(`content:${id}`);
        if (!exist) {
            return res.status(404).json({ success: false, message: 'Contenido no encontrado' });
        }

        // Eliminar el contenido
        await client.del(`content:${id}`);

        // Quitar el id de la lista principal
        await client.lRem('contents', 0, id);

        return res.json({ success: true, message: 'Contenido eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar contenido:', error);
        return res.status(500).json({ success: false, message: 'Error al eliminar contenido' });
    }
};

module.exports = {
    findContents,
    addContent,
    destroyContent
};
