const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../database/database');

// Clave secreta para JWT (en producción debería estar en variables de entorno)
const JWT_SECRET = 'tu_clave_secreta_super_segura_2024';
const JWT_EXPIRES_IN = '24h';

// Middleware para verificar token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Token de acceso requerido',
      message: 'Debes proporcionar un token de autenticación válido'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Token inválido',
        message: 'El token proporcionado no es válido o ha expirado'
      });
    }
    req.user = user;
    next();
  });
};

// POST /auth/register - Registrar nuevo usuario
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body;

    // Validaciones
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Datos incompletos',
        message: 'Los campos name, email y password son obligatorios'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Contraseña muy corta',
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Verificar si el email ya existe
    const existingUsers = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Email ya registrado',
        message: 'Ya existe una cuenta con este email'
      });
    }

    // Encriptar contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear usuario
    const result = await db.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: result.id, 
        email, 
        role,
        name 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: result.id,
          name,
          email,
          role
        },
        token,
        expiresIn: JWT_EXPIRES_IN
      },
      message: 'Usuario registrado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al registrar usuario',
      details: error.message
    });
  }
});

// POST /auth/login - Iniciar sesión
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Datos incompletos',
        message: 'Email y contraseña son obligatorios'
      });
    }

    // Buscar usuario
    const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos'
      });
    }

    const user = users[0];

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos'
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        name: user.name 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token,
        expiresIn: JWT_EXPIRES_IN
      },
      message: 'Inicio de sesión exitoso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al iniciar sesión',
      details: error.message
    });
  }
});

// GET /auth/profile - Obtener perfil del usuario autenticado
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const users = await db.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
        message: 'El usuario autenticado no existe en la base de datos'
      });
    }

    res.json({
      success: true,
      data: users[0],
      message: 'Perfil obtenido exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener perfil',
      details: error.message
    });
  }
});

// PUT /auth/profile - Actualizar perfil del usuario autenticado
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Datos incompletos',
        message: 'Name y email son obligatorios'
      });
    }

    // Verificar si el nuevo email ya existe (excepto el usuario actual)
    const existingUsers = await db.query(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, req.user.id]
    );
    
    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Email ya existe',
        message: 'Ya existe otro usuario con este email'
      });
    }

    await db.run(
      'UPDATE users SET name = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, email, req.user.id]
    );

    res.json({
      success: true,
      data: {
        id: req.user.id,
        name,
        email,
        role: req.user.role
      },
      message: 'Perfil actualizado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al actualizar perfil',
      details: error.message
    });
  }
});

// POST /auth/change-password - Cambiar contraseña
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Datos incompletos',
        message: 'Contraseña actual y nueva contraseña son obligatorias'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Contraseña muy corta',
        message: 'La nueva contraseña debe tener al menos 6 caracteres'
      });
    }

    // Obtener usuario actual
    const users = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    // Verificar contraseña actual
    const isValidPassword = await bcrypt.compare(currentPassword, users[0].password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Contraseña actual incorrecta',
        message: 'La contraseña actual proporcionada no es correcta'
      });
    }

    // Encriptar nueva contraseña
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Actualizar contraseña
    await db.run(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedNewPassword, req.user.id]
    );

    res.json({
      success: true,
      message: 'Contraseña cambiada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al cambiar contraseña',
      details: error.message
    });
  }
});

// GET /auth/verify - Verificar si el token es válido
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user,
      tokenValid: true
    },
    message: 'Token válido'
  });
});

// Exportar middleware para usar en otras rutas
module.exports = {
  router,
  authenticateToken
};