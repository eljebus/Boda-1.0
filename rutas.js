const express = require('express');
const controlador = require('./controladores/mainControler.js');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const multer = require('multer');

// Configura Cloudinary
cloudinary.config({
  cloud_name: 'drbrixx6j',
  api_key: '567499117882323',
  api_secret: 'uMvjfUSl13P3incKZ_oJGx9Mi1Q'
});

// Configuración de multer para cargar archivos de forma temporal si es necesario
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Configura las rutas
const router = express.Router();

// Rutas de escuela
router.get('/', controlador.index);
router.get('/plan', controlador.plan);
router.get('/album', controlador.album);
router.get('/textos', controlador.textos);
router.get('/notificaciones', controlador.notificaciones);

// Ruta para subir foto a Cloudinary
router.post('/subir-foto', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se proporcionó ningún archivo' });
    }

    const b4 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = 'data:' + req.file.mimetype + ';base64,' + b4;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'Fotos',
      resource_type: 'auto'
    });

    res.json({ 
      url: result.secure_url,
      message: 'Imagen subida exitosamente'
    });

  } catch (err) {
    console.error('Error al subir imagen:', err);
    res.status(500).json({ 
      message: 'Error al subir la imagen',
      error: err.message 
    });
  }
});

router.post('/guardar-texto', controlador.saveText);
router.post('/save-subscription', controlador.savePushSubscription);
router.post('/send-notification', controlador.sendPushToAll);
router.post('/check-subscription', controlador.checkSubscription);

// Ruta para consultar la hora del servidor
router.get('/hora', (req, res) => {
  const fechaActual = new Date();
  res.json({
    fecha: fechaActual.toLocaleDateString('es-MX'),
    hora: fechaActual.toLocaleTimeString('es-MX'),
    fechaISO: fechaActual.toISOString(),
    timestamp: fechaActual.getTime()
  });
});

router.get('/api/vapid-public-key', controlador.getVapidPublicKey);

// Nueva ruta para verificar la fecha
router.get('/api/verificar-fecha', controlador.verificarFecha);

module.exports = router;