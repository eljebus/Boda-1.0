const fs = require('fs');
const path = require('path');

const webPush = require('web-push');
const SUBS_FILE = path.join(__dirname, '..', 'publicos', 'clientes.json');
const VAPID_FILE = path.join(__dirname, '..', 'vapid-keys.json');

const VAPID_SUBJECT = 'mailto:jesus.martinez.glez.96@gmail.com';

// Cargar o generar claves VAPID
let VAPID_KEYS;
try {
    if (fs.existsSync(VAPID_FILE)) {
        VAPID_KEYS = JSON.parse(fs.readFileSync(VAPID_FILE, 'utf-8'));
        console.log('Claves VAPID cargadas del archivo');
    } else {
        VAPID_KEYS = webPush.generateVAPIDKeys();
        fs.writeFileSync(VAPID_FILE, JSON.stringify(VAPID_KEYS, null, 2));
        console.log('Nuevas claves VAPID generadas y guardadas');
    }

    console.log('VAPID configurado con clave pública:', VAPID_KEYS.publicKey);

    webPush.setVapidDetails(
        VAPID_SUBJECT,
        VAPID_KEYS.publicKey,
        VAPID_KEYS.privateKey
    );
} catch (error) {
    console.error('Error al configurar VAPID:', error);
    process.exit(1);
}

const cloudinary = require('cloudinary').v2;

// Asegúrate de haber configurado Cloudinary previamente
cloudinary.config({
    cloud_name: 'drbrixx6j',  // Reemplaza con tu Cloud Name
    api_key: '567499117882323',        // Reemplaza con tu API Key
    api_secret: 'uMvjfUSl13P3incKZ_oJGx9Mi1Q'   // Reemplaza con tu API Secret
});

// ... (imports se mantienen igual)

exports.index = async (req, res) => {
    try {
      

    res.render('layout', { 
        title: 'Fatima & Jesus', 
        content: 'index'
    });
    } catch (error) {
        console.error('Error al cargar la página principal:', error);
        res.render('layout', { 
            title: 'Fatima & Jesus', 
            content: 'index'
        });
    }
};

exports.plan = async (req, res) => {
    res.render('layout', { 
        title   : 'Alumno', 
        content : 'plan'
    });
};

exports.uploadFoto = async (req, res) => {
    console.log(req.file);
    res.status(200).send('OK');
};

exports.getDeseos = async (req, res) => {
    try {
        const deseosPath = path.join(__dirname, '..', '/publicos/deseos.json');
        let deseos = [];

        if (fs.existsSync(deseosPath)) {
            const data = await fs.promises.readFile(deseosPath, 'utf-8');
            deseos = JSON.parse(data);
        }

        // Configurar headers para evitar caché
        res.set({
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Surrogate-Control': 'no-store'
        });

        res.json(deseos);
    } catch (error) {
        console.error('Error al leer el archivo de deseos:', error);
        res.status(500).json({ error: 'Error al cargar los textos' });
    }
};

const moment = require('moment-timezone');  // Asegúrate de requerir moment-timezone

exports.album = async (req, res) => {
    // Configurar la fecha objetivo con la zona horaria de Ciudad de México
    const fechaObjetivo = moment.tz('2025-04-16T17:00:00', 'America/Mexico_City');
    const ahora = moment().tz('America/Mexico_City'); // Obtener la hora actual en CDMX

    if (ahora.isBefore(fechaObjetivo)) {
        return res.render('layout', {
            title: 'Álbum',
            content: 'album',
            mensaje: 'Esta función estará disponible el día de nuestra boda'
        });
    }

    try {
        const result = await cloudinary.search
            .expression('folder:Fotos')
            .sort_by('created_at', 'desc')
            .max_results(60)
            .execute();

        let fotos = result.resources.map(img => img.secure_url);

        if (req.query.nueva && !fotos.includes(req.query.nueva)) {
            fotos.unshift(req.query.nueva);
        }

        res.render('layout', { title: 'Álbum', content: 'album', fotos });
    } catch (error) {
        console.error('Error al obtener imágenes desde Cloudinary:', error);
        res.status(500).send('Error cargando el álbum');
    }
};

exports.textos = async (req, res) => {
    // Configurar la fecha objetivo con la zona horaria de Ciudad de México
    const fechaObjetivo = moment.tz('2025-04-16T17:00:00', 'America/Mexico_City');
    const ahora = moment().tz('America/Mexico_City'); // Obtener la hora actual en CDMX

    if (ahora.isBefore(fechaObjetivo)) {
        return res.render('layout', {
            title: 'Textos',
            content: 'textos',
            mensaje: 'Esta función estará disponible el día de nuestra boda'
        });
    }

    try {
        const deseosPath = path.join(__dirname, '..', '/publicos/deseos.json');
        let deseos = [];

        if (fs.existsSync(deseosPath)) {
            const data = await fs.promises.readFile(deseosPath, 'utf-8');
            deseos = JSON.parse(data);
        }

        // Configurar headers para evitar caché
        res.set({
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Surrogate-Control': 'no-store'
        });

        res.render('layout', { 
            title   : 'Textos', 
            content : 'textos',
            deseos  : deseos
        });
    } catch (error) {
        console.error('Error al leer el archivo de deseos:', error);
        res.status(500).send('Error al cargar los textos');
    }
};


exports.saveText = async (req, res) => {
    console.log(req.body);
    try {
        const { nombre, deseo } = req.body;

        if (!nombre || !deseo) {
            return res.status(400).send('Nombre y deseo son requeridos');
        }

        const deseosPath = path.join(__dirname, '..', '/publicos/deseos.json');
        let deseos = [];

        if (fs.existsSync(deseosPath)) {
            const data = await fs.promises.readFile(deseosPath, 'utf-8');
            deseos = JSON.parse(data);
        }

        // Add the new entry
        deseos.push({ nombre, deseo, fecha: new Date().toISOString() });

        // Save the updated list back to the file
        await fs.promises.writeFile(deseosPath, JSON.stringify(deseos, null, 2));

        res.status(200).send('Deseo guardado exitosamente');
    } catch (error) {
        console.error('Error al guardar el deseo:', error);
        res.status(500).send('Error al guardar el deseo');
    }
};


// Función para cargar suscripciones
async function loadSubscriptions() {
    try {
    
        // Si el archivo no existe, crearlo con un array vacío
        if (!fs.existsSync(SUBS_FILE)) {
            await fs.promises.writeFile(SUBS_FILE, '[]', 'utf-8');
            console.log('Archivo de suscripciones creado');
            return [];
        }

        // Leer el archivo
        const data = await fs.promises.readFile(SUBS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error al cargar suscripciones:', error);
        throw new Error('Error al cargar suscripciones: ' + error.message);
    }
}

// Función para guardar suscripciones
async function saveSubscriptions(subscriptions) {
    try {
        // Asegurarse de que el directorio existe
        const dataDir = path.join(__dirname, '..', 'publicos');
        if (!fs.existsSync(dataDir)) {
            await fs.promises.mkdir(dataDir, { recursive: true });
            console.log('Directorio publicos creado');
        }

        // Guardar las suscripciones
        await fs.promises.writeFile(SUBS_FILE, JSON.stringify(subscriptions, null, 2), 'utf-8');
        console.log('Suscripciones guardadas correctamente');
    } catch (error) {
        console.error('Error al guardar suscripciones:', error);
        throw new Error('Error al guardar suscripciones: ' + error.message);
    }
}

// Función para guardar una nueva suscripción
exports.savePushSubscription = async function(req, res) {
    try {
        console.log('Recibiendo nueva suscripción');
        const subscription = req.body;
        
        if (!subscription || !subscription.endpoint) {
            console.error('Suscripción inválida:', subscription);
            return res.status(400).json({ 
                error: 'Suscripción inválida',
                details: 'La suscripción debe contener un endpoint'
            });
        }

        console.log('Suscripción recibida:', subscription);

     
        let subscriptions = [];
        if (fs.existsSync(SUBS_FILE)) {
            try {
                const data = await fs.promises.readFile(SUBS_FILE, 'utf-8');
                subscriptions = JSON.parse(data);
                console.log('Suscripciones existentes cargadas:', subscriptions.length);
            } catch (error) {
                console.error('Error al leer suscripciones existentes:', error);
                // Si hay error al leer, continuar con array vacío
            }
        }

        // Verificar si la suscripción ya existe
        const exists = subscriptions.some(sub => 
            sub.endpoint === subscription.endpoint
        );

        if (!exists) {
            // Añadir fecha de suscripción
            subscription.fecha = new Date().toISOString();
            subscriptions.push(subscription);
            
            try {
                console.log('Guardando suscripciones en el archivo:', SUBS_FILE);
                await fs.promises.writeFile(SUBS_FILE, JSON.stringify(subscriptions, null, 2), 'utf-8');
                console.log('Nueva suscripción guardada');

                // Enviar notificación de bienvenida
                try {
                    const payload = JSON.stringify({
                        title: '¡Bienvenido!',
                        body: 'Gracias por suscribirte a nuestras notificaciones.',
                        icon: `https://${req.headers.host}/img/icon-192x192.png`,
                        badge: `https://${req.headers.host}/img/icon-192x192.png`,
                        vibrate: [100, 50, 100]
                    });

                    await webPush.sendNotification(subscription, payload);
                    console.log('Notificación de bienvenida enviada');
                } catch (error) {
                    console.error('Error al enviar notificación de bienvenida:', error);
                    // No fallar si hay error al enviar la notificación
                }

                return res.status(201).json({ 
                    message: 'Suscripción guardada correctamente',
                    subscription
                });
            } catch (error) {
                console.error('Error al guardar suscripción:', error);
                return res.status(500).json({ 
                    error: 'Error al guardar la suscripción',
                    details: error.message
                });
            }
        } else {
            console.log('Suscripción ya existe');
            return res.status(200).json({ 
                message: 'Suscripción ya existe',
                subscription
            });
        }
    } catch (error) {
        console.error('Error al procesar suscripción:', error);
        return res.status(500).json({ 
            error: 'Error al procesar la suscripción',
            details: error.message
        });
    }
};

// Función para enviar notificación a todos los suscriptores
exports.sendPushToAll = async function(req, res) {
    try {
        const { title, body, image } = req.body;
        
        if (!title || !body) {
            return res.status(400).json({ 
                error: 'Datos inválidos',
                details: 'El título y el cuerpo son requeridos'
            });
        }

        // Cargar suscripciones
        const subscriptions = await loadSubscriptions();
        if (subscriptions.length === 0) {
            return res.status(200).json({ 
                message: 'No hay suscriptores para enviar notificación'
            });
        }

        // Preparar el payload
        const payload = JSON.stringify({
            title: title,
            body: body,
            icon: image || '/img/icon-192x192.png',
            badge: '/img/icon-192x192.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: '1',
                url: '/'
            },
            actions: [{
                action: 'explore',
                title: 'Ver más'
            }]
        });

        // Enviar notificación a cada suscriptor
        const results = await Promise.allSettled(
            subscriptions.map(subscription => 
                webPush.sendNotification(subscription, payload)
                    .then(() => ({ success: true, endpoint: subscription.endpoint }))
                    .catch(error => ({ success: false, endpoint: subscription.endpoint, error: error.message }))
            )
        );

        const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
        const failed = results.filter(r => r.status === 'fulfilled' && !r.value.success).length;

        res.status(200).json({
            message: `Notificación enviada a ${successful} suscriptores`,
            details: {
                total: subscriptions.length,
                successful,
                failed
            }
        });

    } catch (error) {
        console.error('Error al enviar notificación:', error);
        res.status(500).json({ 
            error: 'Error al enviar notificación',
            details: error.message
        });
    }
};

// Función para obtener la clave pública VAPID
exports.getVapidPublicKey = function(req, res) {
    res.json({ publicKey: VAPID_KEYS.publicKey });
};

// Controlador para listar suscriptores
async function listarSuscriptores(req, res) {
    try {
        const subscriptions = await loadSubscriptions();
        res.json({ 
            total: subscriptions.length,
            subscriptions: subscriptions.map(sub => ({
                endpoint: sub.endpoint,
                fecha: sub.fecha || 'No disponible'
            }))
        });
    } catch (error) {
        console.error('Error al listar suscriptores:', error);
        res.status(500).json({ error: 'Error al listar suscriptores' });
    }
}

// Función para verificar si una suscripción existe en el servidor
exports.checkSubscription = async (req, res) => {
    try {
        const subscription = req.body;
        if (!subscription || !subscription.endpoint) {
            console.log('Suscripción inválida recibida');
            return res.status(400).json({ 
                success: false, 
                error: 'Suscripción inválida',
                exists: false 
            });
        }

        console.log('Verificando suscripción:', subscription.endpoint);
        
        if (!fs.existsSync(SUBS_FILE)) {
            console.log('Archivo de suscripciones no encontrado');
            return res.json({ 
                success: true,
                exists: false 
            });
        }

        const subscriptions = JSON.parse(await fs.promises.readFile(SUBS_FILE, 'utf-8'));
        const exists = subscriptions.some(sub => sub.endpoint === subscription.endpoint);
        console.log('Suscripción existe:', exists);
        
        res.json({ 
            success: true,
            exists: exists 
        });
    } catch (error) {
        console.error('Error al verificar suscripción:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error al verificar suscripción',
            exists: false 
        });
    }
};

exports.notificaciones = async (req, res) => {
    res.render('layout', { 
        title: 'Enviar Notificaciones',
        content: 'notificaciones'
    });
};

exports.listarSuscriptores = listarSuscriptores;
