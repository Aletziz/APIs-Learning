const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');

// Importar rutas
const apiRoutes = require('./routes/api');
const { router: authRoutes } = require('./routes/auth');
const tutorialRoutes = require('./routes/tutorials');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 requests por ventana de tiempo
});
app.use('/api/', limiter);

// CORS
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [process.env.FRONTEND_URL || 'https://your-app-name.onrender.com']
  : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:8080'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Rutas de la API
app.use('/api', apiRoutes);
app.use('/auth', authRoutes);
app.use('/tutorials', tutorialRoutes);

// Ruta principal - servir el frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Manejo de errores 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    message: 'La ruta solicitada no existe en esta API',
    availableEndpoints: {
      'GET /': 'Página principal',
      'GET /api/users': 'Lista de usuarios',
      'GET /api/products': 'Lista de productos',
      'POST /api/users': 'Crear usuario',
      'GET /tutorials': 'Tutoriales disponibles'
    }
  });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: 'Algo salió mal en el servidor'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`📚 Plataforma de Aprendizaje de APIs iniciada`);
  console.log(`🔗 Frontend disponible en: http://localhost:${PORT}`);
  console.log(`🔗 API disponible en: http://localhost:${PORT}/api`);
});

module.exports = app;